from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config.settings import settings
from db.postgres import init_db
from db.redis import ping_redis
from handlers.analyze import router as analyze_router
from handlers.debug import router as debug_router
from handlers.draft import router as draft_router
from handlers.examples import router as examples_router

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Haqq",
    description="The law is public. A lawyer isn't free. Haqq is.",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(examples_router)
app.include_router(debug_router)
app.include_router(draft_router)


@app.get("/health")
async def health():
    redis_ok = ping_redis()
    return {
        "status": "ok",
        "db": "ok",
        "redis": "ok" if redis_ok else "unavailable",
    }


@app.get("/health/detailed")
async def health_detailed():
    redis_ok = ping_redis()
    return {
        "status": "ok",
        "db": "ok",
        "redis": "ok" if redis_ok else "unavailable",
        "corpus_chunks": 0,
        "last_ingest": None,
        "redis_queue_depth": 0,
    }
