"""
AquaIntelli Enterprise v3 — Prometheus Metrics Service
"""
import time
import logging
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

logger = logging.getLogger(__name__)

try:
    from prometheus_client import (
        Counter, Histogram, Gauge,
        generate_latest, CONTENT_TYPE_LATEST,
    )
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    logger.warning("prometheus-client not installed — metrics disabled.")

if PROMETHEUS_AVAILABLE:
    HTTP_REQUESTS_TOTAL = Counter(
        "aquaintelli_http_requests_total",
        "Total HTTP requests",
        ["method", "endpoint", "status_code", "tenant_id"],
    )
    HTTP_REQUEST_DURATION = Histogram(
        "aquaintelli_http_request_duration_seconds",
        "HTTP request duration",
        ["method", "endpoint"],
        buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    )
    HTTP_REQUESTS_IN_FLIGHT = Gauge(
        "aquaintelli_http_requests_in_flight",
        "In-flight requests",
    )
    CACHE_HITS = Counter("aquaintelli_cache_hits_total", "Cache hits", ["cache_type"])
    CACHE_MISSES = Counter("aquaintelli_cache_misses_total", "Cache misses", ["cache_type"])
    ML_INFERENCE_DURATION = Histogram(
        "aquaintelli_ml_inference_duration_seconds",
        "ML inference time",
        ["model_name", "model_version"],
        buckets=[0.05, 0.1, 0.5, 1.0, 5.0, 30.0],
    )
    ML_INFERENCE_TOTAL = Counter(
        "aquaintelli_ml_inference_total",
        "ML inference requests",
        ["model_name", "status"],
    )
    ESG_REPORTS_GENERATED = Counter(
        "aquaintelli_esg_reports_generated_total",
        "ESG reports generated",
        ["framework", "tenant_id"],
    )
    SENSOR_READINGS_INGESTED = Counter(
        "aquaintelli_sensor_readings_total",
        "IoT sensor readings ingested",
        ["aquifer_id", "sensor_type"],
    )
    API_LATENCY_SLA = Histogram(
        "aquaintelli_api_latency_sla_seconds",
        "API latency vs SLA",
        ["tier"],
        buckets=[0.05, 0.1, 0.25, 0.5, 1.0, 2.5],
    )


class PrometheusMiddleware(BaseHTTPMiddleware):
    EXCLUDED = {"/metrics", "/health", "/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not PROMETHEUS_AVAILABLE or request.url.path in self.EXCLUDED:
            return await call_next(request)

        import re
        path = re.sub(
            r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|/\d+',
            '/{id}', request.url.path
        )
        tenant_id = request.headers.get("X-Tenant-ID", "unknown")
        HTTP_REQUESTS_IN_FLIGHT.inc()
        start = time.perf_counter()
        status_code = "500"
        try:
            response = await call_next(request)
            status_code = str(response.status_code)
            return response
        finally:
            duration = time.perf_counter() - start
            HTTP_REQUESTS_IN_FLIGHT.dec()
            HTTP_REQUESTS_TOTAL.labels(request.method, path, status_code, tenant_id).inc()
            HTTP_REQUEST_DURATION.labels(request.method, path).observe(duration)
            API_LATENCY_SLA.labels("standard").observe(duration)


def record_cache_hit(cache_type: str = "redis") -> None:
    if PROMETHEUS_AVAILABLE:
        CACHE_HITS.labels(cache_type).inc()


def record_cache_miss(cache_type: str = "redis") -> None:
    if PROMETHEUS_AVAILABLE:
        CACHE_MISSES.labels(cache_type).inc()


def record_ml_inference(model_name: str, model_version: str, duration: float, success: bool = True) -> None:
    if PROMETHEUS_AVAILABLE:
        ML_INFERENCE_DURATION.labels(model_name, model_version).observe(duration)
        ML_INFERENCE_TOTAL.labels(model_name, "success" if success else "error").inc()


def record_esg_report(framework: str, tenant_id: str) -> None:
    if PROMETHEUS_AVAILABLE:
        ESG_REPORTS_GENERATED.labels(framework, tenant_id).inc()


def get_metrics_response() -> Response:
    if not PROMETHEUS_AVAILABLE:
        return Response("# prometheus-client not installed\n", media_type="text/plain")
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
