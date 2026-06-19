import threading
from cachetools import TTLCache

CACHE_TTL = 6 * 60 * 60  # 6 hours
_cache: TTLCache = TTLCache(maxsize=500, ttl=CACHE_TTL)
_lock = threading.Lock()


def cache_get(key: str):
    with _lock:
        return _cache.get(key)


def cache_set(key: str, value) -> None:
    with _lock:
        _cache[key] = value
