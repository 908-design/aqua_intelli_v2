# AquaIntelli SKILL.md
# Advanced GENAI + Autonomous Water Intelligence Skill Architecture

# PURPOSE

This document defines the advanced GENAI, autonomous intelligence,
and world-class AI infrastructure capabilities required to transform
AquaIntelli into a next-generation hydrological digital twin platform.

This file is designed for:
- Claude Code
- Cursor
- GPT Engineering Agents
- Multi-agent coding systems
- Autonomous implementation workflows

---

# CORE PHILOSOPHY

AquaIntelli should evolve from:

```text
Water Analytics Dashboard
```

to:

```text
Autonomous AI Water Operating System
```

The platform must support:
- reasoning
- planning
- prediction
- simulation
- autonomous infrastructure intelligence
- multimodal geospatial AI
- digital twin systems

---

# GLOBAL ARCHITECTURE

```text
Satellite Data
+ Sensor Telemetry
+ GIS Layers
+ Weather Streams
+ Infrastructure Networks
+ Historical Hydrology
            ↓
Distributed Streaming Layer
            ↓
Geospatial Intelligence Engine
            ↓
GENAI + AI Agents + Simulation Systems
            ↓
Digital Twin Runtime
            ↓
Realtime Decision Intelligence
            ↓
3D Visualization + Copilot Interface
```

---

# REQUIRED AI CAPABILITIES

# 1. GEO-AWARE MULTIMODAL COPILOT

## Goal
Create a conversational AI system capable of understanding:
- maps
- satellite imagery
- telemetry
- hydrology
- GIS layers
- infrastructure systems
- drainage networks
- groundwater systems
- borewell data

## Core Features
- Natural language geospatial querying
- Infrastructure reasoning
- Groundwater reasoning
- Reservoir analytics
- Flood explanations
- Interactive AI assistant
- Temporal reasoning
- Spatial reasoning

## Example Queries
```text
Why is groundwater declining in Gajuwaka?

Which regions will face water stress within 90 days?

Show flood-prone areas near schools.

Which borewell has highest failure risk?
```

## Tech Stack
- GPT-4o / Claude / Gemini
- LangGraph
- LangChain
- LlamaIndex
- pgvector
- PostGIS
- FastAPI

## Implementation
- RAG pipeline
- Geospatial vector retrieval
- Spatial SQL generation
- AI reasoning chains
- Tool-calling agents

---

# 2. SATELLITE IMAGE REASONING ENGINE

## Goal
Enable AI to understand and reason over satellite imagery.

## Features
- Flood detection
- Crop stress detection
- Reservoir shrinkage analysis
- Urban expansion analysis
- Drainage obstruction detection
- Illegal borewell activity estimation

## Models
- Vision Transformers
- SAM (Segment Anything Model)
- Swin Transformer
- ConvNeXt
- CLIP

## Input
- Sentinel-1
- Sentinel-2
- Landsat
- DEMs
- NDVI
- SAR imagery

## Output
- AI-generated explanations
- Segmentation masks
- Risk maps
- Change detection reports

## Advanced Capability
Compare historical imagery and explain:
```text
WHY flood risk increased.
WHY recharge reduced.
WHY urban runoff increased.
```

---

# 3. MULTI-AGENT WATER PLANNING SYSTEM

## Goal
Create autonomous planning agents.

## Agent Types

### Hydrology Agent
Responsibilities:
- aquifer analysis
- recharge estimation
- depletion forecasting

### Reservoir Agent
Responsibilities:
- release optimization
- storage balancing
- crop allocation planning

### Irrigation Agent
Responsibilities:
- irrigation scheduling
- crop water optimization
- wastage minimization

### Drainage Agent
Responsibilities:
- drainage redesign
- flood mitigation
- overflow prevention

### Emergency Agent
Responsibilities:
- flood alerts
- evacuation planning
- disaster escalation

### Infrastructure Agent
Responsibilities:
- maintenance prediction
- pipeline health
- pump optimization

## Frameworks
- LangGraph
- CrewAI
- AutoGen
- Semantic Kernel

## Agent Communication
- event-driven orchestration
- task delegation
- memory persistence
- shared vector context

---

# 4. GEO-RAG (GEOSPATIAL RETRIEVAL AUGMENTED GENERATION)

## Goal
Build spatially-aware retrieval systems.

## Retrieval Dimensions
- semantic
- spatial
- temporal
- hydrological
- environmental

## Features
- region similarity retrieval
- terrain analog search
- hydrology analog search
- flood similarity matching

## Example
```text
Find regions similar to current Rushikonda conditions.
```

## Tech Stack
- pgvector
- Qdrant
- Milvus
- PostGIS
- FAISS

## Embeddings
- raster embeddings
- hydrology embeddings
- terrain embeddings
- NDVI embeddings

---

# 5. NATURAL LANGUAGE GIS ENGINE

## Goal
Convert natural language into GIS operations.

## Example Queries
```text
Find flood zones near hospitals.

Show high groundwater recharge regions.

Find villages within 2km of contaminated aquifers.
```

## Capabilities
- SQL generation
- spatial joins
- geofencing
- buffer analysis
- topology operations

## Stack
- PostGIS
- GeoPandas
- GPT function calling
- Spatial parsers

---

# 6. GENERATIVE INFRASTRUCTURE DESIGN

## Goal
Generate infrastructure layouts automatically.

## Generated Assets
- drainage systems
- recharge pits
- canal layouts
- stormwater systems
- borewell placement plans

## AI Techniques
- graph generation
- procedural generation
- optimization solvers
- generative design

## Inputs
- terrain
- rainfall
- land use
- population density
- hydrology

## Outputs
- pipe layout
- cost estimates
- flow optimization
- flood risk score

---

# 7. CAUSAL AI ENGINE

## Goal
Explain WHY events happen.

## Features
- groundwater decline causality
- flood causality
- crop stress causality
- infrastructure failure causality

## Frameworks
- DoWhy
- CausalML
- Bayesian Networks
- Temporal causal graphs

## Example Output
```text
Groundwater decline caused primarily by:
1. Urban concrete expansion
2. Excess bore extraction
3. Reduced recharge
```

---

# 8. GENERATIVE HYDROLOGY SIMULATIONS

## Goal
Generate future hydrological scenarios.

## Simulations
- future floods
- drought evolution
- reservoir collapse
- aquifer depletion
- infrastructure overload

## AI Techniques
- diffusion models
- neural operators
- physics-informed ML
- spatiotemporal transformers

## Example
```text
Simulate Vizag under:
- 3 cyclones
- 20% rainfall increase
- 40% urban expansion
```

---

# 9. REINFORCEMENT LEARNING ENGINE

## Goal
Optimize water systems dynamically.

## Use Cases
- irrigation scheduling
- reservoir releases
- pump scheduling
- floodgate control

## RL Algorithms
- PPO
- SAC
- DQN
- Multi-Agent RL

## Environment State
- weather
- soil moisture
- reservoir level
- crop stress
- telemetry

## Reward Functions
- water savings
- crop yield
- energy reduction
- flood reduction

---

# 10. GRAPH NEURAL NETWORKS

## Goal
Model infrastructure and water networks.

## Graph Nodes
- pumps
- reservoirs
- borewells
- junctions
- farms
- canals

## Graph Edges
- pipelines
- canals
- drainage paths
- hydraulic links

## Models
- GAT
- GraphSAGE
- Temporal GNN
- Dynamic Graph Networks

## Use Cases
- leak prediction
- network optimization
- failure propagation
- flow forecasting

---

# 11. DIGITAL TWIN ARCHITECTURE

## Goal
Create a real-time hydrological digital twin.

## Twin Components
- groundwater twin
- drainage twin
- irrigation twin
- reservoir twin
- flood twin

## Twin Features
- real-time sync
- predictive simulation
- historical replay
- what-if analysis

## Visualization
- CesiumJS
- Three.js
- Unreal Engine
- WebGPU

---

# 12. REALTIME STREAMING INFRASTRUCTURE

## Goal
Enable low-latency telemetry intelligence.

## Stack
- Kafka
- Pulsar
- Flink
- Spark Streaming

## Streams
```text
groundwater.telemetry
drainage.flow
pump.metrics
flood.alerts
rainfall.events
satellite.ingestion
```

## Features
- event-driven AI
- anomaly detection
- real-time inference
- dynamic alerts

---

# 13. DISTRIBUTED GEOSPATIAL COMPUTE

## Goal
Process planetary-scale raster data.

## Stack
- Dask
- Ray
- Spark
- RasterFrames
- Xarray

## Storage
- GeoTIFF
- Zarr
- TileDB
- Cloud-Optimized GeoTIFF

## Features
- distributed NDVI processing
- raster chunking
- terrain analytics
- parallel geospatial ML

---

# 14. GPU ACCELERATED SIMULATIONS

## Goal
Run large-scale hydrodynamic simulations.

## GPU Stack
- CUDA
- RAPIDS
- CuPy
- Vulkan
- PyTorch CUDA

## Simulations
- flood propagation
- particle flow
- fluid dynamics
- rainfall runoff

## Rendering
- real-time water rendering
- physically based rendering
- dynamic particle systems

---

# 15. AI REPORT GENERATION

## Goal
Automatically generate technical reports.

## Reports
- groundwater assessments
- flood analysis
- borewell feasibility
- irrigation plans
- environmental impact reports

## Output Formats
- PDF
- DOCX
- GIS exports
- dashboards

---

# 16. AI EMERGENCY COMMAND CENTER

## Goal
Real-time disaster intelligence.

## Features
- flood forecasting
- evacuation planning
- risk prioritization
- infrastructure failure prediction

## Capabilities
- live alerts
- emergency simulation
- route optimization
- AI-generated response plans

---

# 17. DIGITAL HUMAN WATER ASSISTANT

## Goal
Voice-enabled multilingual AI interface.

## Languages
- English
- Telugu
- Hindi

## Features
- speech interaction
- farmer advisory
- groundwater explanations
- irrigation recommendations

## Stack
- Whisper
- TTS
- Avatar systems
- Realtime voice AI

---

# 18. SELF-LEARNING WATER SYSTEM

## Goal
Continuously improve intelligence.

## Features
- online learning
- drift detection
- adaptive forecasting
- automated retraining

## Monitoring
- MLflow
- Weights & Biases
- EvidentlyAI

---

# 19. FOUNDATION HYDROLOGY MODEL

## Long-Term Goal
Train a hydrology foundation model.

## Training Data
- satellite imagery
- groundwater history
- weather
- hydrology
- infrastructure telemetry

## Capabilities
- zero-shot forecasting
- generalized hydrology reasoning
- transfer learning across regions

---

# 20. ENTERPRISE INFRASTRUCTURE

## Backend
- FastAPI
- gRPC
- GraphQL
- Async services

## Frontend
- Next.js
- Deck.gl
- Three.js
- WebGPU

## Infrastructure
- Kubernetes
- Terraform
- Docker
- GPU clusters

## Databases
- PostgreSQL
- PostGIS
- Redis
- TimescaleDB
- MongoDB

---

# FINAL VISION

```text
AquaIntelli OS
=
Hydrology Foundation Model
+
Geospatial AI
+
Autonomous Agents
+
Digital Twin Infrastructure
+
Realtime Water Intelligence
```

Final positioning:
- Palantir for Water
- NVIDIA Omniverse for Hydrology
- AI Operating System for Climate Infrastructure
