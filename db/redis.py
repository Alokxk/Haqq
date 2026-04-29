from redis import Redis
from rq import Queue

from config.settings import settings

redis_conn = Redis.from_url(settings.redis_url, decode_responses=False)
queue = Queue("haqq", connection=redis_conn)


def ping_redis() -> bool:
    try:
        return redis_conn.ping()
    except Exception:
        return False