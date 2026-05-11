"""
AquaIntelli Enterprise v3 — Application Configuration
Centralizes all environment variables and settings.
Version: 3.0.0 (upgraded from MVP v2)
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Server ──────────────────────────────────────────────────────────
    APP_NAME: str = "AquaIntelli"
    APP_VERSION: str = "3.0.0"
    APP_ENV: str = "development"          # development | staging | production
    DEBUG: bool = True
    PORT: int = 8001
    WORKERS: int = 4                      # Gunicorn worker count

    # ── CORS (restrict in production) ────────────────────────────────────
    CORS_ORIGINS: str = "*"               # Comma-separated list or "*"

    # ── SQL Database (SQLite local dev → PostgreSQL+PostGIS production) ──
    SQL_DATABASE_URL: str = "sqlite+aiosqlite:///./aquaintelli.db"

    # ── NoSQL Database (MongoDB) ─────────────────────────────────────────
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "aquaintelli"
    MONGO_MOCK: bool = True              # Set False when MongoDB is available

    # ── Neo4j Graph Database (supply chain graph) ────────────────────────
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "aquaintelli"
    NEO4J_MOCK: bool = True

    # ── Redis (Caching + Sessions + Pub/Sub) — v3 Enterprise ─────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL_DEFAULT: int = 300       # 5 minutes
    REDIS_CACHE_TTL_FORECAST: int = 3600    # 1 hour
    REDIS_CACHE_TTL_REALTIME: int = 30      # 30 seconds
    REDIS_MAX_CONNECTIONS: int = 20

    # ── InfluxDB (Time-Series: IoT sensors + forecasts) — v3 Enterprise ──
    INFLUXDB_URL: str = "http://localhost:8086"
    INFLUXDB_TOKEN: str = "aquaintelli-influx-token-dev"
    INFLUXDB_ORG: str = "aquaintelli"
    INFLUXDB_BUCKET_SENSORS: str = "sensors"
    INFLUXDB_BUCKET_FORECASTS: str = "forecasts"
    INFLUXDB_BUCKET_PIPELINES: str = "pipelines"

    # ── Weaviate (Vector Store for LLM RAG) — v3 Enterprise ─────────────
    WEAVIATE_URL: str = "http://localhost:8080"
    WEAVIATE_API_KEY: str = ""
    WEAVIATE_CLASS_NAME: str = "AquaIntelli_Knowledge"

    # ── JWT Authentication — v3 Enterprise ───────────────────────────────
    JWT_SECRET: str = "aquaintelli-enterprise-jwt-CHANGE-IN-PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TTL_MINUTES: int = 60
    JWT_REFRESH_TTL_DAYS: int = 30

    # ── Rate Limiting — v3 Enterprise ────────────────────────────────────
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 1000
    RATE_LIMIT_BURST: int = 50

    # ── Multi-Tenant — v3 Enterprise ─────────────────────────────────────
    DEFAULT_TENANT_ID: str = "default"
    MAX_TENANTS: int = 1000
    TENANT_ISOLATION: bool = True

    # ── NASA EarthData ───────────────────────────────────────────────────
    EARTHDATA_TOKEN: str = ""
    EARTHDATA_USERNAME: str = ""

    # ── Google Earth Engine ───────────────────────────────────────────────
    GEE_PROJECT: str = ""
    GEE_SERVICE_ACCOUNT: str = ""
    GEE_KEY_PATH: str = "configs/gee_credentials.json"

    # ── OpenWeatherMap ────────────────────────────────────────────────────
    OPENWEATHER_API_KEY: str = ""

    # ── LLM / GenAI ───────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"             # or llama-3-70b for local
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_STORE_PATH: str = "data/vectorstore"
    LLM_MAX_TOKENS: int = 2048
    LLM_TEMPERATURE: float = 0.3

    # ── LangSmith ─────────────────────────────────────────────────────────
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "aquaintelli-v3"

    # ── ML / Forecast ─────────────────────────────────────────────────────
    ML_SERVICE_URL: str = "http://localhost:8082"  # Meta-learning inference service
    ML_MODEL_VERSION: str = "meta-lstm-v3"
    ML_INFERENCE_TIMEOUT_S: int = 30

    # ── Monitoring (Prometheus + Jaeger) — v3 Enterprise ─────────────────
    PROMETHEUS_ENABLED: bool = True
    JAEGER_HOST: str = "localhost"
    JAEGER_PORT: int = 6831
    SENTRY_DSN: str = ""

    # ── Object Storage (MinIO / S3) — v3 Enterprise ───────────────────────
    S3_ENDPOINT_URL: str = ""              # Empty = use AWS S3
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_BUCKET_MODELS: str = "aquaintelli-models"
    S3_BUCKET_REPORTS: str = "aquaintelli-reports"
    S3_BUCKET_DATA: str = "aquaintelli-data"

    # ── Data Paths ────────────────────────────────────────────────────────
    DATA_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"
    )
    CGWB_DATA_PATH: str = "data/cgwb/cgwb_district_gw_2022.json"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
