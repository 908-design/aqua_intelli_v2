# AquaIntelli Enterprise v3 — Troubleshooting Runbook

## Quick Reference

| Issue | Section |
|---|---|
| Backend won't start | [§1 Backend Startup](#1-backend-startup) |
| Redis connection fails | [§2 Redis](#2-redis-cache) |
| JWT auth errors | [§3 Authentication](#3-authentication) |
| 3D viewer blank / WebGL | [§4 3D Viewer](#4-3d-viewer) |
| MAML training fails | [§5 Meta-Learning](#5-meta-learning) |
| ESG report generation | [§6 ESG Reports](#6-esg-reports) |
| Slow API (>100ms) | [§7 Performance](#7-performance-tuning) |
| Docker compose issues | [§8 Docker](#8-docker-compose) |
| Database migration | [§9 Databases](#9-database-issues) |
| Monitoring / Grafana | [§10 Monitoring](#10-monitoring-stack) |

---

## 1. Backend Startup

### ❌ `ImportError: No module named 'redis'`
```bash
pip install redis==5.0.4
```

### ❌ `ImportError: No module named 'pydantic_settings'`
```bash
pip install pydantic-settings==2.3.0
```

### ❌ `AttributeError: 'Settings' object has no attribute 'REDIS_URL'`
Config wasn't regenerated. **Fix:**
```bash
# Clear Python bytecache
find . -name "*.pyc" -delete && find . -name "__pycache__" -type d -exec rm -rf {} +
# Restart
uvicorn backend.app.main:app --reload --port 8001
```

### ❌ `EnterpriseV3Router: cannot import 'PrometheusMiddleware'`
Install prometheus-client:
```bash
pip install prometheus-client==0.20.0
```

### ❌ CORS errors on frontend requests
Set `CORS_ORIGINS=http://localhost:3000,http://localhost:8001` in `.env`

---

## 2. Redis Cache

### ❌ `ConnectionRefusedError: [Errno 111] Connect call failed`
Redis not running. **Fix:**
```bash
# Option A: Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Option B: docker-compose
docker-compose up -d redis
```

### ❌ Cache disabled warning in logs
If Redis fails to connect, the app falls back to no-op caching automatically. All endpoints still work — just no caching. This is expected in dev without Redis.

### Check Redis health
```bash
docker exec aquaintelli-redis redis-cli ping
# Expected: PONG

docker exec aquaintelli-redis redis-cli info stats | grep keyspace_hits
```

### ❌ Redis memory full (`OOM command not allowed`)
Increase `--maxmemory` or adjust eviction policy:
```bash
docker exec aquaintelli-redis redis-cli config set maxmemory 1gb
docker exec aquaintelli-redis redis-cli config set maxmemory-policy allkeys-lru
```

---

## 3. Authentication

### ❌ `401 Not authenticated` on v3 endpoints
Add Bearer token to request headers:
```bash
# Step 1: Get token
curl -X POST http://localhost:8001/api/v3/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Step 2: Use token
curl http://localhost:8001/api/v3/aquifers/hyd-ap-001/3d-model \
  -H "Authorization: Bearer <access_token>"
```

### ❌ `403 Missing permission: esg:write`
User role doesn't have the required permission. ESG write requires `admin` or higher.
Change user role to `admin` in the token request mock.

### ❌ `Token expired`
Access tokens expire in 60 minutes. Use the refresh endpoint:
```bash
curl -X POST http://localhost:8001/api/v3/auth/refresh \
  -d '{"refresh_token": "<your_refresh_token>"}'
```

### ❌ `Invalid token: PyJWT not installed`
```bash
pip install PyJWT==2.8.0
```

---

## 4. 3D Viewer

### ❌ Black screen / blank canvas
- Check browser console for WebGL errors
- Ensure hardware acceleration is enabled in your browser
- Try: `chrome://settings/system` → Enable hardware acceleration

### ❌ `THREE is not defined`
CDN import failed. Check internet connection, or switch to local import:
```html
<script src="/static/three.min.js"></script>
```

### ❌ Performance — FPS drops below 30
Reduce resolution in viewer controls: `Settings → Resolution: Low`
Or reduce the grid from 128×128 to 32×32 in the API call:
```
GET /api/v3/aquifers/hyd-ap-001/3d-model?resolution=low
```

### ❌ Pipelines not visible
Toggle layer visibility in viewer panel — ensure `Pipelines` toggle is ON.

---

## 5. Meta-Learning (MAML)

### ❌ `ModuleNotFoundError: No module named 'torch'`
```bash
pip install torch>=2.0.0
# For CPU only (faster install):
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### ❌ MAML training loss is NaN
- Reduce learning rates: `--meta-lr 0.0001 --inner-lr 0.01`
- Enable gradient clipping (already in code: `clip_grad_norm_`)
- Check for NaN in input data

### ❌ `RuntimeError: CUDA out of memory`
Train on CPU:
```bash
export CUDA_VISIBLE_DEVICES=""
python ml/maml_quickstart.py --basins ganga godavari --epochs 50
```

### Run quickstart (CPU, 5 basins, 50 epochs):
```bash
python ml/maml_quickstart.py \
  --basins ganga godavari krishna cauvery indus \
  --epochs 50 \
  --meta-lr 0.001 \
  --save-path ml/models
```

---

## 6. ESG Reports

### ❌ PDF export fails (`weasyprint not installed`)
```bash
pip install weasyprint==62.3
# On Windows, also install GTK:
# https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer
```

### ❌ ESG report returns 403
Add `esg:write` permission — requires `admin` role. See [§3 Auth](#3-authentication).

### Generate report via curl:
```bash
curl -X POST http://localhost:8001/api/v3/reports/esg \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "framework": "GRI-303",
    "reporting_period_start": "2025-01-01",
    "reporting_period_end": "2025-12-31",
    "aquifer_ids": ["hyd-ap-001"],
    "include_supply_chain": false,
    "export_format": "json"
  }'
```

---

## 7. Performance Tuning

### API latency > 100ms (breaking SLA)

**Check 1: Is Redis caching working?**
```bash
# Check cache hit rate in Prometheus:
# aquaintelli_cache_hits_total / (hits + misses)
curl http://localhost:9090/api/v1/query?query=rate(aquaintelli_cache_hits_total[5m])
```

**Check 2: DB query slowness**
```bash
# Enable PostgreSQL slow query log
ALTER SYSTEM SET log_min_duration_statement = '100';
SELECT pg_reload_conf();
```

**Check 3: Missing indexes**
```sql
-- Check for missing PostGIS indexes
SELECT schemaname, tablename, indexname FROM pg_indexes
WHERE tablename IN ('aquifers', 'sensors', 'pipelines');
```

**Quick wins:**
- Add Redis caching to all expensive endpoints (use `@cached()` decorator)
- Use `resolution=low` for 3D model if not rendering
- Precompute 30/90-day forecasts during off-peak hours

---

## 8. Docker Compose

### Start all services:
```bash
docker-compose up -d
# With Kafka:
docker-compose --profile kafka up -d
# With nginx proxy:
docker-compose --profile proxy up -d
```

### Check service health:
```bash
docker-compose ps
docker-compose logs -f backend
docker-compose logs --tail=50 postgres
```

### ❌ `port 5432 already in use`
```bash
# Find and kill the conflicting process
netstat -ano | findstr :5432    # Windows
lsof -i :5432                   # Linux/Mac
# Or change port in docker-compose.yml: "5433:5432"
```

### ❌ Postgres init script not running
Volume already initialized. Reset:
```bash
docker-compose down -v  # ⚠️ Destroys all data!
docker-compose up -d postgres
```

### Full reset (nuclear option):
```bash
docker-compose down -v --remove-orphans
docker volume prune -f
docker-compose up -d
```

---

## 9. Database Issues

### ❌ `relation "tenants" does not exist`
Run the init SQL manually:
```bash
docker exec -i aquaintelli-postgres \
  psql -U aqua -d aquaintelli < scripts/init_postgres.sql
```

### ❌ MongoDB mock mode producing wrong data
Set `MONGO_MOCK=false` and start real MongoDB:
```bash
docker-compose up -d mongo
```

### ❌ Neo4j connection timeout
The graph DB takes ~30s to warm up after first start:
```bash
docker-compose logs neo4j | tail -20
# Wait for: "Remote interface available at http://localhost:7474/"
```

---

## 10. Monitoring Stack

### Access dashboards:
| Service | URL | Credentials |
|---|---|---|
| Grafana | http://localhost:3000 | admin / aquaintelli |
| Prometheus | http://localhost:9090 | (none) |
| Jaeger UI | http://localhost:16686 | (none) |
| Neo4j Browser | http://localhost:7474 | neo4j / aquaintelli123 |
| InfluxDB UI | http://localhost:8086 | aqua / aquaintelli123 |

### ❌ Grafana shows "No data"
Check Prometheus scrape config:
```bash
# Test backend metrics endpoint
curl http://localhost:8001/api/v3/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | python -m json.tool | grep "health"
```

### Useful Prometheus queries:
```promql
# API p95 latency
histogram_quantile(0.95, rate(aquaintelli_http_request_duration_seconds_bucket[5m]))

# Error rate %
rate(aquaintelli_http_requests_total{status_code=~"5.."}[5m]) / rate(aquaintelli_http_requests_total[5m]) * 100

# Cache hit rate %
rate(aquaintelli_cache_hits_total[10m]) / (rate(aquaintelli_cache_hits_total[10m]) + rate(aquaintelli_cache_misses_total[10m])) * 100

# ML inference rate
rate(aquaintelli_ml_inference_total[5m])
```

---

## Common `curl` Examples

```bash
BASE=http://localhost:8001

# Health
curl $BASE/health | python -m json.tool

# Detailed health (v3)
curl $BASE/api/v3/health/detailed | python -m json.tool

# Login
TOKEN=$(curl -s -X POST $BASE/api/v3/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 3D model (requires auth)
curl "$BASE/api/v3/aquifers/hyd-ap-001/3d-model?resolution=low" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -50

# Generate ESG report
curl -X POST $BASE/api/v3/reports/esg \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"framework":"GRI-303","aquifer_ids":["hyd-ap-001"],"export_format":"json"}'

# LLM Chat
curl -X POST $BASE/api/v3/llm/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the current groundwater risk for Hyderabad?","context":{"aquifer_id":"hyd-ap-001"}}'

# Prometheus metrics
curl $BASE/api/v3/metrics
```
