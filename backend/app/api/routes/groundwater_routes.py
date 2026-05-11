"""
AquaIntelli - API Routes: Groundwater
"""
from fastapi import APIRouter, Query
from ...services.groundwater_service import get_groundwater_status

router = APIRouter(prefix="/groundwater", tags=["Groundwater"])


@router.get("/status", summary="Get groundwater status for a location",
            description="Returns GRACE-FO anomaly, soil moisture, rainfall, AI forecast, and alert severity.")
async def groundwater_status(
    lat: float = Query(17.6939, description="Latitude (default: Vizag)"),
    lon: float = Query(83.2922, description="Longitude (default: Vizag)"),
    district: str = Query("Visakhapatnam", description="District name"),
    state: str = Query("Andhra Pradesh", description="State name"),
):
    return await get_groundwater_status(lat, lon, district, state)


@router.get("/regional", summary="Regional groundwater overview",
            description="Returns groundwater status for multiple locations in a state.")
async def regional_overview(
    state: str = Query("Andhra Pradesh", description="State name"),
):
    regions = {
        "Andhra Pradesh": [
            {"district": "Visakhapatnam", "lat": 17.6939, "lon": 83.2922},
            {"district": "Krishna", "lat": 16.5, "lon": 80.6},
            {"district": "Guntur", "lat": 16.3, "lon": 80.5},
            {"district": "Anantapur", "lat": 14.7, "lon": 77.6},
        ],
        "Rajasthan": [
            {"district": "Jodhpur", "lat": 26.3, "lon": 73.0},
            {"district": "Jaipur", "lat": 26.9, "lon": 75.8},
            {"district": "Barmer", "lat": 25.7, "lon": 71.4},
        ],
        "Punjab": [
            {"district": "Ludhiana", "lat": 30.9, "lon": 75.9},
            {"district": "Amritsar", "lat": 31.6, "lon": 74.9},
            {"district": "Patiala", "lat": 30.3, "lon": 76.4},
        ],
    }
    locations = regions.get(state, regions["Andhra Pradesh"])
    results = []
    for loc in locations:
        status = await get_groundwater_status(loc["lat"], loc["lon"], loc["district"], state)
        results.append(status)
@router.get("/viz/telemetry", summary="Get real-time telemetry plot")
async def get_telemetry_viz(depth: float = 12.5):
    from ...services.viz_service import viz_service
    img_b64 = viz_service.generate_groundwater_telemetry(depth)
    return {"image": img_b64}


@router.get("/viz/forecast", summary="Get LSTM forecast plot")
async def get_forecast_viz(lat: float = 17.69, lon: float = 83.29):
    from ...services.viz_service import viz_service
    from ...services.groundwater_service import get_groundwater_status
    status = await get_groundwater_status(lat, lon, "Visakhapatnam", "Andhra Pradesh")
    img_b64 = viz_service.generate_groundwater_forecast(status["forecast"]["forecast_array"])
    return {"image": img_b64}


@router.get("/viz/model", summary="Get model analysis plot")
async def get_model_viz(model_id: str = "model-1"):
    from ...services.viz_service import viz_service
    img_b64 = viz_service.generate_model_analysis(model_id, {})
    return {"image": img_b64}

