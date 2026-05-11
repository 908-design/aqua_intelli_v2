"""
AquaIntelli - API Routes: Database Health & Info
"""
from fastapi import APIRouter
from ...database.nosql_db import get_nosql_db
from ...database.graph_db import get_graph_db

router = APIRouter(prefix="/db", tags=["Database"])


@router.get("/health", summary="All database health status")
async def db_health():
    nosql = get_nosql_db()
    graph = get_graph_db()
    return {
        "sql": {"status": "connected", "type": "SQLite (dev) / PostgreSQL (prod)"},
        "nosql": {
            "status": "connected",
            "type": "Mock" if type(nosql).__name__ == "MockMongoDB" else "MongoDB",
        },
        "graph": {
            "status": "connected",
            "type": "Neo4j" if hasattr(graph, '_session') else "Mock",
        },
    }


@router.get("/graph/nodes", summary="Graph database nodes")
async def graph_nodes():
    graph = get_graph_db()
    with graph.session() as session:
        result = session.run("MATCH (n) RETURN n")
        nodes = [dict(record["n"]) for record in result]
    return {"nodes": nodes, "count": len(nodes)}


@router.get("/graph/relationships", summary="Graph database relationships")
async def graph_relationships():
    graph = get_graph_db()
    with graph.session() as session:
        result = session.run("MATCH ()-[r]->() RETURN r")
        rels = [
            {
                "id": record["r"].id,
                "type": record["r"].type,
                "start": record["r"].start_node.id,
                "end": record["r"].end_node.id,
                "properties": dict(record["r"])
            }
            for record in result
        ]
    return {"relationships": rels, "count": len(rels)}
