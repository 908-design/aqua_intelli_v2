---
name: aquaintelli-v2
description: >
  Use this skill when implementing AquaIntelli v2 — the AI-powered water intelligence
  platform for Visakhapatnam, Andhra Pradesh. Covers all 9 modules (groundwater,
  reservoir, irrigation, borewell, drainage, flood, aquifer, crisis, city digital twin),
  the full-stack architecture (React/Next.js + FastAPI + PostGIS + TimescaleDB),
  AI/ML pipelines (LSTM, Random Forest, XGBoost, ConvLSTM), real-time streaming
  (Kafka, Flink), vector geospatial search, GPU-accelerated simulation, GNN water
  networks, multi-agent planning, reinforcement learning, and the Vizag digital twin.
  Also covers all mocked datasets, algorithm formulas, and deployment on Kubernetes.
version: "2.0"
region: "Visakhapatnam (Vizag), Andhra Pradesh, India — 17.6939°N, 83.2922°E"
status: prototype-to-production
---

# AquaIntelli v2 — Master Implementation SKILL

## 0. OVERVIEW & MISSION

AquaIntelli v2 is a **planetary-scale hydroinformatics platform** — a "God's Eye View"
of water resources. It combines satellite data, AI forecasting, real-time simulation,
and government sensor networks into a unified city-scale water digital twin.

**Primary City:** Visakhapatnam (Vizag), Andhra Pradesh — 682 km², 2,035,000 population  
**Coordinates:** 17.6939°N, 83.2922°E | Elevation: -3m to 513m (avg 45m)  
**Drainage Infrastructure:** 14 blocks, 1,140 km storm drains, 316 km sewers  

**Final Vision:**
```
AquaIntelli OS = Digital Twin + Distributed AI + Real-Time Simulation
("Palantir for Water" + "NVIDIA Omniverse for Hydrology")
```

---

## 1. VERIFIED TECH STACK (Use Exactly These)

### Frontend
```
React.js + Next.js (App Router)
TypeScript (strict mode)
TailwindCSS
Three.js           — 3D geological cross-sections, borewell visualization
Deck.gl            — Geospatial heatmaps, GWPI overlays
Mapbox GL JS       — Base map, drainage network, satellite imagery
CesiumJS           — Satellite orbit visualization, city digital twin
React Query (TanStack)
Zustand            — Global state management
Framer Motion      — Animations
D3.js              — Charts, timelines, crisis probability curves
WebGL / WebGPU     — Terrain rendering, flood simulation
```

### Backend
```
FastAPI            — Primary REST API (Python 3.11+)
Node.js + Express  — WebSocket server, real-time telemetry gateway
GraphQL (Strawberry/Ariadne) — Unified data API
WebSockets         — Live telemetry feeds
gRPC               — Inter-service ML inference calls
Celery + Redis     — Background AI model tasks
```

### Databases
```
PostgreSQL 15 + PostGIS 3  — Spatial queries, geometry storage
TimescaleDB                — Time-series (groundwater depth, rainfall, telemetry)
MongoDB                    — Unstructured sensor logs, satellite metadata
Redis 7                    — Real-time caching, pub/sub
MinIO / AWS S3             — Satellite raster storage (GeoTIFF, Zarr)
```

### GIS & Raster Processing
```
GDAL / Rasterio            — Raster I/O, reprojection
GeoPandas                  — Spatial dataframe operations
Shapely                    — Geometry operations
PyProj                     — CRS transformations
Xarray + Zarr              — Multi-dimensional raster arrays
Dask / Ray                 — Distributed raster processing
GDAL Tippecanoe            — MVT tile generation
Cloud Optimized GeoTIFF (COG) — Tile streaming
```

### AI / ML Stack
```
PyTorch 2.x        — LSTM, ConvLSTM, GNN, Transformer models
TensorFlow 2.x     — Legacy model compatibility
XGBoost            — Borewell yield prediction, failure detection
LightGBM           — Irrigation scheduling (Water Intelligence Score)
Scikit-learn       — Random Forest GWPI, preprocessing pipelines
PyTorch Geometric  — Graph Neural Networks (drainage, canal network)
Prophet            — Drought/crisis long-range forecasting
Optuna             — Hyperparameter optimization
MLflow             — Experiment tracking, model registry
ONNX Runtime       — Optimized inference serving
```

### Streaming & Real-Time
```
Apache Kafka       — Primary event streaming
Apache Flink       — Stream processing, CEP (Complex Event Processing)
Kafka Streams      — Lightweight stream transformations
Redis Streams      — Low-latency telemetry ingestion
```

### Infrastructure
```
Docker + Docker Compose (dev)
Kubernetes (K8s) + Helm (prod)
Terraform          — IaC
NGINX + Traefik    — Reverse proxy, load balancing
GitHub Actions     — CI/CD
Prometheus + Grafana — Metrics & dashboards
Loki               — Log aggregation
Jaeger / OpenTelemetry — Distributed tracing
```

---

## 2. SYSTEM ARCHITECTURE (High-Level)

```
Satellite Sources (GRACE-FO, Sentinel-1/2, SMAP, MODIS)
           ↓
  [Kafka Producers] ← CGWB wells, IMD sensors, GVMC IoT
           ↓
  [Apache Flink Stream Processing]
           ↓
  [Feature Store] (Redis + TimescaleDB)
           ↓
  [AI/ML Inference Layer]
    ├── LSTM Forecasting (groundwater, crisis)
    ├── Random Forest (GWPI, failure detection)
    ├── ConvLSTM (flood spatial forecasting)
    ├── GNN (drainage network, water routing)
    └── RL Agent (irrigation, reservoir release)
           ↓
  [FastAPI Gateway + GraphQL]
           ↓
  [Next.js Frontend]
    ├── Three.js 3D (geological cross-sections, borewell)
    ├── Deck.gl (heatmaps, GWPI, flood inundation)
    ├── Mapbox GL (base map, network overlays)
    └── CesiumJS (digital twin, satellite orbit)
```

---

## 3. MODULE SPECIFICATIONS (All 9 Modules)

### MODULE 01 — Groundwater Intelligence

**Purpose:** Real-time groundwater monitoring + AI depth forecasting  

**Data Sources:**
- CGWB (Central Ground Water Board) — 30 monitoring wells in Vizag district
- SGWD (State Ground Water Dept) — 28 additional wells
- NASA GRACE-FO — Gravity anomaly (current: -2.66m EWH for Vizag region)
- Sentinel-1 SAR — Soil moisture volumetric (28.6%)
- NASA POWER API — 180-day rainfall history (120mm accumulation)

**Aquifer Profile (CGWB NAQUIM 2.0 — Visakhapatnam):**
```
Layer 1: Topsoil         0-8m    Alluvium/Regolith          color: #8B7355
Layer 2: Clay            8-20m   Silty Clay with Sand       color: #A0522D
Layer 3: Weathered      20-40m   Weathered Deccan Basalt    color: #CD853F
Layer 4: Fractured      40-65m   Fractured Basalt           color: #696969
Layer 5: Aquifer Zone   65-100m  SATURATED (Primary target) color: #4682B4
Layer 6: Hard Rock      100m+    Fresh Basalt, Impervious   color: #2F4F4F
```

**Core Algorithms:**

1. **LSTM Forecasting (PyTorch)**
   - Architecture: 3-layer stacked LSTM (128→64→32 units) + Dense output
   - Inputs: 180-day historical groundwater depth, rainfall, GRACE anomaly, soil moisture
   - Outputs: 30-day forecast, 90-day forecast (depth in meters BGL)
   - Loss: MSE | Optimizer: Adam (lr=0.001) | Accuracy: ±2.1m RMSE
   - Training window: 180 days rolling

2. **Depletion Rate Calculator**
   ```python
   depletion_rate = (depth_today - depth_yesterday) / delta_t  # m/day
   # Current Vizag: -0.059 m/day (declining)
   ```

3. **Risk Classification Engine**
   ```
   CRITICAL:    depth > 80m OR stress > 75%
   WARNING:     depth 60-80m OR stress 50-75%
   OPERATIONAL: depth < 60m AND stress < 50%
   RECOVERING:  depletion_rate > 0 (trend reversal)
   ```

4. **Random Forest GWPI (Groundwater Potential Index)**
   - Features: Rainfall(mm), distance_to_river(km), slope(deg), geology_type, land_use, NDVI, soil_type
   - Training labels: CGWB bore-well success/failure data
   - Output: GWPI score 0.0–1.0 at 250m × 250m grid
   - Alert threshold: GWPI < 0.3 → Critical zone alert

5. **Kriging Spatial Interpolation**
   - Type: Ordinary Kriging, spherical variogram model
   - Interpolates water table depth across irregular bore-well network
   - Output: Continuous depth-to-water-table raster

6. **GRACE TWSA Decomposition**
   - Input: NASA GRACE-FO monthly gravity change (0.5° resolution)
   - Algorithm: TWSA (Total Water Storage Anomaly) decomposition
   - Output: Groundwater storage change in mm/month

**Vizag Mocked Dataset (use for seeding/dev):**
```python
VIZAG_GROUNDWATER_ZONES = [
    {"location": "Gajuwaka",        "lat": 17.6810, "lon": 83.2018, "depth_m": 12.4, "gwpi": 0.82, "aquifer": "Unconfined",    "trend": "Stable"},
    {"location": "MVP Colony",      "lat": 17.7231, "lon": 83.3012, "depth_m": 18.7, "gwpi": 0.64, "aquifer": "Semi-confined", "trend": "Declining -0.3m/yr"},
    {"location": "Bheemunipatnam",  "lat": 17.8867, "lon": 83.4563, "depth_m": 8.2,  "gwpi": 0.91, "aquifer": "Unconfined",    "trend": "Recharging"},
    {"location": "Rushikonda",      "lat": 17.7620, "lon": 83.3785, "depth_m": 22.1, "gwpi": 0.55, "aquifer": "Confined",      "trend": "Critical"},
    {"location": "Simhachalam",     "lat": 17.7645, "lon": 83.2641, "depth_m": 15.6, "gwpi": 0.77, "aquifer": "Unconfined",    "trend": "Stable"},
    {"location": "Kommadi",         "lat": 17.7925, "lon": 83.3350, "depth_m": 9.8,  "gwpi": 0.88, "aquifer": "Unconfined",    "trend": "Recharging"},
    {"location": "Seethammadhara",  "lat": 17.7338, "lon": 83.3172, "depth_m": 20.4, "gwpi": 0.59, "aquifer": "Semi-confined", "trend": "Declining"},
    {"location": "Madhurawada",     "lat": 17.7780, "lon": 83.3580, "depth_m": 11.2, "gwpi": 0.85, "aquifer": "Unconfined",    "trend": "Stable"},
]

VIZAG_ZONE_HEALTH = [
    {"zone": "A", "depth_m": 52.1, "status": "GOOD",     "note": "stable"},
    {"zone": "B", "depth_m": 68.4, "status": "STRESS",   "note": "declining"},
    {"zone": "C", "depth_m": 45.7, "status": "GOOD",     "note": "rising"},
    {"zone": "D", "depth_m": 89.2, "status": "CRITICAL", "note": "rapid decline"},
]
```

**UI Components:**
- Deck.gl HeatmapLayer for GWPI visualization on Mapbox base
- Side panel: drill-site scorecard (depth estimate, success %, casing depth)
- Time-slider: animate seasonal groundwater fluctuation (Jan–Dec)
- Click-to-analyze: instant bore potential report at any GPS point
- 3D geological cross-section (Three.js) with aquifer layer highlighting

---

### MODULE 02 — Reservoir Intelligence & Crop Impact

**Purpose:** Monitor reservoir levels + crop water demand cascade analysis

**Vizag Reservoirs:**
```python
VIZAG_RESERVOIRS = [
    {
        "name": "Raiwada Reservoir", "lat": 17.65, "lon": 83.15,
        "capacity_tmc": 12.5, "fill_pct": 67.2, "frl_ft": 885, "current_ft": 810.4,
        "inflow_cusecs": 12430, "outflow_cusecs": 8200,
        "live_storage_tmc": 7.8, "dead_storage_tmc": 0.6, "status": "OPERATIONAL"
    },
    {
        "name": "Yeleru Reservoir", "lat": 17.58, "lon": 82.95,
        "capacity_tmc": 18.2, "fill_pct": 54.3, "frl_ft": 920, "current_ft": 785.6,
        "inflow_cusecs": 8900, "outflow_cusecs": 11200, "status": "WARNING"
    },
    {
        "name": "Mudasarlova Tank", "lat": 17.72, "lon": 83.32,
        "capacity_tmc": 2.1, "fill_pct": 82.1, "frl_ft": 145, "current_ft": 132.8,
        "inflow_cusecs": 450, "outflow_cusecs": 320, "status": "RECHARGE"
    },
]
```

**Algorithms:**
1. **Mass Balance:** `ΔS = I - O - E - L` (Storage, Inflow, Outflow, Evaporation, Seepage)
2. **MNDWI (Sentinel-2):** `MNDWI = (Green - SWIR) / (Green + SWIR)` — threshold > 0.3 = water surface
3. **Penman-Monteith (FAO-56):** `ETc = Kc × ET0` (crop coefficient × reference ET)
4. **Dijkstra Canal Routing:** Graph of reservoirs→canals→pump stations→crop zones; edge weights = distance + head loss
5. **Saint-Venant Equations:** Shallow water open-channel flow; Manning's n=0.025 (earthen canals)

**Crop Advisory Logic:**
```python
if fill_pct < 40:
    alert = "REDUCE rice, switch to millets"
elif fill_pct > 70:
    alert = "Sufficient water for 2 crops"
```

**Crop-Water Deficits:**
```python
CROP_WATER_STATUS = [
    {"crop": "Paddy (Kharif)", "stage": "Tillering",   "etc_mm": 7.2, "supply_mm": 5.8, "deficit": 1.4,  "action": "Open Canal Gate 3A"},
    {"crop": "Groundnut",      "stage": "Pod filling", "etc_mm": 4.1, "supply_mm": 4.1, "deficit": 0.0,  "action": "Adequate — Monitor"},
    {"crop": "Sugarcane",      "stage": "Grand growth","etc_mm": 6.8, "supply_mm": 3.2, "deficit": 3.6,  "action": "URGENT — Irrigate"},
    {"crop": "Mango Orchards", "stage": "Fruit dev.",  "etc_mm": 3.5, "supply_mm": 5.1, "deficit": -1.6, "action": "Excess — Drain"},
]
```

---

### MODULE 03 — Smart Irrigation + NDVI Fusion

**Purpose:** Satellite crop health + AI-driven deficit irrigation scheduling

**Satellite:** Sentinel-2B, 10m GSD

**NDVI Analysis (Vizag Farmlands):**
```
District Average: 0.64 (Healthy)
Grid: 8×8 = 64 zones | Healthy: 38 | Stressed: 18 | Critical: 8
Thresholds: Healthy >0.6 | Stressed 0.3-0.6 | Critical <0.3
```

**Algorithms:**
1. **NDVI:** `(NIR - Red) / (NIR + Red)` — Sentinel-2 B8 (NIR), B4 (Red)
2. **Soil Moisture (NASA SMAP L3):** Tau-Omega radiative transfer inversion; 9km → 1km downscale via MODIS LST
3. **Deficit Irrigation Scheduling (DIS):**
   ```
   Step 1: ETc = Kc × ET0 (Penman-Monteith + BBCH crop stage)
   Step 2: RAW = (FC - PWP) × rooting_depth × depletion_factor
   Step 3: Trigger irrigation when (FC - VWC) × depth > RAW
   Step 4: Net irrigation = (FC - VWC) × depth × (1/efficiency)
   ```
4. **Water Intelligence Score (WIS — Proprietary LightGBM):**
   ```
   WIS = weighted_sum(soil_moisture_deviation, crop_stress_idx,
                      weather_forecast_idx, reservoir_availability, wastage_ratio)
   WIS > 80 = Gold (efficient) | 60-80 = Moderate | <60 = Red Alert
   ```
5. **Crop Recommendation Model (Random Forest):**

| Crop     | Water Need | Suitability | Reason |
|----------|-----------|-------------|--------|
| Rice     | HIGH       | 0.45        | GW >70m, high energy cost |
| Cotton   | MEDIUM     | 0.72        | Drought tolerant |
| Chilli   | MEDIUM     | 0.68        | Good market price |
| Millets  | LOW        | 0.91        | BEST for current GW stress |
| Pulses   | LOW        | 0.88        | N-fixing, improves soil |

**Soil Profile (Vizag Silty Clay):**
```
pH: 7.2 | Organic Matter: 1.8% | WHC: 180mm | Infiltration: 12.5mm/hr
N: 185 kg/ha | P: 22 kg/ha | K: 245 kg/ha
```

---

### MODULE 04 — Borewell Intelligence (3D)

**Purpose:** 3D subsurface drilling visualization + AI yield/failure prediction

**Reference Borewell — BW-AP-2847:**
```
Location:    Venkatapathirajupet, Anakapalle Mandal
Coords:      17.7102°N, 83.1780°E
Total Depth: 120m | Casing: 18m (MS pipe OD 150mm, ID 132mm)
Screen:      65-95m (slot 1.5mm, open area 15%)
Aquifer 1:   73m — Fractured Basalt, Yield 4.2 LPS, T=12.5
Aquifer 2:   88m — Weathered Granite, Yield 2.1 LPS, T=8.3
```

**Real-Time Telemetry:**
```python
BOREWELL_TELEMETRY = {
    "motor_status": "RUNNING", "rpm": 2840, "power_kw": 7.4, "efficiency_pct": 82.3,
    "pump_depth_m": 85, "dynamic_level_m": 78.2,
    "run_hours_today": 6.5, "run_hours_month": 142,
    "current_yield_lps": 4.2, "design_yield_lps": 6.0,
    "failure_probability_pct": 12, "next_maintenance_days": 45,
    "failure_mode": "Motor bearing wear (thermal signature detected)"
}

WATER_QUALITY = {
    "tds_ppm": 485, "ph": 7.4, "ec_ms_m": 0.82,
    "fluoride_ppm": 0.8, "iron_ppm": 0.3, "nitrate_ppm": 12.5,
    "potability": "SAFE"
}
```

**Algorithms:**
1. **Pump Degradation Model:** `η(t) = η₀ × e^(-λt) + β × maintenance_factor` (λ=0.002/day, β=0.15/service)
2. **Theis Equation (yield):** `s = (Q / 4πT) × W(u)` (drawdown, pumping rate, transmissivity)
3. **Failure Prediction (Random Forest Classifier):** Features: vibration, temperature, power_draw, run_hours, age → Classes: Bearing Failure, Motor Burn, Pipe Corrosion, Impeller Wear

**3D Geological Colors:**
```python
LAYER_COLORS = {
    "Topsoil (0-8m)":    "#8B7355",
    "Clay (8-20m)":      "#A0522D",
    "Weathered (20-40m)":"#CD853F",
    "Fractured (40-65m)":"#696969",
    "Aquifer (65-100m)": "#4682B4",  # Blue = saturated
    "Hard Rock (100m+)": "#2F4F4F",
}
```

---

### MODULE 05 — Drainage Network Monitor

**Purpose:** Real-time drainage health monitoring + overload detection

**Vizag Network Stats:**
```
Total: 142 km | Overloaded segments: 23
Primary Drains: 23 km (900mm+, RCC)
Secondary: 68 km (450-900mm, RCC/HDPE)
Tertiary: 51 km (<450mm, Brick/Stone)
Pump Stations: 7 | STPs Online: 4 | Flood Zones at Risk: 3
```

**Network Nodes:**
```python
DRAINAGE_NODES = [
    {"id": "P1", "name": "MVPS Ward 12",   "type": "Pump",     "capacity_pct": 98, "status": "CRITICAL"},
    {"id": "P2", "name": "Gajuwaka Main",  "type": "Pump",     "capacity_pct": 45, "status": "NORMAL"},
    {"id": "P3", "name": "Dwaraka Nagar",  "type": "Junction", "capacity_pct": 68, "status": "WARNING"},
    {"id": "P4", "name": "Seethammadhara", "type": "Outlet",   "capacity_pct": 52, "status": "NORMAL"},
    {"id": "P5", "name": "Purna Market",   "type": "Junction", "capacity_pct": 94, "status": "CRITICAL"},
    {"id": "S1", "name": "Old City Nala",  "type": "Sewer",    "capacity_pct": 72, "status": "WARNING"},
    {"id": "S2", "name": "Airport Drain",  "type": "Storm",    "capacity_pct": 38, "status": "NORMAL"},
    {"id": "J1", "name": "Main Outfall",   "type": "Outfall",  "capacity_pct": 55, "status": "NORMAL"},
    {"id": "J2", "name": "Rushikonda Junc","type": "Junction", "capacity_pct": 61, "status": "WARNING"},
]
```

**Algorithms:**
1. **Capacity Utilization:** `CUI = (Actual_Flow / Design_Capacity) × 100` — >90%=CRITICAL, 70-90%=WARNING
2. **Manning's Equation:** `v = (1/n) × R^(2/3) × S^(1/2)` — n=0.015 (RCC), n=0.025 (Brick)
3. **Blockage Detection:** `ΔP = P_upstream - P_downstream > threshold → Blockage`
4. **EPA SWMM Integration:** Saint-Venant shallow water equations for network flow

---

### MODULE 06 — Flood Prediction & Alert Engine

**Purpose:** Flood simulation + emergency response + government SMS cascade

**Active Event (Simulated):**
```python
FLOOD_EVENT = {
    "rainfall_24h_mm": 247, "river_level_m": 6.1, "danger_level_m": 5.5,
    "warning_level_m": 4.2, "active_flood_zones": 12, "threat_level": "HIGH",
    "peak_forecast_m": 5.8, "peak_eta": "18:00 TODAY", "recession_hours": 72,
    "sms_alerts_sent": 2847, "displaced": 12400, "relief_camps": 8,
    "ndrf_teams": 4, "sdrf_teams": 6
}

FLOOD_ZONES = [
    {"zone": "Rajahmundry East",  "status": "INUNDATED", "severity": 5},
    {"zone": "Gnana Puram Vizag", "status": "INUNDATED", "severity": 5},
    {"zone": "Purna Market Vizag","status": "RISING",    "severity": 4},
    {"zone": "Airport Area Vizag","status": "WARNING",   "severity": 3},
]
```

**Early Warning Logic:**
```python
if rainfall_24h > 150 and river_level > danger_level_m:
    alert_level = "RED"
elif rainfall_24h > 100 and river_level > warning_level_m:
    alert_level = "ORANGE"
elif rainfall_24h > 50:
    alert_level = "YELLOW"
```

**Algorithms:**
1. **SCS Curve Number:** `Q = (P - 0.2S)² / (P + 0.8S)` where `S = (25400/CN) - 254`
2. **HEC-RAS Integration:** DEM-based water spread; velocity + depth per grid cell
3. **ConvLSTM:** Spatial flood forecasting — Input: radar rainfall grids → Output: inundation maps (48h)
4. **Government Notification Cascade:**
   ```
   Priority 1 → District Collector + NDRF (immediate)
   Priority 2 → GVMC + RDO (within 2 hours)
   Priority 3 → MRO + Police (within 6 hours)
   ```

**Flood Inundation Depths (Vizag):**
```
10-year return: 0.6m | 25-year: 1.2m | 50-year: 2.1m | 100-year: 3.5m
```

---

### MODULE 07 — Aquifer Scanner & Subsurface Tomography

**Purpose:** 3D subsurface water mapping + multi-source analytics

**Vizag Aquifer Data:**
```python
AQUIFER_DATA = {
    "estimated_volume_m3": 2_400_000, "remaining_pct": 42,
    "recharge_rate_m_day": 0.04, "safe_yield_m3_day": 8500,
    "zone_saturation": {"Z01": 45, "Z02": 62, "Z03": 78, "Z04": 34,
                        "Z05": 89, "Z06": 55, "Z07": 71, "Z08": 28}
}

NEARBY_WATER_RESOURCES = [
    {"name": "Mudasarlova Tank",  "dist_km": 8,  "type": "Surface",   "recharge": "HIGH"},
    {"name": "Gosthani River",    "dist_km": 15, "type": "River",     "recharge": "MEDIUM"},
    {"name": "Raiwada Reservoir", "dist_km": 35, "type": "Reservoir", "recharge": "HIGH"},
    {"name": "Coastal Aquifer",   "dist_km": 2,  "type": "Aquifer",   "recharge": "LOW", "salinity_risk": "HIGH"},
]
```

**Algorithms:**
1. **ERT Inversion:** 2D/3D resistivity models — low resistivity = saturated, high = dry rock
2. **InSAR (Sentinel-1):** Ground deformation tracking (subsidence from pumping), 1mm precision
3. **Aquifer Volume:** `V = A × T × S_y` (area × thickness × specific yield)
4. **Seismic Refraction (GRM):** P-wave velocity → Weathered (<800 m/s), Fractured (800-2500), Hard rock (>3000)

**Satellite Parameters:**
```
Altitude: 408 km | Inclination: 98.7° | Passes: 1,779 | Status: ACTIVE
```

---

### MODULE 08 — Crisis Forecast + AI Threat Engine

**Purpose:** Multi-crisis prediction + threat prioritization + automated government alerts

**Current Crisis Index:** 7.2/10 | AI Confidence: 88% | Peak ETA: 14H

**Active Threats:**
```python
CRISIS_THREATS = [
    {
        "priority": "P1", "level": "CRITICAL", "eta": "14H",
        "title": "Krishna Basin — Aquifer Collapse Risk",
        "grace_anomaly_m": -4.8, "depletion_m_day": -0.12,
        "villages_at_risk": 12, "confidence_pct": 88
    },
    {
        "priority": "P2", "level": "HIGH", "eta": "3D",
        "title": "Godavari Delta — Saltwater Intrusion",
        "salinity_above_baseline_ppm": 340, "confidence_pct": 72
    },
    {
        "priority": "P3", "level": "MODERATE", "eta": "7D",
        "title": "Tungabhadra — Reservoir Below Dead Storage",
        "current_fill_pct": 18, "critical_threshold_pct": 15, "confidence_pct": 55
    }
]

# 90-day crisis probability curve
CRISIS_TIMELINE = {
    "day_0": 15, "day_15": 35, "day_30": 55, "day_45": 72,  # PEAK
    "day_60": 68, "day_75": 45, "day_90": 38
}
```

**Algorithms:**
1. **Multi-Threat Risk Score:** `Risk = Σ(wᵢ × sᵢ × pᵢ)` (weight × severity × probability)
2. **LSTM Crisis Timeline:** Inputs: GRACE, rainfall, reservoir levels, NDVI, cyclone track → 90-day probability curve
3. **Prophet:** Long-range drought forecasting
4. **Bayesian Risk Analysis:** Uncertainty quantification on crisis predictions

**Natural Calamities (Simulated):**
```
Cyclone "Asani": 180 km away, 15 km/h approach, 48H landfall, Category 2, NW track
Heavy Rainfall: Extreme, 72 hrs, 450mm accumulation, Flood Risk: VERY HIGH
Heat Wave: 46°C max, 5 days, Agriculture Risk: CRITICAL
```

---

### MODULE 09 — Vizag City Drainage (Hero Module)

**Purpose:** 3D pre-drainage simulation + treatment integration + groundwater contamination prevention

**City Infrastructure:**
```python
VIZAG_CITY_PROFILE = {
    "drainage_blocks": 14, "primary_drains_km": 110, "secondary_drains_km": 280,
    "tertiary_drains_km": 750, "total_storm_km": 1140, "sewer_km": 316,
    "culverts": 142, "manholes": 2840, "pump_stations": 7,
    "catchment_km2": 682, "avg_rainfall_mm": 1200, "runoff_coeff": 0.65,
    "peak_runoff_m3s": 450, "time_of_concentration_min": 45,
    "design_storm_mm": 180  # 25-year return period
}

STPS = [
    {"name": "Mudsarlova", "lat": 17.72, "lon": 83.32, "capacity_mld": 13},
    {"name": "Old City",   "lat": 17.69, "lon": 83.28, "capacity_mld": 38},
    {"name": "Appughar",   "lat": 17.74, "lon": 83.30, "capacity_mld": 25},
    {"name": "Narava",     "lat": 17.75, "lon": 83.25, "capacity_mld": 54, "status": "Under Construction"},
]

WTPS = [
    {"name": "WTP-1", "lat": 17.70, "lon": 83.29, "capacity_mld": 45},
    {"name": "WTP-2", "lat": 17.73, "lon": 83.31, "capacity_mld": 60},
    {"name": "WTP-3", "lat": 17.68, "lon": 83.20, "capacity_mld": 35},
]

SUB_CATCHMENTS = [
    {"name": "Old City",      "area_km2": 45, "runoff_m3s": 85, "elevation_m": 15},
    {"name": "Dwaraka Nagar", "area_km2": 38, "runoff_m3s": 72, "elevation_m": 22},
    {"name": "Gajuwaka",      "area_km2": 52, "runoff_m3s": 68, "elevation_m": 35},
    {"name": "MVP Colony",    "area_km2": 28, "runoff_m3s": 45, "elevation_m": 48},
    {"name": "Rushikonda",    "area_km2": 35, "runoff_m3s": 55, "elevation_m": 65},
    {"name": "Bheemili",      "area_km2": 42, "runoff_m3s": 48, "elevation_m": 12},
    {"name": "Airport Zone",  "area_km2": 58, "runoff_m3s": 77, "elevation_m": 8},
]
```

**3D Simulation Parameters:**
```
Terrain Resolution: 5m | Drain Depth Below Road: 2.5m
Pipe Burial Depth: 3.5m | Manhole Depth: 4.2m
Natural Slope: 1.2% | Designed Drain Slope: 0.8% | Min Self-Cleansing: 0.5%
```

**Algorithms:**
1. **SWMM Pre-Drainage:** DEM integration, sub-catchment delineation (D8 algorithm), time-area hydrograph
2. **Culvert Capacity:** `Q = C × A × √(2gH)` (discharge coefficient, area, head)
3. **Contamination Risk:** `Risk = f(septic_density, soil_permeability, gw_depth, slope)` via AHP weights
4. **STP Siting Optimizer:** `Minimize: Σ(distance × flow × elevation_diff)` subject to capacity + land constraints

**Groundwater Contamination Alert:**
```
Septic Tank Density: 45 per km²
Nitrate Baseline: 8.5 ppm | Current: 18.2 ppm → ALARM
Contamination Hotspots: Old City, Purna Market, Gnanapuram
```

**Efficiency Targets:**
```
Current Drainage Efficiency: 58% → Post-Upgrade Target: 85%
Flood Reduction: 65% | Water Reuse: 85 MLD | Energy Savings: 2,400 kWh/day
GW Contamination Reduction: 70%
```

---

## 4. WORLD-CLASS DISTRIBUTED ARCHITECTURE (vNext)

### 4.1 Real-Time Streaming Pipelines

**Kafka Topics (create all at startup):**
```
groundwater.telemetry    — CGWB/SGWD well readings
borewell.metrics         — pump RPM, yield, power
rainfall.events          — IMD + NASA GPM precipitation
flood.alerts             — alert level changes
satellite.ingestion      — new raster tiles available
drainage.flow            — network node flow rates
pump.telemetry           — pump station status
soil.moisture            — SMAP + Sentinel-1 readings
crisis.predictions       — ML output events
```

**Stream Processing (Flink):**
```python
# Pattern: Anomaly detection on groundwater telemetry
pattern = Pattern.begin("rapid_decline") \
    .where(lambda e: e["depletion_rate"] < -0.1) \
    .next("sustained") \
    .where(lambda e: e["depletion_rate"] < -0.1) \
    .within(timedelta(days=7))
```

### 4.2 Vector Geospatial Search

**Use pgvector + Qdrant for:**
- Similar aquifer retrieval (find analogous regions)
- Terrain similarity (find zones with similar drainage profiles)
- Borewell recommendation (based on geological similarity)

**Embedding pipeline:**
```
Raster tile → NDVI/geology/terrain feature extraction → 512-dim vector → Qdrant index
Query: "find zones similar to Rushikonda Critical zone" → top-k ANN search
```

### 4.3 Distributed Raster Processing

```python
# Dask parallel NDVI computation
import dask.array as da
import rasterio
from dask_rasterio import read_raster

nir = read_raster("sentinel2_B8.tif")   # B8 NIR
red = read_raster("sentinel2_B4.tif")   # B4 Red
ndvi = (nir - red) / (nir + red)
ndvi.compute()  # parallel execution across workers
```

**Storage formats:**
- Cloud Optimized GeoTIFF (COG) — for streaming tile access
- Zarr — for multi-dimensional arrays (time × lat × lon × band)
- Parquet — for tabular sensor data

### 4.4 GPU-Accelerated Simulation

```python
# RAPIDS cuDF for GPU-accelerated dataframes
import cudf
df = cudf.read_parquet("groundwater_telemetry.parquet")
# 100x faster than pandas for large datasets

# CuPy for flood propagation
import cupy as cp
terrain_gpu = cp.asarray(terrain_dem)
water_depth_gpu = cp.zeros_like(terrain_gpu)
# GPU kernel flood simulation
```

### 4.5 Graph Neural Networks (Water Networks)

```python
# PyTorch Geometric — Drainage network GNN
from torch_geometric.nn import GraphSAGE, GATConv

class DrainageGNN(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = GraphSAGE(in_channels=16, hidden_channels=64, num_layers=3)
        self.conv2 = GATConv(64, 32, heads=4)

# Nodes: Reservoirs, Pumps, Junctions, Farms, Borewells
# Edges: Pipes, Canals, Drainage links
# Task: Predict flow at each node + failure propagation
```

### 4.6 Multi-Agent System

```python
AGENT_TYPES = {
    "HydrologyAgent":     ["groundwater_reasoning", "aquifer_analysis"],
    "ClimateAgent":       ["rainfall_forecasting", "cyclone_analysis"],
    "InfrastructureAgent":["drainage_optimization", "pipe_maintenance"],
    "AgriculturalAgent":  ["crop_switching", "irrigation_scheduling"],
    "EmergencyAgent":     ["flood_response", "crisis_escalation", "sms_dispatch"]
}
```

### 4.7 Reinforcement Learning (Irrigation + Reservoir)

```python
# RL Environment specification
STATE_SPACE = ["soil_moisture", "reservoir_levels", "weather_forecast", "crop_stress", "groundwater_depth"]
ACTION_SPACE = ["irrigation_volume", "gate_open_pct", "pump_schedule", "drain_flow"]
REWARD = "water_savings × yield_maintained × energy_reduction"

# Algorithms: PPO (Proximal Policy Optimization) for irrigation
#             SAC (Soft Actor-Critic) for reservoir release
#             Multi-Agent RL for city-scale water balancing
```

---

## 5. DATA PIPELINE (End-to-End)

```
Raw Satellite Data (Sentinel-1/2, GRACE-FO, SMAP, MODIS)
    ↓ [Kafka Producer — satellite.ingestion]
Preprocessing (GDAL reprojection → EPSG:32644, cloud masking)
    ↓
Raster Alignment (10m grid, Vizag bbox: 17.5-18.1°N, 83.0-83.6°E)
    ↓
Feature Extraction (NDVI, MNDWI, TWSA, soil moisture, terrain indices)
    ↓ [Flink stream processing]
Feature Store (Redis — hot features; TimescaleDB — time-series history)
    ↓
ML Inference (LSTM → 30/90-day forecasts; RF → GWPI; ConvLSTM → flood maps)
    ↓ [Kafka Consumer — crisis.predictions]
API Gateway (FastAPI + GraphQL)
    ↓
Frontend Visualization (Deck.gl, Three.js, CesiumJS, Mapbox)
```

**Bounding Box for all raster operations:**
```python
VIZAG_BBOX = {
    "min_lat": 17.5, "max_lat": 18.1,
    "min_lon": 83.0, "max_lon": 83.6,
    "crs": "EPSG:4326",
    "utm_crs": "EPSG:32644"  # UTM Zone 44N
}
```

---

## 6. API STRUCTURE

```
GET  /api/v2/groundwater/zones          — All zone health
GET  /api/v2/groundwater/forecast/{id}  — 30/90-day LSTM forecast
GET  /api/v2/groundwater/gwpi-raster    — GWPI heatmap tiles (MVT)
GET  /api/v2/reservoirs                 — All reservoir status
GET  /api/v2/reservoirs/{id}/storage    — Live storage cross-section data
GET  /api/v2/irrigation/zones           — All 64 NDVI zones
GET  /api/v2/irrigation/schedule        — AI irrigation schedule
GET  /api/v2/borewell/{id}              — Full borewell telemetry
GET  /api/v2/borewell/{id}/geology      — 3D layer data
GET  /api/v2/drainage/nodes             — Network node status
GET  /api/v2/flood/active               — Active flood event
GET  /api/v2/flood/zones                — Inundation map data
GET  /api/v2/aquifer/scan               — Aquifer scan data
GET  /api/v2/crisis/threats             — Threat priority queue
GET  /api/v2/crisis/timeline            — 90-day probability curve
GET  /api/v2/drainage/city              — City drainage full data

WS   /ws/telemetry                      — Live sensor feeds (Kafka → WebSocket)
WS   /ws/alerts                         — Alert push stream
```

---

## 7. DATABASE SCHEMA (Key Tables)

```sql
-- TimescaleDB hypertable for groundwater readings
CREATE TABLE groundwater_readings (
    time TIMESTAMPTZ NOT NULL,
    well_id TEXT, zone_id TEXT,
    depth_m FLOAT, grace_anomaly_m FLOAT,
    soil_moisture_pct FLOAT, rainfall_mm FLOAT,
    depletion_rate_m_day FLOAT, risk_level TEXT
);
SELECT create_hypertable('groundwater_readings', 'time');

-- PostGIS spatial data
CREATE TABLE groundwater_zones (
    zone_id TEXT PRIMARY KEY,
    location TEXT, geom GEOMETRY(Point, 4326),
    gwpi FLOAT, aquifer_type TEXT, trend TEXT,
    updated_at TIMESTAMPTZ
);

-- Reservoir time-series
CREATE TABLE reservoir_readings (
    time TIMESTAMPTZ NOT NULL,
    reservoir_id TEXT, fill_pct FLOAT,
    inflow_cusecs FLOAT, outflow_cusecs FLOAT,
    live_storage_tmc FLOAT, status TEXT
);
SELECT create_hypertable('reservoir_readings', 'time');
```

---

## 8. FRONTEND COMPONENT ARCHITECTURE

```
app/
├── layout.tsx                 — Root layout, providers
├── page.tsx                   — Landing / module selector
├── (modules)/
│   ├── groundwater/
│   │   ├── page.tsx           — GWPI map + forecast panel
│   │   ├── components/
│   │   │   ├── GwpiHeatmap.tsx         — Deck.gl HeatmapLayer
│   │   │   ├── GeologicalCrossSection.tsx — Three.js 3D layers
│   │   │   ├── ForecastChart.tsx       — D3.js 30/90-day chart
│   │   │   └── DrillSiteScorecard.tsx  — Click-to-analyze panel
│   ├── reservoir/
│   │   ├── ReservoirMap.tsx   — Mapbox markers + Deck.gl fills
│   │   ├── StorageCrossSection.tsx — Three.js reservoir volume
│   │   └── CropImpactPanel.tsx
│   ├── irrigation/
│   │   ├── NdviGrid.tsx       — 8×8 Deck.gl GridLayer
│   │   ├── CropRecommendation.tsx
│   │   └── IrrigationSchedule.tsx
│   ├── borewell/
│   │   ├── BorewellScene.tsx  — Three.js 3D geological model
│   │   ├── TelemetryDashboard.tsx
│   │   └── FailurePrediction.tsx
│   ├── drainage/
│   │   ├── NetworkGraph.tsx   — D3.js force graph
│   │   ├── FlowAnimation.tsx  — Three.js particle system
│   │   └── NodeStatusPanel.tsx
│   ├── flood/
│   │   ├── FloodMap.tsx       — Deck.gl PolygonLayer (inundation)
│   │   ├── AlertPanel.tsx     — Real-time alert feed
│   │   └── EvacuationTracker.tsx
│   ├── aquifer/
│   │   ├── AquiferTomography.tsx — Three.js 3D volume render
│   │   └── ZoneSaturation.tsx
│   ├── crisis/
│   │   ├── ThreatQueue.tsx    — Priority P1/P2/P3 cards
│   │   ├── CrisisTimeline.tsx — D3.js probability curve
│   │   └── AgencyStatus.tsx
│   └── city-drainage/
│       ├── CityTwin.tsx       — CesiumJS digital twin
│       ├── PipelineNetwork.tsx
│       └── StpRouting.tsx
└── components/
    ├── MapBase.tsx            — Mapbox GL wrapper
    ├── TimeSlider.tsx         — Global time control
    ├── AlertBanner.tsx        — Top-level crisis alerts
    └── SatelliteOverlay.tsx   — COG tile streaming
```

---

## 9. SECURITY & COMPLIANCE

```
Authentication:    OAuth2 + JWT (role-based: Admin, Analyst, Field Officer, Public)
Authorization:     RBAC with geospatial access control (zone-level permissions)
API Security:      Rate limiting (100 req/min public, 1000 req/min authenticated)
Data:              Encrypted at rest (AES-256), TLS 1.3 in transit
Streaming:         Kafka SSL + SASL authentication
Secrets:           Kubernetes Secrets + HashiCorp Vault
Architecture:      Zero-trust — all service-to-service via mTLS
```

---

## 10. OBSERVABILITY

```yaml
# Prometheus metrics to expose
aquaintelli_groundwater_depth_m{zone, well_id}
aquaintelli_reservoir_fill_pct{reservoir_id}
aquaintelli_flood_alert_level{zone}
aquaintelli_ml_inference_latency_ms{model_name}
aquaintelli_kafka_consumer_lag{topic, group}
aquaintelli_api_request_duration_ms{endpoint, method, status}
```

```
Grafana Dashboards: Module health, ML model drift, Kafka throughput, K8s pod health
Loki: Structured logging (JSON) from all services
Jaeger: Distributed trace → API → ML → DB latency breakdown
```

---

## 11. DEPLOYMENT (Kubernetes)

```yaml
# Namespace structure
namespaces:
  - aquaintelli-frontend
  - aquaintelli-api
  - aquaintelli-ml
  - aquaintelli-streaming
  - aquaintelli-storage
  - aquaintelli-monitoring

# GPU nodes for ML inference
nodeSelector:
  cloud.google.com/gke-accelerator: nvidia-tesla-t4

# Autoscaling
horizontalPodAutoscaler:
  ml-inference: minReplicas=2 maxReplicas=10 cpuThreshold=70%
  api-gateway: minReplicas=3 maxReplicas=20 cpuThreshold=60%
```

---

## 12. IMPLEMENTATION ORDER (Recommended Sequence)

```
Phase 1 — Core Foundation (Weeks 1-4)
  ✓ Database setup (PostGIS + TimescaleDB)
  ✓ Kafka cluster + core topics
  ✓ FastAPI skeleton + all API endpoints (mock data)
  ✓ Next.js frontend shell + Mapbox base map
  ✓ Module 01: Groundwater (LSTM model + GWPI map)

Phase 2 — Modules (Weeks 5-12)
  ✓ Module 04: Borewell (3D Three.js + telemetry) — high visual impact
  ✓ Module 06: Flood (ConvLSTM + alert cascade)
  ✓ Module 09: City Drainage (Hero — SWMM + 3D)
  ✓ Module 02: Reservoir (mass balance + crop impact)
  ✓ Module 03: Irrigation (NDVI + WIS LightGBM)
  ✓ Module 08: Crisis Forecast (multi-threat + govt alerts)
  ✓ Module 05: Drainage Network
  ✓ Module 07: Aquifer Scanner
  ✓ Module 09: Digital Twin (CesiumJS)

Phase 3 — World-Class Features (Weeks 13-20)
  ✓ Kafka Flink stream processing (real-time anomaly detection)
  ✓ GNN drainage network (PyTorch Geometric)
  ✓ Vector search (Qdrant — aquifer similarity)
  ✓ RL irrigation optimizer (PPO)
  ✓ GPU flood simulation (CuPy + Three.js WebGL)
  ✓ Multi-agent planning system
  ✓ Full Kubernetes deployment + CI/CD

Phase 4 — Production (Weeks 21-24)
  ✓ Real CGWB data integration
  ✓ IMD weather API connection
  ✓ GVMC drainage data sync
  ✓ SMS alert gateway (government officials)
  ✓ Mobile-responsive UI
  ✓ Regional language support (Telugu)
```

---

## 13. CRITICAL IMPLEMENTATION NOTES

1. **All mocked data is geographically accurate** — use the coordinates in this SKILL exactly; they match real Vizag locations from CGWB NAQUIM 2.0 and GVMC City Development Plan.

2. **GRACE-FO data** — download from NASA PO.DAAC (podaac.jpl.nasa.gov); use RL-06M mascon solutions; current Vizag anomaly: -2.66m EWH.

3. **EPSG:32644** — always use this UTM CRS for raster processing in the Vizag region (UTM Zone 44N); convert to EPSG:4326 only for final GeoJSON output.

4. **TimescaleDB chunk interval** — set `chunk_time_interval = INTERVAL '7 days'` for groundwater_readings; queries are typically 30-180 day windows.

5. **Module 09 is the HERO module** — no other platform combines 3D pre-drainage simulation + contamination mapping + STP routing + flood inundation + culvert inventory. Prioritize its visual quality.

6. **Kafka consumer groups** — use separate groups per module; never share across ML inference and frontend WebSocket relay.

7. **Three.js geological rendering** — use `BoxGeometry` for each layer; scale Y by layer thickness; enable `castShadow` and `receiveShadow`; use `MeshPhongMaterial` with the exact hex colors from the layer color map above.

8. **WebSocket telemetry** — push borewell telemetry every 5 seconds, groundwater depth every 60 seconds, crisis alerts immediately on state change.

9. **Government SMS integration** — use India's Kaleyra or MSG91 gateway; format: district code + severity + location + action required; DLT registration required for transactional SMS.

10. **Data licensing** — CGWB data is freely available under Open Government Data (OGD) India; NASA POWER and GRACE-FO are publicly accessible; Sentinel data via ESA Copernicus Open Access Hub.
```

---

*AquaIntelli v2 SKILL.md — Consolidated from: AquaIntelli_v2_Blueprint.docx, AQUAINTELLI_V2_TECHNICAL_SPEC.txt, AquaIntelli_Implementation_Blueprint.md, AquaIntelli_WorldClass_Architecture.md, project-overview.txt*
