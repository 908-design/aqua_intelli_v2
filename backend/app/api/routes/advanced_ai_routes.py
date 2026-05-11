from fastapi import APIRouter
from typing import Dict, Any

from ...genai.multi_agent_system import multi_agent_system
from ...genai.geo_rag import geo_rag, nl_gis
from ...ml.causal_engine import causal_engine
from ...ml.rl_optimizer import rl_optimizer
from ...ml.gnn_network import gnn_engine
from ...services.report_generator import report_generator

router = APIRouter(tags=["Advanced AI OS"], prefix="/os")

@router.post("/multi-agent/plan")
def trigger_multi_agent_plan(conditions: Dict[str, Any]):
    return multi_agent_system.plan_water_distribution(conditions)

@router.get("/georag/search")
def geo_rag_search(query: str, lat: float, lon: float, radius: float = 10.0):
    return geo_rag.semantic_spatial_search(query, lat, lon, radius)

@router.post("/gis/text-to-sql")
def text_to_sql(query: str):
    sql = nl_gis.text_to_postgis(query)
    return {"nl_query": query, "postgis_sql": sql}

@router.post("/causal/explain")
def explain_causality(event: str, context: Dict[str, Any]):
    return causal_engine.explain_event(event, context)

@router.post("/rl/optimize")
def get_rl_action(state: Dict[str, float]):
    return rl_optimizer.get_optimal_action(state)

@router.post("/gnn/analyze-network")
def analyze_network_topology(network_data: Dict[str, Any]):
    return gnn_engine.predict_network_failure(network_data)

@router.post("/reports/generate")
def generate_ai_report(region: str, report_type: str, context: Dict[str, Any]):
    return report_generator.generate_assessment_report(region, report_type, context)
