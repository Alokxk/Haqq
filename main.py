from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings

app = FastAPI(
    title="Haqq",
    description="The law is public. A lawyer isn't free. Haqq is.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/detailed")
async def health_detailed():
    return {
        "status": "ok",
        "db": "not connected",
        "redis": "not connected",
        "corpus_chunks": 0,
        "last_ingest": None,
        "redis_queue_depth": 0,
    }