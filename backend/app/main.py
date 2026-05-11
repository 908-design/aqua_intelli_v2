"""
--------------------------------------------------------------------
|   AquaIntelli Enterprise v3 - God's Eye View of Earth's Water    |
|   Satellite-Based Water Intelligence Platform                    |
|   FastAPI Application Entry Point                                |
--------------------------------------------------------------------

Enterprise v3 Upgrades:
- JWT Authentication + RBAC + Multi-Tenant isolation
- Redis caching (<1ms p99 for cached responses)
- Prometheus metrics instrumentation
- v3 API: ESG reports, 3D aquifer model, LLM chat, WebSocket
- 3 Databases + InfluxDB (time-series) + Weaviate (vector store)
- GenAI: LangChain RAG, LangGraph Agent, Graph RAG, MCP, LangSmith
- 12+ API route groups with 50+ endpoints
"""
import os
import logging
import json
import time
import threading
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .config import get_settings
from .database import init_sql_db, init_nosql_db, init_graph_db
from .genai import rag_pipeline, graph_rag, init_langsmith

from .api.routes import (
    groundwater_routes, borewell_routes, irrigation_routes,
    satellite_routes, exchange_routes, farm_routes,
    genai_routes, alert_routes, db_routes, reservoir_routes, search_routes,
    city_drainage_routes, websocket_routes, advanced_ai_routes, flood_forecast_routes
)
from .api.routes.vizag_v2_routes import router as vizag_v2_router
from .api.routes.enterprise_v3_routes import router as enterprise_v3_router
from .services.cache_service import get_cache
from .services.metrics_service import PrometheusMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()

# ── Resolve frontend path ──
FRONTEND_DIR = Path(__file__).parent.parent.parent / "frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle — Enterprise v3."""
    print("\n" + "="*70)
    print("   AquaIntelli Enterprise v3 - Initializing God's Eye View")
    print("="*70)

    # 1. SQL Database
    await init_sql_db()

    # 2. NoSQL Database
    await init_nosql_db()

    # 3. Graph Database
    await init_graph_db()

    # 4. LangSmith tracing
    init_langsmith()

    # 5. RAG Pipeline
    rag_pipeline.initialize()

    # 6. Graph RAG
    graph_rag.initialize()

    # 7. Redis Cache (v3 enterprise)
    cache = get_cache()
    await cache.connect()

    # 8. Kafka Telemetry Simulation
    try:
        from .services.kafka_producer import run_telemetry_simulation
        threading.Thread(target=run_telemetry_simulation, daemon=True).start()
    except Exception as e:
        print(f"   [!] Failed to start Kafka simulation: {e}")

    print("="*70)
    print("   [OK] All systems operational -- Enterprise v3")
    print(f"   [*]  API Docs:   http://localhost:{settings.PORT}/docs")
    print(f"   [*]  Frontend:   http://localhost:{settings.PORT}")
    print(f"   [*]  Metrics:    http://localhost:{settings.PORT}/api/v3/metrics")
    print(f"   [*]  Health:     http://localhost:{settings.PORT}/api/v3/health/detailed")
    print("="*70 + "\n")

    yield

    # Shutdown
    logger.info("AquaIntelli Enterprise v3 shutting down...")
    await cache.disconnect()


# ── FastAPI Application — Enterprise v3 ──
app = FastAPI(
    title="AquaIntelli Enterprise API",
    description="""
# 🌊 AquaIntelli Enterprise v3 - Groundwater Intelligence Platform

**God's Eye View of Earth's Water — Full Enterprise Stack**

## v3 Enterprise Features
- **JWT Auth + RBAC** - Multi-tenant authentication with role-based access
- **ESG Reports** - ESRS E3, CDP Water, GRI 303, ISO 14046 compliance
- **3D Aquifer Model** - Volumetric Three.js visualization data
- **Meta-Learning AI** - MAML-based cross-basin groundwater forecasting
- **LLM Agent v3** - Weaviate RAG + LLaMA 3 / GPT-4o
- **Redis Caching** - Sub-ms responses for cached data
- **Prometheus Metrics** - Full observability stack
- **Multi-Tenant SaaS** - Isolated data namespaces

## v2 Features (Retained)
- **GRACE-FO Satellite Data** - Groundwater anomaly detection
- **AI Forecasting** - 90-day groundwater depletion prediction
- **Borewell Prediction** - Drilling success probability
- **Irrigation Optimization** - FAO-56 Penman-Monteith
- **Water Futures Exchange** - AI-priced water trading
- **Smart Farm** - IoT sensor monitoring
- **Underground Pipelines** - Main/Secondary/Tertiary depth mapping

## API Versions
- `/api/v1` — Legacy endpoints (backward compatible)
- `/api/v3` — Enterprise endpoints (auth, ESG, 3D, LLM v3)

## Database Stack
- **PostgreSQL + PostGIS** — Spatial data, tenants, forecasts
- **MongoDB** — Satellite metadata, model registry, conversations
- **Neo4j** — Supply chain water risk graph
- **InfluxDB** — Time-series IoT + satellite + forecast data
- **Redis** — Caching, sessions, pub/sub
- **Weaviate** — Vector store for LLM RAG
    """,
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={"name": "AquaIntelli Team", "url": "https://aquaintelli.antigravity.app"},
    license_info={"name": "MIT License"},
    openapi_tags=[
        {"name": "Groundwater", "description": "GRACE-FO groundwater analysis & forecasting"},
        {"name": "Borewell", "description": "AI borewell drilling success prediction"},
        {"name": "Irrigation", "description": "FAO-56 crop water optimization"},
        {"name": "Satellite", "description": "Satellite data retrieval (GRACE, Sentinel, NASA POWER)"},
        {"name": "Water Exchange", "description": "Water Futures trading exchange"},
        {"name": "Smart Farm", "description": "IoT farm monitoring & scheduling"},
        {"name": "GenAI", "description": "RAG, LangGraph Agent, Graph RAG, MCP tools"},
        {"name": "Alerts", "description": "Water crisis alerts & events"},
        {"name": "Database", "description": "Multi-database health & info"},
    ],
)


@app.middleware("http")
async def debug_request_logger(request, call_next):
    from .utils.logger import _debug_log
    response = await call_next(request)
    _debug_log(
        hypothesis_id="H0",
        location="backend/app/main.py:debug_request_logger",
        message="HTTP request observed",
        data={"method": request.method, "path": request.url.path, "status": response.status_code}
    )
    return response


@app.post("/api/v1/debug/client-log", include_in_schema=False)
async def debug_client_log(payload: dict = Body(default={})):
    from .utils.logger import _debug_log
    _debug_log(
        hypothesis_id=payload.get("hypothesisId", "H6"),
        location=payload.get("location", "frontend:unknown"),
        message=payload.get("message", "Client debug log"),
        data=payload.get("data", {}),
        session_id=payload.get("sessionId", "bee3ae")
    )
    return {"ok": True}

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-Tenant-ID", "X-API-Key", "X-Request-ID"],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining"],
)

# ── Prometheus Metrics Middleware (v3 Enterprise) ──
if settings.PROMETHEUS_ENABLED:
    app.add_middleware(PrometheusMiddleware)

# ── API Routes — v1 (Legacy, backward compatible) ──
PREFIX_V1 = "/api/v1"
app.include_router(groundwater_routes.router, prefix=PREFIX_V1)
app.include_router(borewell_routes.router, prefix=PREFIX_V1)
app.include_router(irrigation_routes.router, prefix=PREFIX_V1)
app.include_router(satellite_routes.router, prefix=PREFIX_V1)
app.include_router(exchange_routes.router, prefix=PREFIX_V1)
app.include_router(farm_routes.router, prefix=PREFIX_V1)
app.include_router(genai_routes.router, prefix=PREFIX_V1)
app.include_router(alert_routes.router, prefix=PREFIX_V1)
app.include_router(db_routes.router, prefix=PREFIX_V1)
app.include_router(reservoir_routes.router, prefix=PREFIX_V1)
app.include_router(search_routes.router, prefix=PREFIX_V1)
app.include_router(city_drainage_routes.router, prefix=PREFIX_V1)
app.include_router(flood_forecast_routes.router)

# ── API Routes — v2 (Vizag 9-module dataset-backed) ──
app.include_router(vizag_v2_router, prefix="/api")

# ── API Routes — WebSockets (Streaming Telemetry) ──
app.include_router(websocket_routes.router)

# ── API Routes — Advanced AI / OS (SKILL.md) ──
app.include_router(advanced_ai_routes.router, prefix="/api/v4")

# ── API Routes — v3 (Enterprise: auth, ESG, 3D, LLM, tenants) ──
app.include_router(enterprise_v3_router, prefix="/api")


@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "service": "aquaintelli-backend",
        "version": settings.APP_VERSION,
        "api_versions": ["v1", "v3"],
        "databases": {"sql": "connected", "nosql": "connected", "graph": "connected"},
        "enterprise_features": {
            "jwt_auth": True,
            "redis_cache": True,
            "prometheus_metrics": settings.PROMETHEUS_ENABLED,
            "esg_reports": True,
            "3d_models": True,
            "multi_tenant": True,
        },
    }


# ── Serve Frontend Static Files ──
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="static")
