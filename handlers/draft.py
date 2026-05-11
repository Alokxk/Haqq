import asyncio
import pathlib
import uuid

import psycopg2
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from config.settings import settings
from db.redis import queue
from pipeline.notice_generator import NOTICE_GENERATORS

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

PDF_DIR = pathlib.Path("generated_notices")
PDF_DIR.mkdir(exist_ok=True)


class Sender(BaseModel):
    name: str
    address: str
    phone: str | None = None
    email: str | None = None


class Recipient(BaseModel):
    name: str
    address: str


class DraftRequest(BaseModel):
    situation_id: str | None = None
    notice_type: str
    sender: Sender
    recipient: Recipient
    extra: dict = {}


def generate_pdf_job(
    notice_id: str, notice_type: str, sender: dict, recipient: dict, extra: dict
):
    conn = psycopg2.connect(settings.sync_database_url)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT content FROM notices WHERE id = %s", (notice_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Notice {notice_id} not found")

        generator = NOTICE_GENERATORS.get(notice_type)
        if not generator:
            raise ValueError(f"Unknown notice type: {notice_type}")

        pdf_bytes = generator(
            sender=sender,
            recipient=recipient,
            **extra,
        )

        pdf_path = str(PDF_DIR / f"{notice_id}.pdf")
        pathlib.Path(pdf_path).write_bytes(pdf_bytes)

        cursor.execute(
            """
            UPDATE notices
            SET pdf_path = %s, pdf_ready = TRUE
            WHERE id = %s
            """,
            (pdf_path, notice_id),
        )
        conn.commit()

    except Exception as e:
        conn.rollback()
        cursor.execute(
            """
            INSERT INTO pdf_jobs (notice_id, status, error, completed_at)
            VALUES (%s, 'failed', %s, NOW())
            ON CONFLICT (notice_id) DO UPDATE
            SET status = 'failed', error = %s, completed_at = NOW()
            """,
            (notice_id, str(e), str(e)),
        )
        conn.commit()
        raise
    finally:
        conn.close()


def _build_notice_content(
    notice_type: str, sender: dict, recipient: dict, extra: dict
) -> str:
    templates = {
        "demand_notice": (
            "LEGAL NOTICE\n\n"
            f"From: {sender['name']}, {sender['address']}\n"
            f"To: {recipient['name']}, {recipient['address']}\n\n"
            "Subject: Demand Notice for Non-Payment of Wages\n\n"
            f"Amount Due: Rs. {extra.get('amount_due', 'N/A')}\n"
            f"Period: {extra.get('period_from', '')} to {extra.get('period_to', '')}"
        ),
        "rti_application": (
            "RTI APPLICATION\n\n"
            f"From: {sender['name']}, {sender['address']}\n"
            f"To: {recipient['name']}, {recipient['address']}\n\n"
            f"Information Sought: {extra.get('information_sought', '')}"
        ),
        "consumer_complaint": (
            "CONSUMER COMPLAINT NOTICE\n\n"
            f"From: {sender['name']}, {sender['address']}\n"
            f"To: {recipient['name']}, {recipient['address']}\n\n"
            f"Product: {extra.get('product_description', '')}\n"
            f"Defect: {extra.get('defect_description', '')}"
        ),
        "cheque_bounce_notice": (
            "CHEQUE BOUNCE NOTICE\n\n"
            f"From: {sender['name']}, {sender['address']}\n"
            f"To: {recipient['name']}, {recipient['address']}\n\n"
            f"Cheque No: {extra.get('cheque_number', '')}\n"
            f"Amount: Rs. {extra.get('cheque_amount', '')}"
        ),
    }
    return templates.get(notice_type, "Legal Notice")


def _insert_notice(
    notice_id: str, situation_id: str | None, notice_type: str, content: str
) -> None:
    conn = psycopg2.connect(settings.sync_database_url)
    try:
        cursor = conn.cursor()
        if situation_id:
            cursor.execute(
                "INSERT INTO notices (id, situation_id, notice_type, content) "
                "VALUES (%s, %s, %s, %s)",
                (notice_id, situation_id, notice_type, content),
            )
        else:
            cursor.execute(
                "INSERT INTO notices (id, notice_type, content) VALUES (%s, %s, %s)",
                (notice_id, notice_type, content),
            )
        cursor.execute(
            "INSERT INTO pdf_jobs (notice_id, status) VALUES (%s, 'queued')",
            (notice_id,),
        )
        conn.commit()
    finally:
        conn.close()


def _get_notice_download_status(notice_id: str) -> dict:
    conn = psycopg2.connect(settings.sync_database_url)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT pdf_path, pdf_ready FROM notices WHERE id = %s", (notice_id,)
        )
        row = cursor.fetchone()
        if not row:
            return {"found": False}
        pdf_path, pdf_ready = row
        if pdf_ready and pdf_path and pathlib.Path(pdf_path).exists():
            return {"found": True, "ready": True, "pdf_path": pdf_path}
        cursor.execute(
            "SELECT status, error FROM pdf_jobs WHERE notice_id = %s", (notice_id,)
        )
        job_row = cursor.fetchone()
        if job_row:
            status, error = job_row
            return {
                "found": True,
                "ready": False,
                "job_status": status,
                "job_error": error,
            }
        return {"found": True, "ready": False, "job_status": None, "job_error": None}
    finally:
        conn.close()


@router.post("/draft")
@limiter.limit("5/hour")
async def create_draft(request: Request, body: DraftRequest):
    if body.notice_type not in NOTICE_GENERATORS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid notice type. Choose from: {list(NOTICE_GENERATORS.keys())}",
        )

    notice_id = str(uuid.uuid4())
    content = _build_notice_content(
        body.notice_type,
        body.sender.model_dump(),
        body.recipient.model_dump(),
        body.extra,
    )

    await asyncio.to_thread(
        _insert_notice,
        notice_id,
        body.situation_id,
        body.notice_type,
        content,
    )

    job = queue.enqueue(
        generate_pdf_job,
        notice_id,
        body.notice_type,
        body.sender.model_dump(),
        body.recipient.model_dump(),
        body.extra,
        job_timeout=60,
    )

    return {
        "notice_id": notice_id,
        "pdf_job_id": job.id,
        "content": content,
    }


@router.get("/draft/{notice_id}/download")
async def download_draft(notice_id: str):
    status = await asyncio.to_thread(_get_notice_download_status, notice_id)

    if not status["found"]:
        raise HTTPException(status_code=404, detail="Notice not found")

    if status.get("ready"):
        return FileResponse(
            path=status["pdf_path"],
            media_type="application/pdf",
            filename=f"haqq_notice_{notice_id[:8]}.pdf",
        )

    if status.get("job_status") == "failed":
        raise HTTPException(
            status_code=500,
            detail={"status": "failed", "error": status["job_error"]},
        )

    return {"status": "processing"}
