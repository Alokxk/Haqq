import asyncio
import uuid

import psycopg2
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config.settings import settings

router = APIRouter()


class FeedbackRequest(BaseModel):
    situation_id: str
    rating: int  # 1 = helpful, -1 = not helpful


def _insert_feedback(situation_id: str, rating: int) -> str | None:
    conn = psycopg2.connect(settings.database_url)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM situations WHERE id = %s", (situation_id,))
        if not cursor.fetchone():
            return None
        feedback_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO feedback (id, situation_id, rating) VALUES (%s, %s, %s)",
            (feedback_id, situation_id, rating),
        )
        conn.commit()
        return feedback_id
    finally:
        conn.close()


def _fetch_stats() -> dict:
    conn = psycopg2.connect(settings.database_url)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                COUNT(*) FILTER (WHERE rating = 1) as helpful,
                COUNT(*) FILTER (WHERE rating = -1) as not_helpful,
                COUNT(*) as total
            FROM feedback
        """)
        helpful, not_helpful, total = cursor.fetchone()
        return {
            "total": total,
            "helpful": helpful,
            "not_helpful": not_helpful,
            "helpful_pct": round(helpful / total * 100, 1) if total > 0 else 0,
        }
    finally:
        conn.close()


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    if request.rating not in (1, -1):
        raise HTTPException(
            status_code=400, detail="Rating must be 1 (helpful) or -1 (not helpful)"
        )

    feedback_id = await asyncio.to_thread(
        _insert_feedback, request.situation_id, request.rating
    )
    if feedback_id is None:
        raise HTTPException(status_code=404, detail="Situation not found")

    return {"feedback_id": feedback_id, "status": "recorded"}


@router.get("/feedback/stats")
async def feedback_stats():
    return await asyncio.to_thread(_fetch_stats)
