import requests
import os
from dotenv import load_dotenv

load_dotenv()
port = int(os.getenv("PORT", 8001))

print(f"Checking backend at http://127.0.0.1:{port}/health")
try:
    r = requests.get(f"http://127.0.0.1:{port}/health", timeout=5)
    print(f"Backend Status: {r.status_code}")
    print(f"Backend Response: {r.text}")
except Exception as e:
    print(f"Backend Error: {e}")

print("\nChecking ngrok tunnels...")
try:
    r = requests.get("http://127.0.0.1:4040/api/tunnels", timeout=5)
    print(f"Ngrok Status: {r.status_code}")
    data = r.json()
    for tunnel in data.get('tunnels', []):
        print(f"Public URL: {tunnel.get('public_url')}")
        print(f"Forwarding to: {tunnel.get('config', {}).get('addr')}")
except Exception as e:
    print(f"Ngrok Error: {e}")
