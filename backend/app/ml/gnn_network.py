"""
AquaIntelli - Graph Neural Networks Engine (Item 10 in SKILL.md)
Models infrastructure and water networks using PyTorch Geometric (simulated).
"""
from typing import Dict, Any
from .pytorch_gnn import run_gnn_inference

class GNNDrainageModel:
    def __init__(self):
        self.nodes = ["pumps", "reservoirs", "borewells", "junctions", "canals"]
        self.edges = ["pipelines", "canals", "drainage paths"]
        self.model_type = "Spatial-Temporal GraphSAGE (PyTorch Geometric)"

    def predict_network_failure(self, network_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs message passing over the infrastructure graph using the real PyTorch GNN.
        """
        print("[GNN Engine] Running real GNN inference on network topology...")
        
        nodes = network_data.get("nodes", [])
        edges = network_data.get("edges", [])
        
        if not nodes or not edges:
            return {"status": "error", "message": "Nodes and edges required for GNN inference"}
            
        # Prepare features: [capacity_pct, current_flow, pressure]
        node_features = [
            [n.get("capacity_pct", 50)/100, n.get("current_flow", 10)/100, n.get("pressure", 30)/100]
            for n in nodes
        ]
        
        # Prepare edge_index: [[src, src...], [dst, dst...]]
        edge_index = [[], []]
        for edge in edges:
            edge_index[0].append(edge[0])
            edge_index[1].append(edge[1])
            
        try:
            preds = run_gnn_inference(node_features, edge_index)
            vulnerable_nodes = []
            for i, prob in enumerate(preds):
                if prob[0] > 0.6:
                    vulnerable_nodes.append({
                        "node_id": nodes[i].get("name", f"Node_{i}"),
                        "failure_prob": round(float(prob[0]), 2),
                        "cascading_impact": ["downstream_ward_" + str(i+1)]
                    })
            
            return {
                "model": self.model_type,
                "vulnerabilities": vulnerable_nodes,
                "global_network_health": round(100 - (sum(p[0] for p in preds)/len(preds)*100), 2)
            }
        except Exception as e:
            print(f"[GNN Engine] Error: {e}")
            return {"status": "error", "message": str(e)}

gnn_engine = GNNDrainageModel()
