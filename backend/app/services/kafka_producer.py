"""
Kafka Producer for real-time telemetry simulation
Reads from m04_pump_telemetry_timeseries.csv and produces to a Kafka topic.
"""
import csv
import json
import time
from pathlib import Path

# Mocking confluent_kafka for the demonstration, as the user might not have a live cluster
class MockKafkaProducer:
    def produce(self, topic, value, callback=None):
        print(f"[Kafka Producer] Produced to {topic}: {value.decode('utf-8')}")
        if callback:
            callback(None, type("Message", (object,), {"topic": lambda: topic, "partition": lambda: 0, "offset": lambda: 1})())
            
    def flush(self):
        pass

DATASETS = Path(__file__).parent.parent.parent.parent / "datasets"

def run_telemetry_simulation(topic="aquaintelli.telemetry.m04"):
    producer = MockKafkaProducer()
    csv_path = DATASETS / "m04_pump_telemetry_timeseries.csv"
    
    if not csv_path.exists():
        print("Dataset not found for Kafka producer.")
        return
        
    print(f"Starting Kafka telemetry simulation for topic: {topic}")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            payload = json.dumps(row).encode('utf-8')
            producer.produce(topic, value=payload, callback=lambda err, msg: None)
            producer.flush()
            time.sleep(1) # Simulate real-time streaming interval

if __name__ == "__main__":
    run_telemetry_simulation()
