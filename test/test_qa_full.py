"""
AquaIntelli Enterprise v3 — Full QA Test Suite
Senior tester: hits every endpoint, validates responses, catches edge cases.
"""
import sys
import json
import time
import traceback
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8001"
PASS = 0
FAIL = 0
WARNS = []
TOKEN = None

def req(method, path, body=None, headers=None, expected=200):
    global PASS, FAIL
    url = BASE + path
    h = {"Content-Type": "application/json", **(headers or {})}
    if TOKEN:
        h["Authorization"] = f"Bearer {TOKEN}"
    data = json.dumps(body).encode() if body else None
    try:
        r = urllib.request.Request(url, data=data, headers=h, method=method)
        with urllib.request.urlopen(r, timeout=10) as resp:
            status = resp.status
            try:
                payload = json.loads(resp.read())
            except Exception:
                payload = {}
            ok = status == expected
            mark = "PASS" if ok else "FAIL"
            if ok:
                PASS += 1
            else:
                FAIL += 1
                WARNS.append(f"{method} {path} => expected {expected}, got {status}")
            print(f"  [{mark}] {method:6} {path:<55} => {status}")
            return payload, status
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            payload = json.loads(e.read())
        except Exception:
            payload = {}
        ok = status == expected
        mark = "PASS" if ok else "FAIL"
        if ok:
            PASS += 1
        else:
            FAIL += 1
            WARNS.append(f"{method} {path} => expected {expected}, got {status}: {payload.get('detail','')}")
        print(f"  [{mark}] {method:6} {path:<55} => {status}")
        return payload, status
    except Exception as e:
        FAIL += 1
        WARNS.append(f"{method} {path} => EXCEPTION: {e}")
        print(f"  [FAIL] {method:6} {path:<55} => EXCEPTION: {type(e).__name__}: {e}")
        return {}, -1


# ─── SECTION 1: Core Health ────────────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 1: Core Health & System")
print("="*70)

r, _ = req("GET", "/health")
assert r.get("status") == "healthy", f"health status wrong: {r}"

req("GET", "/docs")
req("GET", "/openapi.json")

r, _ = req("GET", "/api/v3/health/detailed")
assert "services" in r, "detailed health missing 'services'"
assert r.get("version") == "3.0.0", f"version wrong: {r.get('version')}"

# ─── SECTION 2: Auth Endpoints ────────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 2: Authentication (JWT)")
print("="*70)

# Login
r, s = req("POST", "/api/v3/auth/login",
           body={"email": "admin@aquaintelli.com", "password": "test"})
assert "access_token" in r, f"login missing access_token: {r}"
TOKEN = r.get("access_token")
refresh = r.get("refresh_token")
print(f"         Token obtained: {TOKEN[:30]}...")

# Me endpoint
r, _ = req("GET", "/api/v3/auth/me")
assert r.get("role") == "admin", f"role wrong: {r}"

# Refresh
r, _ = req("POST", "/api/v3/auth/refresh", body={"refresh_token": refresh}, headers={"Authorization": ""})

# Auth required — call without token
_saved = TOKEN
TOKEN = None
req("GET", "/api/v3/auth/me", expected=401)
TOKEN = _saved

# API key generation
req("POST", "/api/v3/auth/api-key")

# ─── SECTION 3: ESG Reports ───────────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 3: ESG Compliance Reports")
print("="*70)

for fw in ["GRI-303", "ESRS-E3", "CDP-Water", "ISO-14046"]:
    r, _ = req("POST", "/api/v3/reports/esg", body={
        "framework": fw,
        "reporting_period_start": "2025-01-01",
        "reporting_period_end": "2025-12-31",
        "aquifer_ids": ["hyd-ap-001"],
        "include_supply_chain": False,
        "export_format": "json"
    })
    assert "report" in r, f"{fw}: missing 'report' key"
    rep = r["report"]
    assert rep.get("framework") == fw, f"{fw}: framework mismatch"
    assert "water_footprint" in rep, f"{fw}: missing water_footprint"
    assert "risk_assessment" in rep, f"{fw}: missing risk_assessment"
    assert rep["risk_assessment"]["overall_risk_score"] > 0, f"{fw}: risk_score=0"

# HTML export
r, s = req("POST", "/api/v3/reports/esg", body={
    "framework": "GRI-303", "aquifer_ids": ["hyd-ap-001"],
    "reporting_period_start": "2025-01-01",
    "reporting_period_end": "2025-12-31",
    "export_format": "html"
})

# ESG frameworks list
r, _ = req("GET", "/api/v3/reports/esg/frameworks")
assert len(r.get("frameworks", [])) == 4, f"expected 4 frameworks: {r}"

# Bad framework
req("POST", "/api/v3/reports/esg", body={"framework": "INVALID-FW",
    "reporting_period_start": "2025-01-01", "reporting_period_end": "2025-12-31",
    "aquifer_ids": ["hyd-ap-001"]}, expected=422)

# ─── SECTION 4: 3D Aquifer Model ─────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 4: 3D Aquifer Volumetric Model")
print("="*70)

for res in ["low", "medium", "high"]:
    r, _ = req("GET", f"/api/v3/aquifers/hyd-ap-001/3d-model?resolution={res}")
    assert "depth_map" in r, f"{res}: missing depth_map"
    assert "pipelines" in r, f"{res}: missing pipelines"
    assert len(r["depth_map"]) > 0, f"{res}: empty depth_map"
    expected_size = {"low": 32*32, "medium": 64*64, "high": 128*128}[res]
    assert len(r["depth_map"]) == expected_size, \
        f"{res}: depth_map size {len(r['depth_map'])} != {expected_size}"

# Invalid resolution
req("GET", "/api/v3/aquifers/hyd-ap-001/3d-model?resolution=ultra", expected=422)

# Cache hit test
t0 = time.time()
req("GET", "/api/v3/aquifers/hyd-ap-001/3d-model?resolution=low")
t1 = time.time() - t0
print(f"         3D model response time: {t1*1000:.1f}ms")

# ─── SECTION 5: LLM Chat ─────────────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 5: LLM Agent v3 Chat")
print("="*70)

chat_cases = [
    "What is the current groundwater depth in Hyderabad?",
    "Show me the GRACE-FO satellite anomaly data",
    "What pipeline infrastructure exists?",
    "Generate an ESG water risk summary",
    "What is the 90-day forecast?",
]
for msg in chat_cases:
    r, _ = req("POST", "/api/v3/llm/chat", body={
        "message": msg,
        "context": {"aquifer_id": "hyd-ap-001", "location": "Hyderabad"},
        "history": []
    })
    assert "response" in r, f"llm/chat missing 'response': {r}"
    assert len(r["response"]) > 10, f"response too short: '{r['response']}'"
    assert "session_id" in r, "missing session_id"
    assert "latency_ms" in r, "missing latency_ms"

# Empty message edge case
req("POST", "/api/v3/llm/chat", body={"message": ""}, expected=422)

# ─── SECTION 6: Tenant Management ────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 6: Multi-Tenant Management")
print("="*70)

r, _ = req("POST", "/api/v3/tenants", body={
    "name": "Test Water Board",
    "slug": "twb-test",
    "plan": "enterprise",
    "contact_email": "admin@twb.gov.in"
})
assert "tenant" in r, f"create tenant missing 'tenant': {r}"
assert r["tenant"]["plan"] == "enterprise"

req("GET", "/api/v3/tenants")

# ─── SECTION 7: WebSocket Info ────────────────────────────────────────────
print("\n" + "="*70)
print("SECTION 7: Real-time / WebSocket Metadata")
print("="*70)

r, _ = req("GET", "/api/v3/realtime/status")
assert "websocket_url" in r, "missing websocket_url"
assert "channels" in r, "missing channels"

# ─── SECTION 8: v1 API Backward Compatibility ─────────────────────────────
print("\n" + "="*70)
print("SECTION 8: v1 API Backward Compatibility")
print("="*70)

TOKEN = None  # v1 endpoints don't require auth
v1_gets = [
    "/api/v1/groundwater/",
    "/api/v1/alerts/",
    "/api/v1/db/status",
]
for path in v1_gets:
    req("GET", path)

# ─── SECTION 9: Prometheus Metrics ───────────────────────────────────────
print("\n" + "="*70)
print("SECTION 9: Prometheus Metrics Endpoint")
print("="*70)

# Re-auth for v3
TOKEN = None
r, _ = req("POST", "/api/v3/auth/login",
           body={"email": "admin@aquaintelli.com", "password": "test"})
TOKEN = r.get("access_token")

r, _ = req("GET", "/api/v3/metrics")

# ─── SECTION 10: Security / Edge Cases ───────────────────────────────────
print("\n" + "="*70)
print("SECTION 10: Security & Edge Cases")
print("="*70)

# Wrong method
req("GET", "/api/v3/reports/esg", expected=405)

# Malformed JSON body
req("POST", "/api/v3/llm/chat",
    body={"message": "x" * 10000},  # huge message
    headers={"Authorization": f"Bearer {TOKEN}"})

# Missing required field
req("POST", "/api/v3/tenants",
    body={"slug": "no-name"},  # missing name, email
    expected=422)

# SQL injection attempt in path
req("GET", "/api/v3/aquifers/' OR 1=1--/3d-model", expected=422)

# ─── FINAL REPORT ────────────────────────────────────────────────────────
total = PASS + FAIL
print("\n" + "="*70)
print(f"  QA RESULTS: {PASS}/{total} PASSED  |  {FAIL} FAILED")
print("="*70)

if WARNS:
    print("\nFAILURES:")
    for w in WARNS:
        print(f"  !! {w}")
else:
    print("  All tests passed cleanly.")

print()
sys.exit(0 if FAIL == 0 else 1)
