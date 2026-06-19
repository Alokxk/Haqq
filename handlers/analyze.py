import asyncio
import hashlib
import json
import logging
import time
import uuid

import psycopg2
from fastapi import APIRouter, HTTPException, Request
from pgvector.psycopg2 import register_vector
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from config.settings import settings
from db.cache import cache_get, cache_set
from pipeline.analyzer import analyze, fallback_response
from pipeline.classifier import classify
from pipeline.retriever import retrieve

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

DISCLAIMER = (
    "This is not legal advice. For court proceedings or complex matters, "
    "consult a registered advocate."
)


class AnalyzeRequest(BaseModel):
    text: str
    state: str | None = None


def _cache_key(text: str, state: str | None) -> str:
    normalized = " ".join(text.lower().split())
    raw = f"{state or ''}:{normalized}"
    return "haqq:analyze:" + hashlib.sha256(raw.encode()).hexdigest()


def _save_situation(
    session_id: str,
    raw_input: str,
    domain: str | None,
    sub_domain: str | None,
    state: str | None,
    analysis: dict,
    laws_cited: list[str],
    confidence: str,
    top_score: float,
    fallback: bool,
    query_embedding: list[float] | None = None,
) -> str:
    situation_id = str(uuid.uuid4())
    conn = psycopg2.connect(settings.database_url)
    try:
        cursor = conn.cursor()
        register_vector(conn)
        cursor.execute(
            """
            INSERT INTO situations (
                id, session_id, raw_input, language, domain, sub_domain,
                state, analysis, laws_cited, confidence, top_score, fallback,
                query_embedding
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                situation_id,
                session_id,
                raw_input,
                "en",
                domain,
                sub_domain,
                state,
                json.dumps(analysis),
                laws_cited,
                confidence,
                top_score,
                fallback,
                query_embedding,
            ),
        )
        conn.commit()
    finally:
        conn.close()
    return situation_id


def _fetch_situation(situation_id: str) -> tuple | None:
    conn = psycopg2.connect(settings.database_url)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT analysis, confidence, top_score, fallback, domain, sub_domain, state "
            "FROM situations WHERE id = %s",
            (situation_id,),
        )
        return cursor.fetchone()
    finally:
        conn.close()


@router.post("/analyze")
@limiter.limit("10/hour")
async def analyze_situation(request: Request, body: AnalyzeRequest):
    start_time = time.time()
    session_id = str(uuid.uuid4())
    request_id = str(uuid.uuid4())[:8]

    cache_key = _cache_key(body.text, body.state)
    cached = cache_get(cache_key)
    if cached:
        logger.info(json.dumps({
            "request_id": request_id,
            "cached": True,
            "duration_ms": int((time.time() - start_time) * 1000),
        }))
        return {**cached, "cached": True}

    classification = await asyncio.to_thread(classify, body.text)

    retrieval = await asyncio.to_thread(
        retrieve,
        query_text=body.text,
        domain=classification.domain if classification.confidence != "low" else None,
        state=body.state
        or (classification.state if classification.confidence != "low" else None),
        classification_confidence=classification.confidence,
    )

    chunks = retrieval["chunks"]
    confidence = retrieval["confidence"]
    top_score = retrieval["top_score"]
    is_fallback = retrieval["fallback"]
    query_vector = retrieval["query_vector"]

    if is_fallback:
        situation_id = await asyncio.to_thread(
            _save_situation,
            session_id, body.text, classification.domain, classification.sub_domain,
            body.state, {}, [], "low", top_score, True, query_vector,
        )
        logger.info(json.dumps({
            "request_id": request_id,
            "fallback": True,
            "top_score": top_score,
            "duration_ms": int((time.time() - start_time) * 1000),
        }))
        return {
            **fallback_response(),
            "situation_id": situation_id,
            "cached": False,
            "share_url": f"{settings.public_url}/s/{situation_id}",
            "disclaimer": DISCLAIMER,
        }

    try:
        analysis_result = await asyncio.to_thread(
            analyze,
            situation=body.text,
            chunks=chunks,
            domain=classification.domain,
        )
    except ValueError as e:
        logger.warning(json.dumps({
            "request_id": request_id,
            "error": "analyzer_json_error",
            "detail": str(e),
            "duration_ms": int((time.time() - start_time) * 1000),
        }))
        situation_id = await asyncio.to_thread(
            _save_situation,
            session_id, body.text, classification.domain, classification.sub_domain,
            body.state, {}, [], "low", top_score, True, query_vector,
        )
        return {
            **fallback_response(),
            "situation_id": situation_id,
            "cached": False,
            "share_url": f"{settings.public_url}/s/{situation_id}",
            "disclaimer": DISCLAIMER,
        }

    laws_cited = [
        f"{law['act_short']}_{law['section']}" for law in analysis_result.laws
    ]

    situation_id = await asyncio.to_thread(
        _save_situation,
        session_id, body.text, classification.domain, classification.sub_domain,
        body.state, analysis_result.model_dump(), laws_cited,
        confidence, top_score, False, query_vector,
    )

    response = {
        "situation_id": situation_id,
        "share_url": f"{settings.public_url}/s/{situation_id}",
        "domain": classification.domain,
        "sub_domain": classification.sub_domain,
        "state": body.state or classification.state,
        "confidence": confidence,
        "top_score": round(top_score, 4),
        "confidence_reason": analysis_result.confidence_reason,
        "fallback": False,
        "cached": False,
        "rights": analysis_result.rights,
        "remedies": analysis_result.remedies,
        "laws": analysis_result.laws,
        "evidence_checklist": analysis_result.evidence_checklist,
        "disclaimer": DISCLAIMER,
    }

    cache_set(cache_key, response)

    logger.info(json.dumps({
        "request_id": request_id,
        "domain": classification.domain,
        "state": body.state,
        "confidence": confidence,
        "top_score": top_score,
        "fallback": False,
        "laws_cited": laws_cited,
        "duration_ms": int((time.time() - start_time) * 1000),
    }))

    return response


@router.get("/s/{situation_id}")
async def get_shared_situation(situation_id: str):
    row = await asyncio.to_thread(_fetch_situation, situation_id)

    if not row:
        raise HTTPException(status_code=404, detail="Situation not found")

    analysis, confidence, top_score, fallback, domain, sub_domain, state = row
    return {
        "situation_id": situation_id,
        "share_url": f"{settings.public_url}/s/{situation_id}",
        "domain": domain or "other",
        "sub_domain": sub_domain or "unknown",
        "state": state,
        "confidence": confidence,
        "top_score": float(top_score) if top_score else 0.0,
        "fallback": fallback,
        "cached": False,
        **(analysis if analysis else {}),
        "disclaimer": DISCLAIMER,
    }
