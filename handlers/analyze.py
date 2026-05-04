import hashlib
import json
import logging
import time
import uuid
from datetime import datetime

import psycopg2
from fastapi import APIRouter, Request
from pydantic import BaseModel

from db.redis import redis_conn
from pipeline.classifier import classify
from pipeline.retriever import retrieve
from pipeline.analyzer import analyze, fallback_response

router = APIRouter()
logger = logging.getLogger(__name__)

DATABASE_URL = "postgresql://postgres:postgres@localhost/haqq"
CACHE_TTL = 6 * 60 * 60  # 6 hours

DISCLAIMER = (
    "This is not legal advice. For court proceedings or complex matters, "
    "consult a registered advocate."
)


class AnalyzeRequest(BaseModel):
    text: str
    language: str = "en"
    state: str | None = None


def _cache_key(text: str, language: str, state: str | None) -> str:
    normalized = " ".join(text.lower().split())
    raw = f"{language}:{state or ''}:{normalized}"
    return "haqq:analyze:" + hashlib.sha256(raw.encode()).hexdigest()


def _save_situation(
    session_id: str,
    raw_input: str,
    language: str,
    domain: str | None,
    sub_domain: str | None,
    state: str | None,
    analysis: dict,
    laws_cited: list[str],
    confidence: str,
    top_score: float,
    fallback: bool,
) -> str:
    situation_id = str(uuid.uuid4())
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO situations (
                id, session_id, raw_input, language, domain, sub_domain,
                state, analysis, laws_cited, confidence, top_score, fallback
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                situation_id,
                session_id,
                raw_input,
                language,
                domain,
                sub_domain,
                state,
                json.dumps(analysis),
                laws_cited,
                confidence,
                top_score,
                fallback,
            ),
        )
        conn.commit()
    finally:
        conn.close()
    return situation_id


@router.post("/analyze")
async def analyze_situation(request: AnalyzeRequest, http_request: Request):
    start_time = time.time()
    session_id = str(uuid.uuid4())
    request_id = str(uuid.uuid4())[:8]

    cache_key = _cache_key(request.text, request.language, request.state)
    cached = redis_conn.get(cache_key)
    if cached:
        response = json.loads(cached)
        response["cached"] = True
        logger.info(
            json.dumps(
                {
                    "request_id": request_id,
                    "cached": True,
                    "duration_ms": int((time.time() - start_time) * 1000),
                }
            )
        )
        return response

    # Step 1: Classify
    classification = classify(request.text, request.language)

    # Step 2: Retrieve
    retrieval = retrieve(
        query_text=request.text,
        domain=classification.domain if classification.confidence != "low" else None,
        state=request.state
        or (classification.state if classification.confidence != "low" else None),
        classification_confidence=classification.confidence,
    )

    chunks = retrieval["chunks"]
    confidence = retrieval["confidence"]
    top_score = retrieval["top_score"]
    is_fallback = retrieval["fallback"]

    # Step 3: Fallback check
    if is_fallback:
        response = fallback_response()
        response["situation_id"] = _save_situation(
            session_id=session_id,
            raw_input=request.text,
            language=request.language,
            domain=classification.domain,
            sub_domain=classification.sub_domain,
            state=request.state,
            analysis={},
            laws_cited=[],
            confidence="low",
            top_score=top_score,
            fallback=True,
        )
        response["cached"] = False
        response["share_url"] = f"https://haqq.in/s/{response['situation_id']}"
        response["disclaimer"] = DISCLAIMER

        logger.info(
            json.dumps(
                {
                    "request_id": request_id,
                    "fallback": True,
                    "top_score": top_score,
                    "duration_ms": int((time.time() - start_time) * 1000),
                }
            )
        )
        return response

    # Step 4: Analyze
    analysis = analyze(
        situation=request.text,
        chunks=chunks,
        domain=classification.domain,
        language=request.language,
    )

    laws_cited = [f"{law['act_short']}_{law['section']}" for law in analysis.laws]

    situation_id = _save_situation(
        session_id=session_id,
        raw_input=request.text,
        language=request.language,
        domain=classification.domain,
        sub_domain=classification.sub_domain,
        state=request.state,
        analysis=analysis.model_dump(),
        laws_cited=laws_cited,
        confidence=confidence,
        top_score=top_score,
        fallback=False,
    )

    response = {
        "situation_id": situation_id,
        "share_url": f"https://haqq.in/s/{situation_id}",
        "domain": classification.domain,
        "sub_domain": classification.sub_domain,
        "state": request.state or classification.state,
        "confidence": confidence,
        "top_score": round(top_score, 4),
        "confidence_reason": analysis.confidence_reason,
        "fallback": False,
        "cached": False,
        "rights": analysis.rights,
        "remedies": analysis.remedies,
        "laws": analysis.laws,
        "evidence_checklist": analysis.evidence_checklist,
        "disclaimer": DISCLAIMER,
    }

    redis_conn.setex(cache_key, CACHE_TTL, json.dumps(response))

    logger.info(
        json.dumps(
            {
                "request_id": request_id,
                "domain": classification.domain,
                "state": request.state,
                "confidence": confidence,
                "top_score": top_score,
                "fallback": False,
                "laws_cited": laws_cited,
                "duration_ms": int((time.time() - start_time) * 1000),
            }
        )
    )

    return response


@router.get("/s/{situation_id}")
async def get_shared_situation(situation_id: str):
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT analysis, confidence, top_score, fallback FROM situations WHERE id = %s",
            (situation_id,),
        )
        row = cursor.fetchone()
    finally:
        conn.close()

    if not row:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Situation not found")

    analysis, confidence, top_score, fallback = row
    return {
        "situation_id": situation_id,
        "confidence": confidence,
        "top_score": float(top_score) if top_score else 0.0,
        "fallback": fallback,
        **(analysis if analysis else {}),
        "disclaimer": DISCLAIMER,
    }
