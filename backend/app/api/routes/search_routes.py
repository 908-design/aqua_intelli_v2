"""
AquaIntelli - API Routes: Location Search
"""
from fastapi import APIRouter, Query
from typing import List, Dict
import json
import os
from pathlib import Path
import time

router = APIRouter(prefix="/search", tags=["Navigation"])

# Load GADM level 2 (districts) for search
ROOT = Path(__file__).parent.parent.parent.parent
GADM_PATH = ROOT / "data" / "gadm" / "gadm41_IND_2.json"


def _debug_log(hypothesis_id: str, location: str, message: str, data: dict):
    from ...utils.logger import _debug_log as logger
    logger(hypothesis_id, location, message, data)

@router.get("/locations")
async def search_locations(q: str = Query("", min_length=2)):
    """Fuzzy search for Indian districts."""
    if not q or len(q) < 2:
        return []
    
    q = q.lower()
    _debug_log("H2", "backend/app/api/routes/search_routes.py:search_locations", "Search request", {"query": q})
    if q == "vizag":
        q = "visakhapatnam"
    matches = []
    
    try:
        if GADM_PATH.exists():
            with open(GADM_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                features = data.get("features", [])
                for feat in features:
                    props = feat.get("properties", {})
                    name = props.get("NAME_2", "")  # District
                    state = props.get("NAME_1", "") # State
                    
                    if q in name.lower() or q in state.lower():
                        # Use a deterministic "random" coordinate based on name hash for demo stability
                        import hashlib
                        h = int(hashlib.md5(name.encode()).hexdigest(), 16)
                        lat = 10 + (h % 2000) / 100
                        lon = 70 + ((h >> 8) % 2000) / 100
                        
                        matches.append({
                            "name": f"{name}, {state}, India",
                            "district": name,
                            "state": state,
                            "type": "district",
                            "lat": round(lat, 4),
                            "lon": round(lon, 4)
                        })
                        if len(matches) > 10: break
    except Exception:
        pass
    
    # Fallback/Hardcoded major cities
    hardcoded = [
        {"name": "Visakhapatnam, Andhra Pradesh, India", "lat": 17.6939, "lon": 83.2922},
        {"name": "Hyderabad, Telangana, India", "lat": 17.385, "lon": 78.487},
        {"name": "Vijayawada, Andhra Pradesh, India", "lat": 16.506, "lon": 80.648},
        {"name": "Chennai, Tamil Nadu, India", "lat": 13.0827, "lon": 80.2707},
        {"name": "Bengaluru, Karnataka, India", "lat": 12.9716, "lon": 77.5946},
        {"name": "Delhi, India", "lat": 28.6139, "lon": 77.2090},
        {"name": "Mumbai, Maharashtra, India", "lat": 19.0760, "lon": 72.8777},
    ]
    
    for h in hardcoded:
        if q in h["name"].lower():
            # Avoid duplicates if name matches
            if not any(m["name"] == h["name"] for m in matches):
                matches.append(h)
            
    result = matches[:15]
    _debug_log("H2", "backend/app/api/routes/search_routes.py:search_locations:return", "Search results prepared", {"count": len(result), "first_name": result[0]["name"] if result else None})
    return result
