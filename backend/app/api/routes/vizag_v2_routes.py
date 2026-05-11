"""
AquaIntelli v2 — Vizag Module API Routes
Serves all 9 modules using real dataset files + spec data from SKILL.md
"""
import csv, json, os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter(prefix="/v2", tags=["AquaIntelli v2 — Vizag Modules"])

DATASETS = Path(__file__).parent.parent.parent.parent.parent / "datasets"

def load_csv(filename: str) -> List[Dict]:
    path = DATASETS / filename
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def load_json(filename: str) -> Any:
    path = DATASETS / filename
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)

# ── MODULE 01 — Groundwater ──────────────────────────────────────────
VIZAG_GW_ZONES = [
    {"location":"Gajuwaka","lat":17.6810,"lon":83.2018,"depth_m":12.4,"gwpi":0.82,"aquifer":"Unconfined","trend":"Stable","status":"GOOD"},
    {"location":"MVP Colony","lat":17.7231,"lon":83.3012,"depth_m":18.7,"gwpi":0.64,"aquifer":"Semi-confined","trend":"Declining -0.3m/yr","status":"WARNING"},
    {"location":"Bheemunipatnam","lat":17.8867,"lon":83.4563,"depth_m":8.2,"gwpi":0.91,"aquifer":"Unconfined","trend":"Recharging","status":"GOOD"},
    {"location":"Rushikonda","lat":17.7620,"lon":83.3785,"depth_m":22.1,"gwpi":0.55,"aquifer":"Confined","trend":"Critical","status":"CRITICAL"},
    {"location":"Simhachalam","lat":17.7645,"lon":83.2641,"depth_m":15.6,"gwpi":0.77,"aquifer":"Unconfined","trend":"Stable","status":"GOOD"},
    {"location":"Kommadi","lat":17.7925,"lon":83.3350,"depth_m":9.8,"gwpi":0.88,"aquifer":"Unconfined","trend":"Recharging","status":"GOOD"},
    {"location":"Seethammadhara","lat":17.7338,"lon":83.3172,"depth_m":20.4,"gwpi":0.59,"aquifer":"Semi-confined","trend":"Declining","status":"WARNING"},
    {"location":"Madhurawada","lat":17.7780,"lon":83.3580,"depth_m":11.2,"gwpi":0.85,"aquifer":"Unconfined","trend":"Stable","status":"GOOD"},
]

VIZAG_ZONE_HEALTH = [
    {"zone":"A","depth_m":52.1,"status":"GOOD","note":"stable"},
    {"zone":"B","depth_m":68.4,"status":"STRESS","note":"declining"},
    {"zone":"C","depth_m":45.7,"status":"GOOD","note":"rising"},
    {"zone":"D","depth_m":89.2,"status":"CRITICAL","note":"rapid decline"},
]

@router.get("/groundwater/zones", summary="All Vizag groundwater zones")
async def get_gw_zones():
    return {"zones": VIZAG_GW_ZONES, "zone_health": VIZAG_ZONE_HEALTH,
            "grace_anomaly_m": -2.66, "depletion_rate_m_day": -0.059,
            "soil_moisture_pct": 28.6, "count": len(VIZAG_GW_ZONES)}

@router.get("/groundwater/forecast", summary="90-day LSTM groundwater forecast")
async def get_gw_forecast():
    rows = load_csv("m01_gw_forecast_timeseries.csv")
    return {"forecast": rows, "points": len(rows),
            "model": "3-layer LSTM (128→64→32)", "rmse_m": 2.1,
            "horizon_days": 90, "source": "m01_gw_forecast_timeseries.csv"}

@router.get("/groundwater/aquifer-layers", summary="Vizag geological layer data for 3D viz")
async def get_aquifer_layers():
    return {"layers": [
        {"name":"Topsoil","depth_from":0,"depth_to":8,"color":"#8B7355","material":"Alluvium/Regolith"},
        {"name":"Clay","depth_from":8,"depth_to":20,"color":"#A0522D","material":"Silty Clay with Sand"},
        {"name":"Weathered","depth_from":20,"depth_to":40,"color":"#CD853F","material":"Weathered Deccan Basalt"},
        {"name":"Fractured","depth_from":40,"depth_to":65,"color":"#696969","material":"Fractured Basalt"},
        {"name":"Aquifer Zone","depth_from":65,"depth_to":100,"color":"#4682B4","material":"SATURATED (Primary target)"},
        {"name":"Hard Rock","depth_from":100,"depth_to":150,"color":"#2F4F4F","material":"Fresh Basalt, Impervious"},
    ]}

# ── MODULE 02 — Reservoir ────────────────────────────────────────────
VIZAG_RESERVOIRS = [
    {"id":"R01","name":"Raiwada Reservoir","lat":17.65,"lon":83.15,
     "capacity_tmc":12.5,"fill_pct":67.2,"frl_ft":885,"current_ft":810.4,
     "inflow_cusecs":12430,"outflow_cusecs":8200,"live_storage_tmc":7.8,"dead_storage_tmc":0.6,"status":"OPERATIONAL"},
    {"id":"R02","name":"Yeleru Reservoir","lat":17.58,"lon":82.95,
     "capacity_tmc":18.2,"fill_pct":54.3,"frl_ft":920,"current_ft":785.6,
     "inflow_cusecs":8900,"outflow_cusecs":11200,"live_storage_tmc":9.8,"dead_storage_tmc":0.8,"status":"WARNING"},
    {"id":"R03","name":"Mudasarlova Tank","lat":17.72,"lon":83.32,
     "capacity_tmc":2.1,"fill_pct":82.1,"frl_ft":145,"current_ft":132.8,
     "inflow_cusecs":450,"outflow_cusecs":320,"live_storage_tmc":1.7,"dead_storage_tmc":0.1,"status":"RECHARGE"},
]

CROP_WATER = [
    {"crop":"Paddy (Kharif)","stage":"Tillering","etc_mm":7.2,"supply_mm":5.8,"deficit":1.4,"action":"Open Canal Gate 3A"},
    {"crop":"Groundnut","stage":"Pod filling","etc_mm":4.1,"supply_mm":4.1,"deficit":0.0,"action":"Adequate — Monitor"},
    {"crop":"Sugarcane","stage":"Grand growth","etc_mm":6.8,"supply_mm":3.2,"deficit":3.6,"action":"URGENT — Irrigate"},
    {"crop":"Mango Orchards","stage":"Fruit dev.","etc_mm":3.5,"supply_mm":5.1,"deficit":-1.6,"action":"Excess — Drain"},
]

@router.get("/reservoirs", summary="All Vizag reservoirs status")
async def get_reservoirs():
    daily = load_csv("m02_reservoir_daily_flow.csv")
    return {"reservoirs": VIZAG_RESERVOIRS, "crop_water_status": CROP_WATER,
            "daily_flow_data": daily[:30], "count": len(VIZAG_RESERVOIRS)}

@router.get("/reservoirs/{reservoir_id}/storage", summary="Reservoir storage time-series")
async def get_reservoir_storage(reservoir_id: str):
    daily = load_csv("m02_reservoir_daily_flow.csv")
    res = next((r for r in VIZAG_RESERVOIRS if r["id"] == reservoir_id), None)
    if not res:
        raise HTTPException(404, f"Reservoir {reservoir_id} not found")
    return {"reservoir": res, "timeseries": daily, "points": len(daily)}

# ── MODULE 03 — Irrigation / NDVI ───────────────────────────────────
@router.get("/irrigation/zones", summary="NDVI 8x8 irrigation zones")
async def get_irrigation_zones():
    data = load_json("m03_ndvi_grid_8x8.json")
    if not data:
        return {
            "grid_size": "8x8", "total_zones": 64,
            "healthy": 38, "stressed": 18, "critical": 8,
            "district_avg_ndvi": 0.64,
            "thresholds": {"healthy": 0.6, "stressed_min": 0.3}
        }
    
    # Calculate stats if missing
    if "district_avg_ndvi" not in data:
        all_ndvi = []
        healthy = 0
        stressed = 0
        critical = 0
        for row in data.get("data", []):
            for cell in row:
                v = cell.get("ndvi", 0)
                all_ndvi.append(v)
                if v >= 0.6: healthy += 1
                elif v >= 0.3: stressed += 1
                else: critical += 1
        
        data["district_avg_ndvi"] = round(sum(all_ndvi) / len(all_ndvi), 2) if all_ndvi else 0.55
        data["healthy"] = healthy
        data["stressed"] = stressed
        data["critical"] = critical
        data["total_zones"] = len(all_ndvi)

    return data

@router.get("/irrigation/schedule", summary="AI irrigation schedule")
async def get_irrigation_schedule():
    return {
        "schedule": CROP_WATER,
        "wis_score": 74.2, 
        "wis_grade": "MODERATE",
        "water_availability": "MEDIUM (GW DEPLETION DETECTED)",
        "soil": {
            "type": "Red Sandy Loam",
            "ph": 7.2, 
            "organic_matter_pct": 1.8, 
            "whc_mm": 180,
            "infiltration_mm_hr": 12.5, 
            "N_kg_ha": 185, 
            "P_kg_ha": 22, 
            "K_kg_ha": 245
        },
        "recommendations": [
            {
                "crop": "Ragi (Finger Millet)",
                "suitability": 0.94,
                "reason": "Extreme drought tolerance; thrives in red sandy soils of Vizag region.",
                "market_rate": "₹3,800 - ₹4,200 per Quintal",
                "how_to_grow": [
                    "Sowing: June-July (Kharif) or Jan-Feb (Rabi).",
                    "Spacing: 25cm x 10cm for optimal yield.",
                    "Water: Low requirement; 2-3 protective irrigations during tillering/flowering.",
                    "Fertilizer: 40:20:20 NPK kg/ha."
                ],
                "harvest_time": "110 - 120 Days"
            },
            {
                "crop": "Black Gram (Urad Dal)",
                "suitability": 0.89,
                "reason": "Short duration crop; nitrogen fixing properties improve soil health.",
                "market_rate": "₹6,500 - ₹7,200 per Quintal",
                "how_to_grow": [
                    "Sowing: Late Kharif or Rabi fallows.",
                    "Spacing: 30cm x 10cm.",
                    "Water: Critical stages: Flowering and pod formation.",
                    "Pest Control: Monitor for yellow mosaic virus (YMV)."
                ],
                "harvest_time": "75 - 90 Days"
            },
            {
                "crop": "Groundnut (Peanut)",
                "suitability": 0.82,
                "reason": "Medium water demand; high market value for local Vizag oil extraction.",
                "market_rate": "₹5,500 - ₹6,300 per Quintal",
                "how_to_grow": [
                    "Soil: Needs loose sandy loam for proper pod penetration (Pegging).",
                    "Seed Rate: 100-120 kg/ha.",
                    "Water: Needs consistent moisture during pegging stage (45-70 days).",
                    "Gypsum: Apply 500kg/ha at flowering to improve pod quality."
                ],
                "harvest_time": "105 - 125 Days"
            }
        ],
        "farming_knowledge": {
            "soil_health": "Regular application of FYM (Farm Yard Manure) at 10t/ha recommended to improve WHC in sandy soils.",
            "pest_management": "Use pheromone traps for Spodoptera litura control in groundnut/pulses.",
            "tech_tip": "Install drip irrigation with venturi for fertigation to save 30% water and 20% fertilizer."
        }
    }

# ── MODULE 04 — Borewell Intelligence ───────────────────────────────
BOREWELL_TELEMETRY = {
    "borewell_id":"BW-AP-2847","location":"Venkatapathirajupet, Anakapalle",
    "lat":17.7102,"lon":83.1780,"total_depth_m":120,"casing_m":18,
    "screen_from":65,"screen_to":95,"aquifer_1_yield_lps":4.2,"aquifer_2_yield_lps":2.1,
    "motor_status":"RUNNING","rpm":2840,"power_kw":7.4,"efficiency_pct":82.3,
    "pump_depth_m":85,"dynamic_level_m":78.2,
    "run_hours_today":6.5,"run_hours_month":142,
    "current_yield_lps":4.2,"design_yield_lps":6.0,
    "failure_probability_pct":12,"next_maintenance_days":45,
    "failure_mode":"Motor bearing wear (thermal signature detected)",
    "water_quality":{"tds_ppm":485,"ph":7.4,"ec_ms_m":0.82,
                     "fluoride_ppm":0.8,"iron_ppm":0.3,"nitrate_ppm":12.5,"potability":"SAFE"}
}

@router.get("/borewell/{borewell_id}", summary="Full borewell telemetry")
async def get_borewell(borewell_id: str):
    telemetry = load_csv("m04_pump_telemetry_timeseries.csv")
    return {**BOREWELL_TELEMETRY, "telemetry_history": telemetry[:48], "borewell_id": borewell_id}

@router.get("/borewell/{borewell_id}/geology", summary="3D geological layer data")
async def get_borewell_geology(borewell_id: str):
    geo = load_json("m04_borewell_3d_geometry.json")
    return geo if geo else {"layers": [
        {"name":"Topsoil","depth_from":0,"depth_to":8,"color":"#8B7355"},
        {"name":"Clay","depth_from":8,"depth_to":20,"color":"#A0522D"},
        {"name":"Weathered","depth_from":20,"depth_to":40,"color":"#CD853F"},
        {"name":"Fractured","depth_from":40,"depth_to":65,"color":"#696969"},
        {"name":"Aquifer","depth_from":65,"depth_to":100,"color":"#4682B4"},
        {"name":"Hard Rock","depth_from":100,"depth_to":120,"color":"#2F4F4F"},
    ]}

@router.get("/borewell/{borewell_id}/telemetry", summary="Real-time pump telemetry time-series")
async def get_borewell_telemetry(borewell_id: str):
    rows = load_csv("m04_pump_telemetry_timeseries.csv")
    return {"borewell_id": borewell_id, "telemetry": rows, "points": len(rows),
            "columns": ["timestamp","rpm","power_kw","efficiency_pct","dynamic_level_m","yield_lps","motor_temp_c"]}

# ── MODULE 05 — Drainage Network ─────────────────────────────────────
DRAINAGE_NODES = [
    {"id":"P1","name":"MVPS Ward 12","type":"Pump","capacity_pct":98,"status":"CRITICAL","lat":17.7231,"lon":83.3012},
    {"id":"P2","name":"Gajuwaka Main","type":"Pump","capacity_pct":45,"status":"NORMAL","lat":17.6810,"lon":83.2018},
    {"id":"P3","name":"Dwaraka Nagar","type":"Junction","capacity_pct":68,"status":"WARNING","lat":17.7300,"lon":83.3200},
    {"id":"P4","name":"Seethammadhara","type":"Outlet","capacity_pct":52,"status":"NORMAL","lat":17.7338,"lon":83.3172},
    {"id":"P5","name":"Purna Market","type":"Junction","capacity_pct":94,"status":"CRITICAL","lat":17.7100,"lon":83.3000},
    {"id":"S1","name":"Old City Nala","type":"Sewer","capacity_pct":72,"status":"WARNING","lat":17.6900,"lon":83.2800},
    {"id":"S2","name":"Airport Drain","type":"Storm","capacity_pct":38,"status":"NORMAL","lat":17.7200,"lon":83.2200},
    {"id":"J1","name":"Main Outfall","type":"Outfall","capacity_pct":55,"status":"NORMAL","lat":17.7000,"lon":83.3500},
    {"id":"J2","name":"Rushikonda Junc","type":"Junction","capacity_pct":61,"status":"WARNING","lat":17.7620,"lon":83.3785},
]

@router.get("/drainage/nodes", summary="Drainage network node status")
async def get_drainage_nodes():
    graph = load_json("m05_drainage_network_graph.json")
    return {"nodes": DRAINAGE_NODES, "graph": graph,
            "total_km": 142, "overloaded": 23,
            "pump_stations": 7, "stps_online": 4, "flood_zones_at_risk": 3}

# ── MODULE 06 — Flood ────────────────────────────────────────────────
FLOOD_EVENT = {
    "rainfall_24h_mm":247,"river_level_m":6.1,"danger_level_m":5.5,
    "warning_level_m":4.2,"active_flood_zones":12,"threat_level":"HIGH",
    "peak_forecast_m":5.8,"peak_eta":"18:00 TODAY","recession_hours":72,
    "sms_alerts_sent":2847,"displaced":12400,"relief_camps":8,
    "ndrf_teams":4,"sdrf_teams":6
}
FLOOD_ZONES = [
    {"zone":"Rajahmundry East","status":"INUNDATED","severity":5,"lat":17.6900,"lon":83.2100},
    {"zone":"Gnana Puram Vizag","status":"INUNDATED","severity":5,"lat":17.7000,"lon":83.3000},
    {"zone":"Purna Market Vizag","status":"RISING","severity":4,"lat":17.7100,"lon":83.3000},
    {"zone":"Airport Area Vizag","status":"WARNING","severity":3,"lat":17.7200,"lon":83.2200},
]
FLOOD_RETURN_PERIODS = [
    {"year":10,"depth_m":0.6},{"year":25,"depth_m":1.2},
    {"year":50,"depth_m":2.1},{"year":100,"depth_m":3.5}
]

@router.get("/flood/active", summary="Active flood event data")
async def get_flood_active():
    frames = load_json("m06_flood_simulation_frames.json")
    return {**FLOOD_EVENT, "simulation_frames": frames}

@router.get("/flood/zones", summary="Flood inundation zones")
async def get_flood_zones():
    return {"zones": FLOOD_ZONES, "return_periods": FLOOD_RETURN_PERIODS,
            "alert_logic": {"red": "rainfall>150 AND river>danger","orange": "rainfall>100 AND river>warning","yellow": "rainfall>50"}}

# ── MODULE 07 — Aquifer Scanner ──────────────────────────────────────
AQUIFER_DATA = {
    "estimated_volume_m3": 2_400_000, "remaining_pct": 42,
    "recharge_rate_m_day": 0.04, "safe_yield_m3_day": 8500,
    "zone_saturation": {"Z01":45,"Z02":62,"Z03":78,"Z04":34,"Z05":89,"Z06":55,"Z07":71,"Z08":28}
}
NEARBY_RESOURCES = [
    {"name":"Mudasarlova Tank","dist_km":8,"type":"Surface","recharge":"HIGH"},
    {"name":"Gosthani River","dist_km":15,"type":"River","recharge":"MEDIUM"},
    {"name":"Raiwada Reservoir","dist_km":35,"type":"Reservoir","recharge":"HIGH"},
    {"name":"Coastal Aquifer","dist_km":2,"type":"Aquifer","recharge":"LOW","salinity_risk":"HIGH"},
]

@router.get("/aquifer/scan", summary="Aquifer scan + 3D saturation")
async def get_aquifer_scan():
    sat3d = load_json("m07_aquifer_saturation_3d.json")
    return {**AQUIFER_DATA, "nearby_resources": NEARBY_RESOURCES,
            "3d_saturation": sat3d,
            "satellite": {"altitude_km":408,"inclination_deg":98.7,"passes":1779,"status":"ACTIVE"}}

# ── MODULE 08 — Crisis Forecast ───────────────────────────────────────
CRISIS_THREATS = [
    {"priority":"P1","level":"CRITICAL","eta":"14H",
     "title":"Krishna Basin — Aquifer Collapse Risk",
     "grace_anomaly_m":-4.8,"depletion_m_day":-0.12,"villages_at_risk":12,"confidence_pct":88},
    {"priority":"P2","level":"HIGH","eta":"3D",
     "title":"Godavari Delta — Saltwater Intrusion",
     "salinity_above_baseline_ppm":340,"confidence_pct":72},
    {"priority":"P3","level":"MODERATE","eta":"7D",
     "title":"Tungabhadra — Reservoir Below Dead Storage",
     "current_fill_pct":18,"critical_threshold_pct":15,"confidence_pct":55},
]

@router.get("/crisis/threats", summary="Active crisis threat priority queue")
async def get_crisis_threats():
    return {"threats": CRISIS_THREATS, "crisis_index": 7.2,
            "ai_confidence_pct": 88, "peak_eta_hours": 14,
            "calamities": {
                "cyclone": {"name":"Asani","distance_km":180,"speed_kmh":15,"eta_hours":48,"category":2,"track":"NW"},
                "rainfall": {"type":"Extreme","duration_hours":72,"accumulation_mm":450,"flood_risk":"VERY HIGH"},
                "heatwave": {"max_temp_c":46,"duration_days":5,"ag_risk":"CRITICAL"}
            }}

@router.get("/crisis/timeline", summary="90-day crisis probability curve")
async def get_crisis_timeline():
    rows = load_csv("m08_crisis_timeline.csv")
    return {"timeline": rows, "points": len(rows),
            "model": "LSTM + Prophet + Bayesian Risk",
            "peak_day": 45, "peak_probability": 0.72}

# ── MODULE 09 — City Drainage (HERO) ─────────────────────────────────
VIZAG_CITY_PROFILE = {
    "drainage_blocks":14,"primary_drains_km":110,"secondary_drains_km":280,
    "tertiary_drains_km":750,"total_storm_km":1140,"sewer_km":316,
    "culverts":142,"manholes":2840,"pump_stations":7,
    "catchment_km2":682,"avg_rainfall_mm":1200,"runoff_coeff":0.65,
    "peak_runoff_m3s":450,"time_of_concentration_min":45,"design_storm_mm":180
}
STPS = [
    {"name":"Mudsarlova","lat":17.72,"lon":83.32,"capacity_mld":13,"status":"ONLINE"},
    {"name":"Old City","lat":17.69,"lon":83.28,"capacity_mld":38,"status":"ONLINE"},
    {"name":"Appughar","lat":17.74,"lon":83.30,"capacity_mld":25,"status":"ONLINE"},
    {"name":"Narava","lat":17.75,"lon":83.25,"capacity_mld":54,"status":"Under Construction"},
]
SUB_CATCHMENTS = [
    {"name":"Old City","area_km2":45,"runoff_m3s":85,"elevation_m":15},
    {"name":"Dwaraka Nagar","area_km2":38,"runoff_m3s":72,"elevation_m":22},
    {"name":"Gajuwaka","area_km2":52,"runoff_m3s":68,"elevation_m":35},
    {"name":"MVP Colony","area_km2":28,"runoff_m3s":45,"elevation_m":48},
    {"name":"Rushikonda","area_km2":35,"runoff_m3s":55,"elevation_m":65},
    {"name":"Airport Zone","area_km2":58,"runoff_m3s":77,"elevation_m":8},
]

@router.get("/drainage/city", summary="City drainage full data (HERO module)")
async def get_city_drainage():
    city3d = load_json("m09_city_drainage_3d.json")
    return {
        "city_profile": VIZAG_CITY_PROFILE,
        "stps": STPS,
        "sub_catchments": SUB_CATCHMENTS,
        "drainage_nodes": DRAINAGE_NODES,
        "3d_model": city3d,
        "contamination": {
            "septic_density_per_km2": 45,
            "nitrate_baseline_ppm": 8.5,
            "nitrate_current_ppm": 18.2,
            "status": "ALARM",
            "hotspots": ["Old City","Purna Market","Gnanapuram"]
        },
        "efficiency": {
            "current_pct": 58, "target_pct": 85,
            "flood_reduction_pct": 65,
            "water_reuse_mld": 85,
            "energy_savings_kwh_day": 2400,
            "gw_contamination_reduction_pct": 70
        }
    }

# ── MOCK DATA (full JSON) ─────────────────────────────────────────────
@router.get("/mock/all", summary="Full mock dataset (all modules)")
async def get_all_mock():
    data = load_json("aquaintelli_v2_vizag_mock_data.json")
    return data if data else {"error": "Mock data file not found"}
