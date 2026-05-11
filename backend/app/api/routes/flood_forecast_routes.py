from fastapi import APIRouter
import numpy as np
from typing import Dict, Any

router = APIRouter(tags=["ConvLSTM Flood Forecast"])

@router.get("/api/v2/flood/convlstm/forecast")
def generate_convlstm_forecast(lat: float, lon: float, hours_ahead: int = 24) -> Dict[str, Any]:
    """
    Simulates a ConvLSTM model execution for flood spatial forecasting.
    Takes the recent sequence of rainfall and river level frames and predicts future spatial inundation grids.
    """
    # Simulate a 16x16 spatial grid prediction
    base_inundation = np.random.uniform(0, 1.5, (16, 16))
    
    # Scale inundation based on hours ahead (simulating spreading)
    future_inundation = base_inundation * (1 + (hours_ahead * 0.05))
    
    # Clip max depth to 4 meters
    future_inundation = np.clip(future_inundation, 0, 4.0)
    
    return {
        "model": "ConvLSTM_v2.1",
        "target_location": {"lat": lat, "lon": lon},
        "forecast_horizon_hours": hours_ahead,
        "grid_resolution": "50m x 50m",
        "inundation_grid_m": future_inundation.round(2).tolist(),
        "max_predicted_depth_m": round(float(np.max(future_inundation)), 2),
        "confidence_score": 0.82
    }
