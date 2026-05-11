from backend.app.services.cache_service import CacheService
from backend.app.services.auth_service import AuthService
from backend.app.services.esg_service import ESGReportService, ESGFramework
from backend.app.services.metrics_service import PrometheusMiddleware
from datetime import date

print("cache_service   OK")
print("auth_service    OK")
print("esg_service     OK")
print("metrics_service OK")

auth = AuthService()
token = auth.create_access_token({"id": "u1", "tenant_id": "t1", "email": "test@t.com", "role": "admin"})
payload = auth.verify_token(token)
print(f"JWT round-trip  OK  role={payload['role']}  perms={len(payload['permissions'])}")

esg = ESGReportService()
report = esg.generate_report(
    ESGFramework.GRI_303, "test-tenant",
    {"current_depth_m": 73.3, "grace_anomaly_m": -2.66, "area_km2": 847},
    date(2025, 1, 1), date(2025, 12, 31),
)
print(f"ESG GRI-303     OK  risk={report['risk_assessment']['risk_level']}")
print(f"Cache key       OK  {CacheService.key_forecast('hyd-ap-001', 30)}")

wf = report["water_footprint"]
print(f"Water footprint OK  blue={wf['blue_water_m3']:,.0f}m3  total={wf['total_water_footprint_m3']:,.0f}m3")

print()
print("All enterprise services healthy.")
