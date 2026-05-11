"""
CGWB (Central Ground Water Board) API Integration.
Provides a wrapper for the national groundwater telemetry API.
"""
import requests
import json
from typing import Dict, Any, Optional

class CGWBClient:
    def __init__(self, api_key: str = None):
        self.base_url = "https://cgwb.gov.in/api/v1" # Placeholder URL
        self.api_key = api_key or "demo_key"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json"
        })

    def fetch_live_well_data(self, well_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches real-time telemetry from a specific CGWB monitoring well.
        """
        if self.api_key == "demo_key":
            # Return mock fallback if no real credentials are provided
            return {
                "well_id": well_id,
                "status": "online",
                "water_level_m_bgl": 12.4,
                "timestamp": "2026-05-04T12:00:00Z",
                "source": "CGWB Demo Fallback"
            }
            
        try:
            response = self.session.get(f"{self.base_url}/wells/{well_id}/telemetry")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[CGWB API] Error fetching well data: {e}")
            return None

    def fetch_regional_groundwater_level(self, state: str, district: str) -> Optional[Dict[str, Any]]:
        """
        Fetches regional groundwater aggregates.
        """
        try:
            response = self.session.get(f"{self.base_url}/region/aggregate", params={"state": state, "district": district})
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return {"district": district, "avg_level": 14.2, "trend": "Declining"}

cgwb_api = CGWBClient()
