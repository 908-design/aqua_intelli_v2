import json
import time
import os
import logging
from pathlib import Path

# Setup standard logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AquaIntelli")

# Cross-platform log path
ROOT = Path(__file__).parent.parent.parent.parent
DEFAULT_LOG_PATH = ROOT / "debug-bee3ae.log"

def _debug_log(hypothesis_id: str, location: str, message: str, data: dict, session_id: str = "bee3ae"):
    """
    Standardized cross-platform debug logging for the agent environment.
    Replaces hardcoded Windows paths.
    """
    log_entry = {
        "sessionId": session_id,
        "runId": os.getenv("AQUA_RUN_ID", "pre-fix"),
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000)
    }
    
    try:
        # Log to standard output for visibility in server logs
        logger.info(f"[{hypothesis_id}] {location}: {message} | {json.dumps(data)}")
        
        # Log to file if possible (handling cross-platform paths)
        with open(DEFAULT_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to write to debug log: {e}")
