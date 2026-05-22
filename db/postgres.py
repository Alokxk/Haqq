from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

from config.settings import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    echo=settings.environment == "development",
)


async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
