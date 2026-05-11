import asyncio
import json
import csv
from pathlib import Path
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSockets"])

DATASETS = Path(__file__).parent.parent.parent.parent.parent / "datasets"

def load_telemetry():
    path = DATASETS / "m04_pump_telemetry_timeseries.csv"
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

@router.websocket("/ws/telemetry/{borewell_id}")
async def websocket_telemetry_endpoint(websocket: WebSocket, borewell_id: str):
    await websocket.accept()
    telemetry_data = load_telemetry()
    if not telemetry_data:
        await websocket.send_json({"error": "Telemetry data not available"})
        await websocket.close()
        return

    try:
        # Simulate real-time streaming by looping through the dataset
        index = 0
        while True:
            # Send one row of telemetry every 5 seconds (fast-forward for demo: 2s)
            row = telemetry_data[index % len(telemetry_data)]
            payload = {
                "borewell_id": borewell_id,
                "event_type": "TELEMETRY_UPDATE",
                "data": row
            }
            await websocket.send_json(payload)
            index += 1
            await asyncio.sleep(2)  # Stream frequency
    except WebSocketDisconnect:
        print(f"Client disconnected from telemetry stream for {borewell_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
