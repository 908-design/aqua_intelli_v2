from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/drainage", tags=["City Drainage Integration"])

class AllocationRequest(BaseModel):
    ward_id: str
    population_density: float
    flood_risk_score: float
    infrastructure_age_years: float
    social_vulnerability_index: float

class SimulationRequest(BaseModel):
    rainfall_intensity_mm_hr: float
    duration_hours: float
    green_infrastructure_reduction_pct: float

class CitizenReport(BaseModel):
    issue_type: str # blockage/overflow/safety/stagnation
    lat: float
    lon: float
    photo_url: str = ""

@router.get("/network/status")
async def get_network_status():
    """Real-time city drain network overview"""
    overloaded_wards = random.randint(2, 10)
    avg_capacity = round(random.uniform(60, 95), 1)
    
    return {
        "status": "active",
        "overloaded_wards_count": overloaded_wards,
        "avg_capacity_used_pct": avg_capacity,
        "pump_stations_active": random.randint(15, 25),
        "flood_eta_hours": round(random.uniform(1.5, 12), 1) if avg_capacity > 85 else None,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/allocation/calculate")
async def calculate_allocation(req: AllocationRequest):
    """Ward scoring formula with budget distribution & rational-method pipe sizing"""
    # Score = (Pop * Risk * Age * Vuln) / 1000
    score = (req.population_density * req.flood_risk_score * req.infrastructure_age_years * req.social_vulnerability_index) / 1000
    budget_allocated = round(score * 150000, 2) # Arbitrary multiplier for budget in INR
    pipe_size_mm = 600 if score > 50 else (450 if score > 30 else 300)
    
    return {
        "ward_id": req.ward_id,
        "allocation_score": round(score, 2),
        "recommended_budget_inr": budget_allocated,
        "optimal_pipe_size_mm": pipe_size_mm,
        "priority": "HIGH" if score > 50 else "MEDIUM"
    }

@router.post("/simulation/run")
async def run_simulation(req: SimulationRequest):
    """Full rainfall simulation using rational method Q = C.i.A"""
    c_factor = random.uniform(0.6, 0.9) - (req.green_infrastructure_reduction_pct / 100.0)
    c_factor = max(0.1, c_factor) 
    area_ha = 150 # example catchment area
    
    peak_discharge = c_factor * req.rainfall_intensity_mm_hr * area_ha / 360 # rational formula
    
    impacts = {
        "peak_discharge_m3s": round(peak_discharge, 2),
        "system_stress_pct": min(100, round(peak_discharge * 2.5, 1)),
        "inundation_risk": "CRITICAL" if peak_discharge > 25 else "MANAGEABLE",
        "time_to_peak_min": round(req.duration_hours * 60 * 0.4, 1)
    }
    return impacts

@router.post("/citizen/report")
async def file_citizen_report(req: CitizenReport):
    """Accepts issue type, GPS, photo; returns assigned team & SLA"""
    ticket_id = f"DRN-{random.randint(10000, 99999)}"
    team_assigned = random.choice(["Alpha-Desilt", "Bravo-Pump", "Charlie-Emergency", "Delta-Civil"])
    
    sla_hours = 4 if req.issue_type == "overflow" else (12 if req.issue_type == "safety" else 24)
    deadline = (datetime.utcnow() + timedelta(hours=sla_hours)).isoformat()
    
    return {
        "ticket_id": ticket_id,
        "assigned_team": team_assigned,
        "sla_deadline": deadline,
        "status": "DISPATCHED"
    }

@router.get("/equity/scores")
async def get_equity_scores():
    """Social equity index per ward composite"""
    # Return mock scores for 5 sample wards
    wards = []
    for i in range(1, 6):
        adequacy = random.randint(40, 90)
        slum_pct = random.randint(5, 45)
        age = random.randint(10, 50)
        health_risk = random.randint(20, 80)
        
        equity_index = round((adequacy * 0.4) + ((100-slum_pct) * 0.3) + ((100-age)*0.1) + ((100-health_risk)*0.2), 1)
        
        wards.append({
            "ward_id": f"W-{i}",
            "equity_score_0_to_100": equity_index,
            "metrics": {
                "adequacy": adequacy,
                "slum_pct": slum_pct,
                "pipe_age_yr": age,
                "health_risk": health_risk
            }
        })
    return {"wards": wards, "city_average": round(sum([w['equity_score_0_to_100'] for w in wards])/5, 1)}

@router.get("/maintenance/schedule")
async def get_maintenance_schedule():
    """AI-predicted desilting schedule using sediment accumulation model"""
    schedule = []
    for i in range(3):
        urgency = random.choice(["IMMEDIATE", "WITHIN_7_DAYS", "ROUTINE_30_DAYS"])
        team_size = 8 if urgency == "IMMEDIATE" else 4
        schedule.append({
            "drain_segment": f"TRUNK-{random.randint(100, 999)}",
            "sediment_load_pct": random.randint(40, 95),
            "urgency": urgency,
            "required_team_size": team_size,
            "equipment": ["Jet-Vac Truck", "CCTV Crawler"] if urgency == "IMMEDIATE" else ["Manual Tools"]
        })
    return {"tasks": schedule}
