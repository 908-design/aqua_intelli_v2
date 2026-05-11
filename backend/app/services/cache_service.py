"""
AquaIntelli Enterprise v3 — Redis Caching Service
Sub-millisecond cache layer with TTL strategies for groundwater intelligence.
"""
import json
import logging
import hashlib
import functools
from typing import Any, Optional, Callable
from datetime import timedelta

logger = logging.getLogger(__name__)

# Try to import redis; fall back to a no-op cache for environments without Redis
try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("redis-py not installed — caching disabled. Run: pip install redis")


class CacheService:
    """
    Redis-backed async cache service.

    TTL Strategy (as per v3 spec):
    - Sensor readings (real-time IoT): 30s
    - Forecast results (AI expensive): 3600s (1h)
    - ESG report data: 86400s (24h)
    - Aquifer metadata: 300s (5min)
    - Pipeline segments: 600s (10min)
    - LLM chat responses: 0 (no cache — always fresh)
    """

    # TTL constants (seconds)
    TTL_REALTIME    = 30        # IoT sensor data
    TTL_FORECAST    = 3_600     # AI forecast results
    TTL_AQUIFER     = 300       # Aquifer metadata
    TTL_PIPELINE    = 600       # Pipeline segments
    TTL_ESG         = 86_400    # ESG report data (24h)
    TTL_SATELLITE   = 1_800     # Satellite pass data (30min)
    TTL_GROUNDWATER = 120       # Groundwater depth readings (2min)

    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self._url = redis_url
        self._client: Optional[Any] = None

    async def connect(self) -> None:
        """Establish Redis connection."""
        if not REDIS_AVAILABLE:
            logger.warning("Redis unavailable — using no-op cache")
            return
        try:
            self._client = aioredis.from_url(
                self._url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=True,
                max_connections=20,
            )
            await self._client.ping()
            logger.info(f"✅ Redis connected at {self._url}")
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}) — running without cache")
            self._client = None

    async def disconnect(self) -> None:
        if self._client:
            await self._client.close()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache. Returns None on miss or error."""
        if not self._client:
            return None
        try:
            raw = await self._client.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as e:
            logger.debug(f"Cache GET failed for {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = TTL_AQUIFER) -> bool:
        """Set value in cache with TTL (seconds)."""
        if not self._client:
            return False
        try:
            serialized = json.dumps(value, default=str)
            await self._client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.debug(f"Cache SET failed for {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        if not self._client:
            return False
        try:
            await self._client.delete(key)
            return True
        except Exception as e:
            logger.debug(f"Cache DEL failed for {key}: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a glob pattern. Returns count deleted."""
        if not self._client:
            return 0
        try:
            keys = await self._client.keys(pattern)
            if keys:
                return await self._client.delete(*keys)
            return 0
        except Exception as e:
            logger.debug(f"Cache DEL pattern {pattern} failed: {e}")
            return 0

    async def exists(self, key: str) -> bool:
        if not self._client:
            return False
        try:
            return bool(await self._client.exists(key))
        except Exception:
            return False

    async def ttl(self, key: str) -> int:
        """Get remaining TTL (seconds). Returns -2 if key doesn't exist."""
        if not self._client:
            return -2
        try:
            return await self._client.ttl(key)
        except Exception:
            return -2

    async def info(self) -> dict:
        """Get Redis server info for health checks."""
        if not self._client:
            return {"status": "unavailable"}
        try:
            info = await self._client.info("stats")
            memory = await self._client.info("memory")
            return {
                "status": "connected",
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "memory_used_mb": round(int(memory.get("used_memory", 0)) / 1024 / 1024, 2),
                "connected_clients": info.get("connected_clients", 0),
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    # ─── Convenience Key Builders ─────────────────────────────────────────
    @staticmethod
    def key_forecast(aquifer_id: str, days: int, model: str = "v3") -> str:
        return f"forecast:{aquifer_id}:{days}:{model}"

    @staticmethod
    def key_aquifer_metrics(aquifer_id: str) -> str:
        return f"aquifer:metrics:{aquifer_id}"

    @staticmethod
    def key_pipeline(aquifer_id: str, pipe_type: str = "all") -> str:
        return f"pipeline:{aquifer_id}:{pipe_type}"

    @staticmethod
    def key_sensor(sensor_id: str) -> str:
        return f"sensor:realtime:{sensor_id}"

    @staticmethod
    def key_esg(tenant_id: str, framework: str, period: str) -> str:
        return f"esg:{tenant_id}:{framework}:{period}"

    @staticmethod
    def key_3d_model(aquifer_id: str, resolution: str = "medium") -> str:
        return f"3d_model:{aquifer_id}:{resolution}"

    @staticmethod
    def key_llm_session(session_id: str) -> str:
        return f"llm:session:{session_id}"

    @staticmethod
    def make_hash_key(*args) -> str:
        """Create deterministic hash key from multiple arguments."""
        combined = ":".join(str(a) for a in args)
        return hashlib.md5(combined.encode()).hexdigest()


# ─── Singleton instance ──────────────────────────────────────────────────
_cache: Optional[CacheService] = None


def get_cache() -> CacheService:
    global _cache
    if _cache is None:
        try:
            from ..config import get_settings  # backend.app.config
            settings = get_settings()
            redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
        except Exception:
            redis_url = "redis://localhost:6379/0"
        _cache = CacheService(redis_url)
    return _cache


def cached(ttl: int = CacheService.TTL_AQUIFER, key_prefix: str = ""):
    """
    Async function decorator for Redis caching.

    Usage:
        @cached(ttl=CacheService.TTL_FORECAST, key_prefix="forecast")
        async def get_forecast(aquifer_id: str, days: int) -> dict:
            ...
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            cache = get_cache()
            # Build cache key from function name + args
            key_parts = [key_prefix or func.__name__] + [str(a) for a in args] + \
                        [f"{k}={v}" for k, v in sorted(kwargs.items())]
            cache_key = ":".join(key_parts)

            # Cache hit
            result = await cache.get(cache_key)
            if result is not None:
                return result

            # Cache miss — execute function
            result = await func(*args, **kwargs)
            if result is not None:
                await cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator
