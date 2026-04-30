# 🌊 AquaIntelli — Project Intelligence Report
## Specialized 8-Module Water Intelligence Platform

AquaIntelli is a high-fidelity, satellite-fused intelligence platform designed to provide a "God's Eye View" of Earth's water resources. It leverages multi-source satellite data, artificial intelligence, and a triple-database architecture to monitor, predict, and manage water security at scale.

---

## 🛠 Tech Stack

### Backend (Python Intelligence Core)
*   **Framework:** FastAPI (High-performance asynchronous API)
*   **Databases (Triple Fusion):**
    *   **SQL (SQLAlchemy + SQLite):** Structured historical readings, user metadata, and specific sensor logs.
    *   **NoSQL (MongoDB):** Large-scale satellite data caching, JSON-based NASA EarthData responses.
    *   **Graph (Neo4j):** Mapping the relationships between aquifers, rivers, and urban drainage networks for "Graph RAG" intelligence.
*   **AI & GenAI Stack:**
    *   **LangChain:** RAG (Retrieval-Augmented Generation) pipeline for querying technical water documentation.
    *   **LangGraph:** Multi-agent workflows for complex water crisis decision-making.
    *   **LangSmith:** Observability and tracing for all AI decision paths.
    *   **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` via FAISS vector storage.
*   **Hardware Integration:** MCP (Model Context Protocol) for local tool access and sensor interfacing.

### Frontend (God's Eye HUD)
*   **Architecture:** Zero-framework "Cyber-HUD" (Vanilla HTML5, CSS3, JS).
*   **Mapping:** Leaflet.js with custom fused satellite tile layers and telemetry overlays.
*   **3D Engine:** Three.js for real-time 3D subsurface aquifer profiling and infrastructure cloning.
*   **Visualization:** Chart.js for 90-day depletion forecasting and temporal probability graphs.
*   **Styling:** Deep-space aesthetic with Glassmorphism, neon-accented telemetry cards, and high-vibrancy alert indicators.

---

## 🛰 Core Modules & Capabilities

### 00 · God's Eye View
The central command dashboard. Aggregates "Top Secret" level intelligence across all modules, providing a unified global status, active satellite tracking (GRACE-FO, Sentinel, Landsat), and a real-time intelligence feed.

### 01 · Groundwater Intelligence
Detects groundwater storage anomalies using **NASA GRACE-FO** satellite data. It calculates Equivalent Water Height (EWH) changes to identify regions of extreme depletion or recharge.

### 02 · Reservoir Monitoring
Real-time tracking of surface water bodies. Uses Sentinel-2 multispectral imagery to calculate water surface area and estimated volumetric storage capacity.

### 03 · Irrigation AI
Precision agriculture optimization. Utilizes the **FAO-56 Penman-Monteith** algorithm to calculate crop-specific water requirements based on NASA POWER meteorological data (humidity, solar radiation, wind speed).

### 04 · Borewell Prediction
An AI-driven "Driller's Map." Predicts the probability of drilling success at specific coordinates by analyzing historical strike rates, geological layers, and current aquifer saturation levels.

### 05 · Smart Drainage
A digital twin of urban infrastructure. Monitors flow rates and identifies blockage hotspots within city-wide drainage networks to prevent local flooding.

### 06 · Flood Risk & Crisis
Real-time flood inundation mapping. Fuses rainfall forecasts with terrain slope data to generate early warning alerts for low-lying urban sectors.

### 07 · Aquifer Scan (3D Profiling)
Generates a 3D subsurface profile of the Earth. Visualizes the "Saturated Zone," "Unsaturated Zone," and "Bedrock" levels based on combined satellite and CGWB (Central Ground Water Board) data.

### 08 · Crisis Forecast
A 90-day groundwater depletion engine. Uses AI models to simulate future depletion rates, alerting authorities 3 months before an aquifer reaches a critical "Zero-Water" state.

---

## 🚀 Key Advanced Features

### 1. Time Series Simulation (Formerly 4D)
The **TIME SERIES** engine allows users to scrub a timeline from 2023 to the present. As you drag the slider:
*   The **3D models** physically shrink or expand (aquifer volume changes).
*   The **UI Metrics** dynamically recalculate historical and future probabilities based on simulated time-lapse data.
*   The **HUD Map** shifts through temporal satellite snapshots.

### 2. Multi-DB RAG System
Ask the platform anything (e.g., *"What is the recharge rate in the Krishna Basin?"*). The RAG system queries a multi-source knowledge base, fusing structured SQL data with unstructured technical reports and Graph-based relationship data to provide a cited "Intel Response."

### 3. Integrated Host Tunneler
A custom Python `tunneler.py` utility that utilizes **ngrok** to immediately expose the local AquaIntelli instance to a secure public URL, enabling remote field access for water agents.

### 4. Live Telemetry Toggle
A "Kill-Switch" for real-time data ingestion. Analysts can toggle the **LIVE** button to freeze the data stream (Pause Telemetry), allowing for deep inspection of static models without data shifting during analysis.

---
**AquaIntelli** — *Because you can't manage what you can't see.*
