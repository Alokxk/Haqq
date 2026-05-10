import uuid
import psycopg2
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

DATABASE_URL = "postgresql://postgres:postgres@localhost/haqq"


class FeedbackRequest(BaseModel):
    situation_id: str
    rating: int  # 1 = helpful, -1 = not helpful


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    if request.rating not in (1, -1):
        raise HTTPException(
            status_code=400, detail="Rating must be 1 (helpful) or -1 (not helpful)"
        )

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM situations WHERE id = %s", (request.situation_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Situation not found")

        feedback_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO feedback (id, situation_id, rating)
            VALUES (%s, %s, %s)
            """,
            (feedback_id, request.situation_id, request.rating),
        )
        conn.commit()

        return {"feedback_id": feedback_id, "status": "recorded"}
    finally:
        conn.close()


@router.get("/feedback/stats")
async def feedback_stats():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                COUNT(*) FILTER (WHERE rating = 1) as helpful,
                COUNT(*) FILTER (WHERE rating = -1) as not_helpful,
                COUNT(*) as total
            FROM feedback
        """)
        row = cursor.fetchone()
        helpful, not_helpful, total = row
        return {
            "total": total,
            "helpful": helpful,
            "not_helpful": not_helpful,
            "helpful_pct": round(helpful / total * 100, 1) if total > 0 else 0,
        }
    finally:
        conn.close()
