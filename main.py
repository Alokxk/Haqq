from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config.settings import settings
from handlers.analyze import router as analyze_router
from handlers.debug import router as debug_router
from handlers.examples import router as examples_router
from handlers.feedback import router as feedback_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Haqq",
    description="The law is public. A lawyer isn't free. Haqq is.",
    version="0.1.0",
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
app.include_router(feedback_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
