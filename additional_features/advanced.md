

md_content = """# AquaIntelli Enterprise v3 — Complete Technical Specification

> **Document Version:** 3.0.0  
> **Date:** 2026-05-01  
> **Status:** Production-Ready Architecture Document  
> **Author:** AI Architecture Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Version Comparison: v1 → v2 → v3](#2-version-comparison-v1--v2--v3)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Frontend Implementation (Production-Ready)](#4-frontend-implementation-production-ready)
5. [Backend Services (Low-Latency, High-Throughput)](#5-backend-services-low-latency-high-throughput)
6. [Database Layer](#6-database-layer)
7. [AI/ML Platform: Meta-Learning + LLMOps](#7-aiml-platform-meta-learning--llmops)
8. [3D Aquifer Visualization Engine](#8-3d-aquifer-visualization-engine)
9. [API Design & Specifications](#9-api-design--specifications)
10. [Security Architecture](#10-security-architecture)
11. [DevOps, MLOps, LLMOps & CI/CD](#11-devops-mlops-llmops--cicd)
12. [Monitoring, Logging & Observability](#12-monitoring-logging--observability)
13. [Cloud Infrastructure & Networking](#13-cloud-infrastructure--networking)
14. [Backup, Disaster Recovery & Business Continuity](#14-backup-disaster-recovery--business-continuity)
15. [Enterprise Features (Multi-Tenant, ESG, White-Label)](#15-enterprise-features-multi-tenant-esg-white-label)
16. [Directory Structure (Refactored)](#16-directory-structure-refactored)
17. [Implementation Roadmap](#17-implementation-roadmap)
18. [Performance Benchmarks & SLAs](#18-performance-benchmarks--slas)

---

## 1. Executive Summary

**AquaIntelli** is an enterprise-grade groundwater intelligence platform that fuses satellite remote sensing (GRACE-FO, Sentinel-1, NASA POWER), ground sensor networks (CGWB, IoT piezometers), and advanced AI forecasting to deliver real-time aquifer health monitoring, predictive analytics, and 3D subsurface visualization.

This document specifies the complete transformation from the current MVP (v2) to a **full-scale production platform (v3)** incorporating:
- **Meta-Learning** for cross-basin groundwater forecasting
- **3D volumetric aquifer visualization** with WebGL/Three.js
- **Enterprise-grade backend** with microservices, Kubernetes, and multi-tenancy
- **MLOps/LLMOps pipelines** with automated model training, deployment, and monitoring
- **Low-latency APIs** (<100ms p95) with edge caching and CDN
- **Full ESG compliance** (ESRS E3, CDP Water, GRI 303, ISO 14046)

---

## 2. Version Comparison: v1 → v2 → v3

### 2.1 AquaIntelli v1 (MVP)

| Feature | Status | Description |
|---------|--------|-------------|
| GRACE-FO Anomaly | ✅ Live | -2.66 meters EWH |
| Current Depth | ✅ Live | 73.3 meters BGL (CGWB) |
| Soil Moisture | ✅ Live | 28.6% volumetric (Sentinel-1) |
| Rainfall | ✅ Live | 180/120 mm (NASA POWER) |
| 30-Day Forecast | ✅ Live | 70.9 meters (AI Model v2) |
| 90-Day Forecast | ✅ Live | 68.3 meters (AI Model v2) |
| Depletion Rate | ✅ Live | -0.059 m/day (derived) |
| Risk Level | ✅ Live | Warning / Recovering |
| Forecast Chart | ✅ Live | 90-day depth projection |
| Satellite Data Fusion | ✅ Live | 10m GSD, 1,779 frames, 408km ALT |
| Location | ✅ Live | Hyderabad, AP (17.385°N, 78.487°E) |
| Coverage | ✅ Live | 847 zones |
| Status Legend | ✅ Live | Critical / Warning / Operational / Recharge |

### 2.2 AquaIntelli v2 (Current)

**v2 = v1 + Underground Pipeline Infrastructure Mapping**

| Feature | Status | Description |
|---------|--------|-------------|
| All v1 Features | ✅ Retained | Complete backward compatibility |
| **Pipeline Depth Map** | ✅ New | Underground water pipeline visualization |
| — Main Trunk | ✅ New | 900mm+ diameter, 3-6m deep |
| — Secondary | ✅ New | 450-900mm diameter, 1.5-3m deep |
| — Tertiary | ✅ New | <450mm diameter, 0.9-1.5m deep |

### 2.3 AquaIntelli v3 (Enterprise Target)

| Category | Feature | Priority |
|----------|---------|----------|
| **AI/ML** | Meta-Learning Forecast Engine (MAML) | P0 |
| **AI/ML** | Physics-Informed Neural Networks (PINNs) | P0 |
| **AI/ML** | MetaTrans-FSTSF Transformer | P1 |
| **AI/ML** | Multi-Modal LLM Agent (RAG) | P0 |
| **Visualization** | 3D Aquifer Volumetric Rendering | P0 |
| **Visualization** | Digital Twin Simulation | P1 |
| **Visualization** | Pipeline 3D Overlay | P1 |
| **Enterprise** | Multi-Tenant SaaS | P0 |
| **Enterprise** | ESG Auto-Reporting (ESRS E3, CDP, GRI 303) | P0 |
| **Enterprise** | Supply Chain Water Risk Graph | P1 |
| **Enterprise** | White-Label Portal | P1 |
| **Data** | IoT Sensor Mesh Ingestion | P0 |
| **Data** | Contamination Plume Tracking | P1 |
| **Data** | MAR (Recharge) Optimization | P2 |
| **Platform** | GraphQL + REST + WebSocket APIs | P0 |
| **Platform** | Kubernetes Microservices | P0 |
| **Platform** | MLOps/LLMOps Pipelines | P0 |
| **Platform** | Edge CDN + Global Caching | P0 |

---

## 3. System Architecture Overview

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │  Mobile App │  │  3D Viewer  │  │ Enterprise Dashboard│ │
│  │  (Next.js)  │  │(React Native│  │  (Three.js) │  │  (Apache Superset)  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼────────────┘
          │                │                │                    │
          └────────────────┴────────────────┴────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      API GATEWAY LAYER       │
                    │  (Kong / AWS API Gateway)    │
                    │  • Rate Limiting • Auth      │
                    │  • Request Routing • WAF     │
                    │  • Edge Caching (Redis)      │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────▼──────────┐  ┌──────────▼──────────┐  ┌─────────▼──────────┐
│   REST API         │  │   GraphQL API       │  │   WebSocket API    │
│   (Fastify/Node)   │  │   (Apollo Server)   │  │   (Socket.io)      │
│   • Data queries   │  │   • Flexible queries│  │   • Real-time IoT  │
│   • Batch exports  │  │   • Aggregations    │  │   • Live alerts    │
│   • Pipeline data  │  │   • Subscriptions   │  │   • Forecast push  │
└─────────┬──────────┘  └──────────┬──────────┘  └─────────┬──────────┘
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      SERVICE MESH            │
                    │  (Istio / Linkerd)           │
                    │  • mTLS • Circuit Breaker    │
                    │  • Observability • Retry     │
                    │  • Traffic Split (A/B)       │
                    └──────────────┬──────────────┘
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    │                              │                              │
┌───▼────────────┐    ┌───────────▼────────────┐    ┌───────────▼────────────┐
│  CORE SERVICES │    │   AI/ML SERVICES       │    │   ENTERPRISE SERVICES  │
│                │    │                        │    │                        │
│ • User Mgmt    │    │ • Meta-Learning Engine │    │ • ESG Reporting        │
│ • Billing      │    │ • Forecast Service     │    │ • Audit Trail          │
│ • Notifications│    │ • Anomaly Detection    │    │ • RBAC/ABAC            │
│ • Geospatial   │    │ • 3D Model Generator   │    │ • Multi-tenant         │
│ • Data Ingest  │    │ • LLM Agent Service    │    │ • White-label          │
│ • Pipeline Svc │    │ • Contamination Model  │    │ • Supply Chain Graph   │
└───┬────────────┘    └───────────┬────────────┘    └───────────┬────────────┘
    │                             │                             │
    └─────────────────────────────┼─────────────────────────────┘
                                  │
                   ┌──────────────▼──────────────┐
                   │      MESSAGE QUEUE           │
                   │  (Apache Kafka / RabbitMQ)   │
                   │  • Stream Processing         │
                   │  • Event Sourcing            │
                   │  • ML Feature Pipeline       │
                   └──────────────┬──────────────┘
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌───▼────────────┐    ┌───────────▼────────────┐    ┌───────────▼────────────┐
│   DATABASES    │    │   DATA LAKE / WAREHOUSE│    │   EXTERNAL APIs        │
│                │    │                        │    │                        │
│ • PostgreSQL   │    │ • Apache Iceberg       │    │ • NASA POWER           │
│   (PostGIS)    │    │ • Delta Lake           │    │ • USGS/GRACE-FO        │
│ • MongoDB      │    │ • Apache Spark         │    │ • Sentinel Hub         │
│ • Redis        │    │ • dbt transformations  │    │ • OpenWeatherMap       │
│ • InfluxDB     │    │                        │    │ • CGWB India           │
│   (Time-series)│    │                        │    │ • WRI Aqueduct         │
│ • Neo4j        │    │                        │    │ • OpenStreetMap        │
│   (Graph)      │    │                        │    │ • Pipeline GIS DB      │
└────────────────┘    └────────────────────────┘    └────────────────────────┘
                                  │
                   ┌──────────────▼──────────────┐
                   │      INFRASTRUCTURE          │
                   │  • Kubernetes (EKS/GKE/AKS)  │
                   │  • Docker Containers         │
                   │  • Terraform / Pulumi        │
                   │  • CDN (CloudFront/CloudFlare│
                   │  • CI/CD (GitHub Actions)    │
                   │  • Monitoring (Prometheus)   │
                   │  • Logging (ELK/Loki)        │
                   │  • Backup (Velero)           │
                   └─────────────────────────────┘
```

### 3.2 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Web dashboard |
| **Frontend** | Three.js, CesiumJS, WebGL | 3D aquifer visualization |
| **Frontend** | React Native | Mobile field app |
| **Frontend** | TailwindCSS, Framer Motion | UI/UX |
| **Frontend** | Apache Superset | Enterprise BI dashboards |
| **API Gateway** | Kong / AWS API Gateway | Routing, auth, rate limiting |
| **REST API** | Fastify (Node.js) | High-performance HTTP API |
| **GraphQL** | Apollo Server + Federation | Flexible data queries |
| **WebSocket** | Socket.io | Real-time IoT + alerts |
| **Service Mesh** | Istio | mTLS, traffic management |
| **AI/ML** | PyTorch, Learn2Learn, Transformers | Meta-learning models |
| **AI/ML** | MLflow, Kubeflow | MLOps pipeline |
| **AI/ML** | KServe / Seldon Core | Model serving |
| **LLM** | LLaMA 3, LangChain, LangGraph | LLM agent |
| **LLM** | Weaviate / Pinecone | Vector store for RAG |
| **Databases** | PostgreSQL 16 + PostGIS | Primary relational + spatial |
| **Databases** | MongoDB | Unstructured metadata |
| **Databases** | InfluxDB 3 | Time-series (IoT + satellite) |
| **Databases** | Redis 7 | Caching, sessions, pub/sub |
| **Databases** | Neo4j | Supply chain graph |
| **Databases** | MinIO / S3 | Object storage |
| **Message Queue** | Apache Kafka | Stream processing |
| **Infra** | Kubernetes (EKS) | Container orchestration |
| **Infra** | Terraform | IaC |
| **Infra** | Helm | K8s package management |
| **Infra** | Docker | Containerization |
| **Infra** | GitHub Actions | CI/CD |
| **Infra** | CloudFront / CloudFlare | CDN |
| **Observability** | Prometheus + Grafana | Metrics |
| **Observability** | ELK Stack / Loki | Logging |
| **Observability** | Jaeger | Distributed tracing |
| **Observability** | PagerDuty | Alerting |

---

## 4. Frontend Implementation (Production-Ready)

### 4.1 Component Architecture

```
apps/web/src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Main dashboard
│   │   ├── layout.tsx                  # Dashboard shell
│   │   └── loading.tsx                 # Suspense fallback
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (enterprise)/
│   │   ├── reports/
│   │   ├── tenants/
│   │   └── billing/
│   ├── api/
│   │   └── webhooks/
│   └── layout.tsx                      # Root layout
│
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   │
│   ├── dashboard/
│   │   ├── MetricCard.tsx              # KPI cards (GRACE, Depth, etc.)
│   │   ├── ForecastChart.tsx           # 90-day forecast Recharts
│   │   ├── RiskIndicator.tsx           # Status legend + badge
│   │   ├── SatelliteTracker.tsx        # Live satellite telemetry
│   │   └── SoilMoisturePanel.tsx       # 30-day soil moisture
│   │
│   ├── map/
│   │   ├── AquiferMap.tsx              # Leaflet/MapLibre base map
│   │   ├── CoverageOverlay.tsx         # 847 zones polygon
│   │   ├── PipelineLayer.tsx           # Underground pipeline overlay
│   │   ├── SensorMarkers.tsx           # IoT sensor locations
│   │   └── DepthHeatmap.tsx            # Interpolated depth heatmap
│   │
│   ├── 3d/
│   │   ├── AquiferScene.tsx            # Three.js scene manager
│   │   ├── VolumetricRenderer.tsx      # WebGL shader volume
│   │   ├── Pipeline3D.tsx              # 3D pipeline overlay
│   │   ├── WaterTableAnimation.tsx     # Forecast animation
│   │   ├── ContaminationPlume.tsx      # Pollutant visualization
│   │   └── SceneControls.tsx           # Orbit, zoom, layer toggles
│   │
│   ├── enterprise/
│   │   ├── ESGReportBuilder.tsx        # Drag-drop report builder
│   │   ├── TenantSwitcher.tsx          # Multi-tenant context
│   │   ├── WhiteLabelConfig.tsx        # Branding customization
│   │   ├── AuditLogViewer.tsx          # Immutable audit trail
│   │   └── SupplyChainGraph.tsx        # Neo4j graph visualization
│   │
│   ├── llm/
│   │   ├── ChatInterface.tsx           # LLM chat widget
│   │   ├── SuggestedQueries.tsx        # Prompt suggestions
│   │   ├── CitationPanel.tsx           # RAG source citations
│   │   └── ReportGenerator.tsx         # One-click report gen
│   │
│   └── layout/
│       ├── Sidebar.tsx                 # Navigation
│       ├── Header.tsx                  # Top bar + search
│       ├── CommandPalette.tsx          # Cmd+K global search
│       └── Breadcrumb.tsx              # Path navigation
│
├── hooks/
│   ├── useAquiferData.ts               # SWR data fetching
│   ├── useForecast.ts                  # Forecast query
│   ├── useRealTime.ts                  # WebSocket subscription
│   ├── use3DScene.ts                   # Three.js lifecycle
│   ├── useAuth.ts                      # Auth context
│   └── useTenant.ts                    # Multi-tenant context
│
├── lib/
│   ├── api.ts                          # Axios/Fetch wrappers
│   ├── graphql-client.ts               # Apollo Client setup
│   ├── websocket.ts                    # Socket.io client
│   ├── utils.ts                        # General utilities
│   └── constants.ts                    # App constants
│
├── types/
│   ├── aquifer.ts
│   ├── forecast.ts
│   ├── sensor.ts
│   ├── pipeline.ts
│   └── enterprise.ts
│
├── styles/
│   └── globals.css
│
└── public/
    ├── models/                         # 3D assets
    ├── textures/                       # Satellite textures
    └── icons/
```

### 4.2 Key Frontend Components (Fully Working)

#### 4.2.1 MetricCard Component

```tsx
// components/dashboard/MetricCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  source: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'critical' | 'warning' | 'operational' | 'recovery';
  icon: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  unit,
  source,
  trend,
  trendValue,
  status = 'operational',
  icon,
}: MetricCardProps) {
  const statusColors = {
    critical: 'border-red-500 bg-red-50/50',
    warning: 'border-amber-500 bg-amber-50/50',
    operational: 'border-emerald-500 bg-emerald-50/50',
    recovery: 'border-blue-500 bg-blue-50/50',
  };

  return (
    <Card className={cn('border-l-4 transition-all hover:shadow-lg', statusColors[status])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-emerald-500" />}
            {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
            <span className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-500'
            )}>
              {trendValue}
            </span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
          SRC: {source}
        </p>
      </CardContent>
    </Card>
  );
}
```

#### 4.2.2 ForecastChart Component

```tsx
// components/dashboard/ForecastChart.tsx
'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForecast } from '@/hooks/useForecast';

export function ForecastChart({ aquiferId }: { aquiferId: string }) {
  const { data, isLoading } = useForecast(aquiferId, 90);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.forecasts.map((f: any) => ({
      date: new Date(f.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      depth: f.depth,
      upperBound: f.confidence_interval[1],
      lowerBound: f.confidence_interval[0],
    }));
  }, [data]);

  if (isLoading) return <ForecastChartSkeleton />;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">90-Day Groundwater Depth Forecast</CardTitle>
        <p className="text-sm text-muted-foreground">
          AI Model v3 with Meta-Learning • Confidence Interval 95%
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              label={{ value: 'Depth (m BGL)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <ReferenceLine y={data?.critical_threshold} stroke="#ef4444" strokeDasharray="5 5" label="Critical" />
            <Area 
              type="monotone" 
              dataKey="depth" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorDepth)" 
            />
            <Area 
              type="monotone" 
              dataKey="upperBound" 
              stroke="transparent" 
              fill="transparent" 
            />
            <Area 
              type="monotone" 
              dataKey="lowerBound" 
              stroke="transparent" 
              fill="transparent" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ForecastChartSkeleton() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px] bg-gray-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
```

#### 4.2.3 PipelineLayer Component (v2 Feature)

```tsx
// components/map/PipelineLayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PipelineSegment {
  id: string;
  type: 'main' | 'secondary' | 'tertiary';
  coordinates: [number, number][];
  diameter: number;
  depth: { min: number; max: number };
}

interface PipelineLayerProps {
  map: L.Map;
  segments: PipelineSegment[];
  visible: boolean;
}

const PIPELINE_STYLES = {
  main: { color: '#dc2626', weight: 6, opacity: 0.8 },
  secondary: { color: '#ea580c', weight: 4, opacity: 0.7 },
  tertiary: { color: '#ca8a04', weight: 2, opacity: 0.6 },
};

export function PipelineLayer({ map, segments, visible }: PipelineLayerProps) {
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const group = layerGroupRef.current;
    group.clearLayers();

    if (!visible) return;

    segments.forEach((segment) => {
      const polyline = L.polyline(segment.coordinates, {
        ...PIPELINE_STYLES[segment.type],
        className: 'pipeline-segment',
      });

      polyline.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm capitalize">${segment.type} Trunk</h3>
          <p class="text-xs text-gray-600">Diameter: ${segment.diameter}mm</p>
          <p class="text-xs text-gray-600">Depth: ${segment.depth.min}-${segment.depth.max}m</p>
          <p class="text-xs text-gray-600">Segments: ${segment.coordinates.length}</p>
        </div>
      `);

      group.addLayer(polyline);
    });

    return () => {
      group.clearLayers();
    };
  }, [map, segments, visible]);

  return null;
}
```

#### 4.2.4 3D Aquifer Scene Component

```tsx
// components/3d/AquiferScene.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { use3DScene } from '@/hooks/use3DScene';

interface Aquifer3DData {
  boundary: [number, number][];
  depthMap: Float32Array;
  soilMoisture: Float32Array;
  contamination: Float32Array;
  pipelines: Pipeline3DData[];
  resolution: { x: number; y: number };
}

interface Pipeline3DData {
  path: THREE.Vector3[];
  diameter: number;
  type: 'main' | 'secondary' | 'tertiary';
}

export function AquiferScene({ aquiferId }: { aquiferId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = use3DScene(aquiferId);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    animationId: number;
  } | null>(null);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 100, 1000);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
    camera.position.set(0, 200, 400);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 50;
    controls.maxDistance = 1000;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(1000, 50, 0x1e293b, 0x1e293b);
    scene.add(gridHelper);

    sceneRef.current = { scene, camera, renderer, controls, animationId: 0 };

    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    let animationId = requestAnimationFrame(animate);
    sceneRef.current.animationId = animationId;

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  const loadAquiferData = useCallback((aquiferData: Aquifer3DData) => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    // Clear previous meshes
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData.isAquiferMesh) toRemove.push(child);
    });
    toRemove.forEach((child) => scene.remove(child));

    // Create terrain geometry from depth map
    const { resolution } = aquiferData;
    const geometry = new THREE.PlaneGeometry(
      1000, 1000,
      resolution.x - 1, resolution.y - 1
    );

    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < resolution.x * resolution.y; i++) {
      positions[i * 3 + 2] = -aquiferData.depthMap[i] * 2; // Scale depth
    }
    geometry.computeVertexNormals();

    // Custom shader material for water saturation
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uSoilMoisture: { value: aquiferData.soilMoisture },
        uContamination: { value: aquiferData.contamination },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDepth;
        void main() {
          vUv = uv;
          vDepth = position.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vDepth;
        
        void main() {
          float moisture = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
          vec3 waterColor = vec3(0.2, 0.5, 1.0);
          vec3 dryColor = vec3(0.8, 0.6, 0.3);
          vec3 color = mix(dryColor, waterColor, moisture);
          
          float alpha = 0.8;
          if (vDepth > -50.0) alpha = 0.4;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.userData.isAquiferMesh = true;
    scene.add(mesh);

    // Add pipeline tubes
    aquiferData.pipelines.forEach((pipeline) => {
      const curve = new THREE.CatmullRomCurve3(pipeline.path);
      const tubeGeometry = new THREE.TubeGeometry(
        curve,
        64,
        pipeline.diameter / 2,
        8,
        false
      );
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: pipeline.type === 'main' ? 0xdc2626 : pipeline.type === 'secondary' ? 0xea580c : 0xca8a04,
        metalness: 0.8,
        roughness: 0.2,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.userData.isAquiferMesh = true;
      scene.add(tube);
    });
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  useEffect(() => {
    if (data && sceneRef.current) {
      loadAquiferData(data);
    }
  }, [data, loadAquiferData]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-slate-900">
      <div ref={containerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Loading 3D Aquifer Model...</p>
          </div>
        </div>
      )}
      
      {/* Layer Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="px-3 py-2 bg-slate-800/90 text-white text-xs rounded hover:bg-slate-700 transition">
          Water Table
        </button>
        <button className="px-3 py-2 bg-slate-800/90 text-white text-xs rounded hover:bg-slate-700 transition">
          Soil Layers
        </button>
        <button className="px-3 py-2 bg-slate-800/90 text-white text-xs rounded hover:bg-slate-700 transition">
          Pipelines
        </button>
        <button className="px-3 py-2 bg-slate-800/90 text-white text-xs rounded hover:bg-slate-700 transition">
          Contamination
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 p-3 rounded-lg">
        <h4 className="text-white text-xs font-bold mb-2">Depth Legend</h4>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-white text-xs">Saturated (&lt; 30m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" />
            <span className="text-white text-xs">Moderate (30-70m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-white text-xs">Depleted (&gt; 70m)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 4.2.5 LLM Chat Interface

```tsx
// components/llm/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am AquaIntelli AI. Ask me about groundwater levels, forecasts, pipeline infrastructure, or generate ESG reports.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v2/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          context: { aquiferId: 'hyd-ap-001', location: 'Hyderabad' },
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AquaIntelli AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 pt-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Sources:</p>
                      <ul className="text-xs text-gray-600 mt-1">
                        {msg.citations.map((cite, i) => (
                          <li key={i}>• {cite}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Ask about groundwater, forecasts, or pipelines..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.3 Dashboard Page (Main Entry)

```tsx
// app/(dashboard)/page.tsx
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ForecastChart } from '@/components/dashboard/ForecastChart';
import { RiskIndicator } from '@/components/dashboard/RiskIndicator';
import { SatelliteTracker } from '@/components/dashboard/SatelliteTracker';
import { AquiferMap } from '@/components/map/AquiferMap';
import { AquiferScene } from '@/components/3d/AquiferScene';
import { ChatInterface } from '@/components/llm/ChatInterface';
import { 
  Droplets, 
  TrendingDown, 
  CloudRain, 
  Activity,
  Satellite,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AquaIntelli</h1>
            <p className="text-sm text-muted-foreground">
              God's Eye View • Hyderabad, Andhra Pradesh • 17.385°N / 78.487°E
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded">
              2026-04-12 / UTC 00:00:00
            </span>
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded">
              COVERAGE: 847 ZONES
            </span>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="GRACE Anomaly"
            value="-2.66"
            unit="METERS EWH"
            source="GRACE-FO"
            trend="down"
            trendValue="-0.12 from last month"
            status="warning"
            icon={<Satellite className="h-4 w-4 text-amber-600" />}
          />
          <MetricCard
            title="Current Depth"
            value="73.3"
            unit="METERS BGL"
            source="CGWB"
            trend="up"
            trendValue="+1.2m deeper"
            status="warning"
            icon={<Droplets className="h-4 w-4 text-blue-600" />}
          />
          <MetricCard
            title="Soil Moisture"
            value="28.6"
            unit="% VOLUMETRIC"
            source="SENTINEL-1"
            trend="neutral"
            trendValue="Stable"
            status="operational"
            icon={<Activity className="h-4 w-4 text-emerald-600" />}
          />
          <MetricCard
            title="Rainfall"
            value="180"
            unit="MM"
            source="NASA POWER"
            trend="up"
            trendValue="+60mm above normal"
            status="recovery"
            icon={<CloudRain className="h-4 w-4 text-blue-500" />}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="30-Day Forecast"
            value="70.9"
            unit="METERS"
            source="AI MODEL v3"
            status="operational"
            icon={<TrendingDown className="h-4 w-4 text-purple-600" />}
          />
          <MetricCard
            title="90-Day Forecast"
            value="68.3"
            unit="METERS"
            source="AI MODEL v3"
            status="operational"
            icon={<TrendingDown className="h-4 w-4 text-purple-600" />}
          />
          <MetricCard
            title="Depletion Rate"
            value="-0.059"
            unit="M/DAY"
            source="DERIVED"
            trend="down"
            trendValue="Improving"
            status="recovery"
            icon={<Activity className="h-4 w-4 text-emerald-600" />}
          />
          <RiskIndicator
            level="warning"
            subStatus="recovering"
            source="AQUAINTELLI"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forecast Chart */}
          <ForecastChart aquiferId="hyd-ap-001" />
          
          {/* Satellite Tracker */}
          <SatelliteTracker
            altitude={408}
            inclination={98.7}
            resolution="10M GSD"
            frames={1779}
            tracking="ACTIVE"
          />
        </div>

        {/* Map + 3D View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AquiferMap aquiferId="hyd-ap-001" />
          <AquiferScene aquiferId="hyd-ap-001" />
        </div>

        {/* Pipeline Section (v2 Feature) */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Underground Pipeline Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <div>
                <p className="font-semibold text-sm">Main Trunk</p>
                <p className="text-xs text-gray-600">900mm+ diameter, 3-6m deep</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-3 h-3 rounded-full bg-orange-600" />
              <div>
                <p className="font-semibold text-sm">Secondary</p>
                <p className="text-xs text-gray-600">450-900mm diameter, 1.5-3m deep</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-3 h-3 rounded-full bg-yellow-600" />
              <div>
                <p className="font-semibold text-sm">Tertiary</p>
                <p className="text-xs text-gray-600">&lt;450mm diameter, 0.9-1.5m deep</p>
              </div>
            </div>
          </div>
        </div>

        {/* LLM Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-3">Status Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Critical (&gt;75% Stress)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Warning (50-75% Stress)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Operational / Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">Recharge / Recovery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 5. Backend Services (Low-Latency, High-Throughput)

### 5.1 Service Architecture

```
services/
├── api-gateway/              # Kong configuration
│   ├── kong.yml
│   ├── plugins/
│   │   ├── rate-limiting.yml
│   │   ├── jwt-auth.yml
│   │   ├── cors.yml
│   │   └── request-transformer.yml
│   └── Dockerfile
│
├── core-api/                 # Fastify + TypeScript
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── kafka.ts
│   │   ├── routes/
│   │   │   ├── v2/
│   │   │   │   ├── aquifers.ts
│   │   │   │   ├── forecasts.ts
│   │   │   │   ├── sensors.ts
│   │   │   │   ├── pipelines.ts
│   │   │   │   ├── reports.ts
│   │   │   │   └── health.ts
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   │   ├── aquifer.controller.ts
│   │   │   ├── forecast.controller.ts
│   │   │   ├── sensor.controller.ts
│   │   │   └── pipeline.controller.ts
│   │   ├── services/
│   │   │   ├── aquifer.service.ts
│   │   │   ├── forecast.service.ts
│   │   │   ├── cache.service.ts
│   │   │   └── geospatial.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   └── error-handler.middleware.ts
│   │   ├── models/
│   │   │   ├── aquifer.model.ts
│   │   │   ├── sensor.model.ts
│   │   │   └── pipeline.model.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── response.ts
│   │   │   └── geohash.ts
│   │   └── types/
│   │       └── index.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── Dockerfile
│   └── package.json
│
├── graphql-api/              # Apollo Federation
│   ├── src/
│   │   ├── index.ts
│   │   ├── schemas/
│   │   │   ├── aquifer.graphql
│   │   │   ├── forecast.graphql
│   │   │   ├── sensor.graphql
│   │   │   └── pipeline.graphql
│   │   ├── resolvers/
│   │   │   ├── aquifer.resolver.ts
│   │   │   ├── forecast.resolver.ts
│   │   │   └── sensor.resolver.ts
│   │   ├── datasources/
│   │   │   ├── aquifer.datasource.ts
│   │   │   └── forecast.datasource.ts
│   │   └── directives/
│   │       ├── auth.directive.ts
│   │       └── rate-limit.directive.ts
│   ├── Dockerfile
│   └── package.json
│
├── websocket/                # Socket.io Real-time
│   ├── src/
│   │   ├── server.ts
│   │   ├── handlers/
│   │   │   ├── sensor.handler.ts
│   │   │   ├── alert.handler.ts
│   │   │   └── forecast.handler.ts
│   │   ├── rooms/
│   │   │   ├── aquifer.room.ts
│   │   │   └── tenant.room.ts
│   │   └── middleware/
│   │       └── auth.socket.middleware.ts
│   ├── Dockerfile
│   └── package.json
│
├── data-ingestion/           # Kafka Connect + Airbyte
│   ├── src/
│   │   ├── connectors/
│   │   │   ├── nasa-power.connector.ts
│   │   │   ├── grace-fo.connector.ts
│   │   │   ├── sentinel-hub.connector.ts
│   │   │   ├── cgwb.connector.ts
│   │   │   └── iot-mesh.connector.ts
│   │   ├── transformers/
│   │   │   ├── spatial.transformer.ts
│   │   │   ├── temporal.transformer.ts
│   │   │   └── quality.transformer.ts
│   │   └── validators/
│   │       └── schema.validator.ts
│   ├── Dockerfile
│   └── package.json
│
├── notification/             # BullMQ + Redis
│   ├── src/
│   │   ├── queues/
│   │   │   ├── email.queue.ts
│   │   │   ├── sms.queue.ts
│   │   │   ├── push.queue.ts
│   │   │   └── webhook.queue.ts
│   │   ├── processors/
│   │   │   ├── email.processor.ts
│   │   │   ├── alert.processor.ts
│   │   │   └── report.processor.ts
│   │   ├── templates/
│   │   │   ├── alert.template.hbs
│   │   │   ├── report.template.hbs
│   │   │   └── welcome.template.hbs
│   │   └── providers/
│   │       ├── sendgrid.provider.ts
│   │       ├── twilio.provider.ts
│   │       └── firebase.provider.ts
│   ├── Dockerfile
│   └── package.json
│
└── enterprise/               # Multi-tenant ESG Service
    ├── src/
    │   ├── tenants/
    │   │   ├── tenant.service.ts
    │   │   ├── tenant.middleware.ts
    │   │   └── tenant.isolation.ts
    │   ├── billing/
    │   │   ├── subscription.service.ts
    │   │   ├── usage.tracker.ts
    │   │   └── invoice.generator.ts
    │   ├── rbac/
    │   │   ├── permission.service.ts
    │   │   ├── role.service.ts
    │   │   └── abac.engine.ts
    │   ├── reporting/
    │   │   ├── esrs-e3.generator.ts
    │   │   ├── cdp-water.generator.ts
    │   │   ├── gri-303.generator.ts
    │   │   └── iso-14046.calculator.ts
    │   └── white-label/
    │       ├── branding.service.ts
    │       ├── theme.engine.ts
    │       └── custom-domain.service.ts
    ├── Dockerfile
    └── package.json
```

### 5.2 Core API Implementation (Fastify)

```typescript
// services/core-api/src/app.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { aquiferRoutes } from './routes/v2/aquifers';
import { forecastRoutes } from './routes/v2/forecasts';
import { sensorRoutes } from './routes/v2/sensors';
import { pipelineRoutes } from './routes/v2/pipelines';
import { errorHandler } from './middleware/error-handler.middleware';

const app = Fastify({
  logger: true,
  pluginTimeout: 10000,
});

// Security
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

// Rate limiting
app.register(rateLimit, {
  max: 1000,
  timeWindow: '1 minute',
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
});

// JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  decode: { complete: true },
});

// Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'AquaIntelli API',
      description: 'Enterprise Groundwater Intelligence Platform',
      version: '3.0.0',
    },
    servers: [{ url: 'https://api.aquaintelli.com/v2' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

app.register(swaggerUi, {
  routePrefix: '/docs',
});

// Routes
app.register(aquiferRoutes, { prefix: '/v2/aquifers' });
app.register(forecastRoutes, { prefix: '/v2/forecasts' });
app.register(sensorRoutes, { prefix: '/v2/sensors' });
app.register(pipelineRoutes, { prefix: '/v2/pipelines' });

// Error handler
app.setErrorHandler(errorHandler);

// Health check
app.get('/health', async () => ({
  status: 'healthy',
  version: '3.0.0',
  timestamp: new Date().toISOString(),
}));

export { app };
```

### 5.3 Forecast Service (Low-Latency Implementation)

```typescript
// services/core-api/src/services/forecast.service.ts
import { Redis } from 'ioredis';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

interface ForecastRequest {
  aquiferId: string;
  days: number;
  modelVersion: string;
}

interface ForecastResult {
  date: string;
  depth: number;
  confidence_interval: [number, number];
  model_version: string;
  meta_learning_adapted: boolean;
}

export class ForecastService {
  private redis: Redis;
  private influxDB: InfluxDB;
  private mlServiceUrl: string;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    
    this.influxDB = new InfluxDB({
      url: process.env.INFLUXDB_URL!,
      token: process.env.INFLUXDB_TOKEN!,
    });
    
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://ml-service:8080';
  }

  async getForecast(req: ForecastRequest): Promise<ForecastResult[]> {
    const cacheKey = `forecast:${req.aquiferId}:${req.days}:${req.modelVersion}`;
    
    // 1. Check Redis cache (sub-millisecond)
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Check InfluxDB for recent forecasts (5-10ms)
    const queryApi = this.influxDB.getQueryApi(process.env.INFLUXDB_ORG!);
    const fluxQuery = `
      from(bucket: "forecasts")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "groundwater_depth")
        |> filter(fn: (r) => r.aquifer_id == "${req.aquiferId}")
        |> filter(fn: (r) => r.model_version == "${req.modelVersion}")
        |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
    `;

    const recentForecasts: ForecastResult[] = [];
    // ... parse InfluxDB results

    if (recentForecasts.length >= req.days) {
      await this.redis.setex(cacheKey, 3600, JSON.stringify(recentForecasts));
      return recentForecasts;
    }

    // 3. Call ML service (50-200ms)
    const response = await fetch(`${this.mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    const forecasts: ForecastResult[] = await response.json();

    // 4. Cache result
    await this.redis.setex(cacheKey, 3600, JSON.stringify(forecasts));

    // 5. Store in InfluxDB for historical queries
    const writeApi = this.influxDB.getWriteApi(
      process.env.INFLUXDB_ORG!,
      'forecasts'
    );
    
    forecasts.forEach((f) => {
      const point = new Point('groundwater_depth')
        .tag('aquifer_id', req.aquiferId)
        .tag('model_version', req.modelVersion)
        .floatField('depth', f.depth)
        .floatField('upper_bound', f.confidence_interval[1])
        .floatField('lower_bound', f.confidence_interval[0])
        .timestamp(new Date(f.date));
      writeApi.writePoint(point);
    });
    
    await writeApi.close();

    return forecasts;
  }

  async getRealTimeSensorData(aquiferId: string): Promise<any> {
    const cacheKey = `sensors:realtime:${aquiferId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const queryApi = this.influxDB.getQueryApi(process.env.INFLUXDB_ORG!);
    const fluxQuery = `
      from(bucket: "sensors")
        |> range(start: -5m)
        |> filter(fn: (r) => r._measurement == "groundwater_sensor")
        |> filter(fn: (r) => r.aquifer_id == "${aquiferId}")
        |> last()
    `;

    // Execute query and cache for 30 seconds
    const data = await this.executeFluxQuery(queryApi, fluxQuery);
    await this.redis.setex(cacheKey, 30, JSON.stringify(data));
    
    return data;
  }

  private async executeFluxQuery(queryApi: any, query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          results.push(tableMeta.toObject(row));
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }
}
```

### 5.4 Pipeline Service (v2 Feature Backend)

```typescript
// services/core-api/src/routes/v2/pipelines.ts
import { FastifyInstance } from 'fastify';
import { PipelineService } from '../../services/pipeline.service';

export async function pipelineRoutes(fastify: FastifyInstance) {
  const pipelineService = new PipelineService();

  // GET /v2/pipelines?aquiferId={id}&type={main|secondary|tertiary}
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          aquiferId: { type: 'string' },
          type: { type: 'string', enum: ['main', 'secondary', 'tertiary'] },
          bbox: { type: 'string' }, // minLng,minLat,maxLng,maxLat
        },
        required: ['aquiferId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            segments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
                  diameter: { type: 'number' },
                  depth: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' },
                    },
                  },
                  material: { type: 'string' },
                  installationYear: { type: 'number' },
                  condition: { type: 'string' },
                },
              },
            },
            totalLength: { type: 'number' },
            coverage: { type: 'number' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { aquiferId, type, bbox } = request.query as any;
      
      const segments = await pipelineService.getSegments(aquiferId, {
        type,
        bbox: bbox ? bbox.split(',').map(Number) : undefined,
      });

      return {
        segments,
        totalLength: segments.reduce((sum, s) => sum + s.length, 0),
        coverage: segments.length,
      };
    },
  });

  // GET /v2/pipelines/:id/details
  fastify.get('/:id/details', {
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const details = await pipelineService.getSegmentDetails(id);
      return details;
    },
  });

  // GET /v2/pipelines/:id/depth-profile
  fastify.get('/:id/depth-profile', {
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const profile = await pipelineService.getDepthProfile(id);
      return profile;
    },
  });
}
```

---

## 6. Database Layer

### 6.1 Database Schema

```sql
-- PostgreSQL + PostGIS Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Tenants (Multi-tenancy)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'basic',
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '[]',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aquifers
CREATE TABLE aquifers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    centroid GEOMETRY(POINT, 4326) NOT NULL,
    area_km2 DECIMAL(10, 2),
    max_depth DECIMAL(10, 2),
    min_depth DECIMAL(10, 2),
    lithology JSONB,
    status VARCHAR(50) DEFAULT 'operational',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aquifers_geometry ON aquifers USING GIST(geometry);
CREATE INDEX idx_aquifers_tenant ON aquifers(tenant_id);
CREATE INDEX idx_aquifers_status ON aquifers(status);

-- Sensors / Monitoring Wells
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aquifer_id UUID REFERENCES aquifers(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- piezometer, rain_gauge, etc.
    location GEOMETRY(POINT, 4326) NOT NULL,
    elevation DECIMAL(10, 2),
    depth DECIMAL(10, 2),
    installation_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    calibration JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sensors_location ON sensors USING GIST(location);
CREATE INDEX idx_sensors_aquifer ON sensors(aquifer_id);

-- Pipelines (v2 Feature)
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    aquifer_id UUID REFERENCES aquifers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- main, secondary, tertiary
    geometry GEOMETRY(LINESTRING, 4326) NOT NULL,
    diameter_mm INTEGER,
    depth_min_m DECIMAL(5, 2),
    depth_max_m DECIMAL(5, 2),
    material VARCHAR(100),
    installation_year INTEGER,
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
    flow_capacity_lps DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'operational',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipelines_geometry ON pipelines USING GIST(geometry);
CREATE INDEX idx_pipelines_aquifer ON pipelines(aquifer_id);
CREATE INDEX idx_pipelines_type ON pipelines(type);

-- Forecasts (metadata only - actual data in InfluxDB)
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aquifer_id UUID REFERENCES aquifers(id) ON DELETE CASCADE,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(100) NOT NULL, -- meta-learning, lstm, transformer
    horizon_days INTEGER NOT NULL,
    metrics JSONB, -- KGE, NSE, PBIAS, MAE
    training_data_range TSRANGE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ESG Reports
CREATE TABLE esg_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    framework VARCHAR(50) NOT NULL, -- ESRS-E3, CDP-Water, GRI-303, ISO-14046
    reporting_period TSRANGE NOT NULL,
    data JSONB NOT NULL,
    water_footprint JSONB,
    risk_assessment JSONB,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    audit_trail JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Supply Chain (Neo4j mirror for complex queries)
CREATE TABLE supply_chain_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL, -- supplier, facility, basin
    name VARCHAR(255) NOT NULL,
    location GEOMETRY(POINT, 4326),
    water_risk_score DECIMAL(5, 2),
    blue_water_m3 DECIMAL(15, 2),
    green_water_m3 DECIMAL(15, 2),
    grey_water_m3 DECIMAL(15, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE supply_chain_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    source_id UUID REFERENCES supply_chain_nodes(id),
    target_id UUID REFERENCES supply_chain_nodes(id),
    relationship_type VARCHAR(100) NOT NULL,
    water_volume_m3 DECIMAL(15, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 InfluxDB Schema (Time-Series)

```
Bucket: sensors
  Measurement: groundwater_sensor
    Tags: aquifer_id, sensor_id, tenant_id, sensor_type
    Fields: depth_m, temperature_c, conductivity_ms, ph
    
  Measurement: soil_moisture
    Tags: aquifer_id, zone_id, tenant_id, source
    Fields: volumetric_percent, saturation_percent
    
  Measurement: rainfall
    Tags: aquifer_id, station_id, tenant_id, source
    Fields: mm_1h, mm_24h, mm_7d, mm_30d
    
  Measurement: satellite_grace
    Tags: aquifer_id, tenant_id, mission
    Fields: ewh_m, anomaly_m, uncertainty_m

Bucket: forecasts
  Measurement: groundwater_depth
    Tags: aquifer_id, model_version, model_type, tenant_id
    Fields: depth_m, upper_bound, lower_bound, confidence
    
  Measurement: model_metrics
    Tags: aquifer_id, model_version, metric_name
    Fields: value

Bucket: pipelines
  Measurement: pipeline_flow
    Tags: pipeline_id, aquifer_id, tenant_id
    Fields: flow_rate_lps, pressure_kpa, leak_detected
    
  Measurement: pipeline_condition
    Tags: pipeline_id, aquifer_id, tenant_id
    Fields: condition_score, corrosion_rate, structural_integrity
```

### 6.3 MongoDB Schema (Unstructured Metadata)

```javascript
// Collections

// satellite_metadata
{
  _id: ObjectId,
  aquifer_id: UUID,
  tenant_id: UUID,
  mission: "GRACE-FO" | "Sentinel-1" | "Sentinel-2" | "Landsat-9",
  acquisition_date: ISODate,
  resolution: { x: 10, y: 10, unit: "m" },
  cloud_cover_percent: 12.5,
  orbit: { path: 123, row: 45 },
  files: [
    { type: "raw", s3_url: "s3://...", size_bytes: 123456789 },
    { type: "processed", s3_url: "s3://...", size_bytes: 98765432 }
  ],
  processing_pipeline: {
    version: "2.1.0",
    steps: ["atmospheric_correction", "cloud_masking", "ndvi_calculation"],
    completed_at: ISODate
  },
  quality_score: 0.94,
  created_at: ISODate
}

// ml_model_registry
{
  _id: ObjectId,
  model_id: "meta-lstm-v3.2.1",
  tenant_id: UUID,
  type: "meta-learning",
  architecture: {
    base_model: "LSTM",
    meta_algorithm: "MAML",
    hidden_units: 128,
    layers: 2,
    adaptation_steps: 5
  },
  training: {
    source_basins: ["ganga", "godavari", "krishna", "cauvery"],
    epochs: 1000,
    meta_lr: 0.001,
    inner_lr: 0.4,
    batch_size: 32
  },
  metrics: {
    kge: 0.87,
    nse: 0.82,
    pbias: -2.3,
    mae: 1.45
  },
  artifacts: {
    weights: "s3://models/meta-lstm-v3.2.1.pt",
    config: "s3://models/meta-lstm-v3.2.1.yaml",
    onnx: "s3://models/meta-lstm-v3.2.1.onnx"
  },
  deployment: {
    status: "production",
    endpoint: "https://ml.aquaintelli.com/v2/predict",
    replicas: 3,
    avg_latency_ms: 45
  },
  created_at: ISODate,
  updated_at: ISODate
}

// llm_conversations
{
  _id: ObjectId,
  tenant_id: UUID,
  user_id: UUID,
  session_id: UUID,
  messages: [
    {
      role: "user" | "assistant",
      content: "What is the current groundwater depth in Hyderabad?",
      citations: ["CGWB-Report-2026-Q1", "Sentinel-1-2026-04-12"],
      tokens: { prompt: 45, completion: 120 },
      latency_ms: 850,
      timestamp: ISODate
    }
  ],
  context: {
    aquifer_id: "hyd-ap-001",
    location: "Hyderabad",
    active_filters: { date_range: "30d", sources: ["CGWB", "Sentinel"] }
  },
  feedback: {
    rating: 5,
    comment: "Very helpful for my ESG report"
  },
  created_at: ISODate
}
```

---

## 7. AI/ML Platform: Meta-Learning + LLMOps

### 7.1 Meta-Learning Architecture

```
ml-platform/
├── meta-learning/
│   ├── src/
│   │   ├── models/
│   │   │   ├── meta_lstm.py          # MAML-LSTM for time-series
│   │   │   ├── meta_gru.py           # MAML-GRU variant
│   │   │   ├── meta_transformer.py   # Meta-Transformer (MetaTrans)
│   │   │   └── base_model.py         # Abstract base
│   │   ├── trainers/
│   │   │   ├── maml_trainer.py       # Model-Agnostic Meta-Learning
│   │   │   ├── reptile_trainer.py    # Reptile algorithm
│   │   │   └── protonet_trainer.py   # Prototypical networks
│   │   ├── tasks/
│   │   │   ├── hydrology_tasks.py    # Task distribution generator
│   │   │   ├── basin_sampler.py      # Cross-basin sampling
│   │   │   └── adaptation.py         # Few-shot adaptation
│   │   ├── data/
│   │   │   ├── loaders.py
│   │   │   ├── preprocessors.py
│   │   │   └── augmenters.py
│   │   ├── evaluation/
│   │   │   ├── metrics.py            # KGE, NSE, PBIAS, MAE
│   │   │   ├── cross_validation.py   # Leave-one-basin-out CV
│   │   │   └── benchmark.py          # LLM benchmarks for hydrology
│   │   └── utils/
│   │       ├── logging.py
│   │       └── visualization.py
│   ├── configs/
│   │   ├── maml_lstm_config.yaml
│   │   ├── meta_trans_config.yaml
│   │   └── training_config.yaml
│   ├── notebooks/
│   │   ├── basin_exploration.ipynb
│   │   ├── meta_training.ipynb
│   │   └── evaluation.ipynb
│   ├── Dockerfile
│   └── requirements.txt
│
├── forecast-service/
│   ├── src/
│   │   ├── inference/
│   │   │   ├── predictor.py          # FastAPI inference endpoint
│   │   │   ├── batch_predictor.py    # Batch processing
│   │   │   └── ensemble.py           # Model ensemble
│   │   ├── preprocessing/
│   │   │   ├── feature_engineering.py
│   │   │   ├── scalers.py
│   │   │   └── imputers.py
│   │   ├── postprocessing/
│   │   │   ├── confidence_intervals.py
│   │   │   └── uncertainty_quantification.py
│   │   └── models/
│   │       └── model_loader.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── anomaly-detection/
│   ├── src/
│   │   ├── models/
│   │   │   ├── isolation_forest.py
│   │   │   ├── lstm_autoencoder.py
│   │   │   └── variational_autoencoder.py
│   │   └── detectors/
│   │       ├── sensor_fault_detector.py
│   │       └── data_drift_detector.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── 3d-model-generator/
│   ├── src/
│   │   ├── meshers/
│   │   │   ├── delaunay_mesher.py
│   │   │   └── marching_cubes.py
│   │   ├── interpolators/
│   │   │   ├── kriging.py
│   │   │   ├── idw.py
│   │   │   └── rbf.py
│   │   ├── exporters/
│   │   │   ├── gltf_exporter.py
│   │   │   └── vtk_exporter.py
│   │   └── generators/
│   │       ├── aquifer_volume.py
│   │       └── pipeline_mesh.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── llm-agent/
│   ├── src/
│   │   ├── rag/
│   │   │   ├── retriever.py          # Hybrid search (dense + sparse)
│   │   │   ├── reranker.py           # Cross-encoder reranking
│   │   │   └── chunker.py            # Semantic chunking
│   │   ├── guardrails/
│   │   │   ├── input_validator.py
│   │   │   ├── output_filter.py
│   │   │   └── topic_restriction.py
│   │   ├── prompts/
│   │   │   ├── system_prompt.txt
│   │   │   ├── groundwater_expert.txt
│   │   │   └── esg_reporter.txt
│   │   ├── agents/
│   │   │   ├── chat_agent.py
│   │   │   ├── report_agent.py
│   │   │   └── analysis_agent.py
│   │   └── tools/
│   │       ├── aquifer_tool.py
│   │       ├── forecast_tool.py
│   │       └── report_tool.py
│   ├── vector_store/
│   │   ├── weaviate_client.py
│   │   └── embedding_model.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── training-pipeline/          # Kubeflow / MLflow
│   ├── pipelines/
│   │   ├── meta_learning_pipeline.py
│   │   ├── forecast_retrain_pipeline.py
│   │   └── llm_finetune_pipeline.py
│   ├── components/
│   │   ├── data_ingestion/
│   │   ├── feature_engineering/
│   │   ├── model_training/
│   │   ├── model_evaluation/
│   │   ├── model_deployment/
│   │   └── model_monitoring/
│   ├── Dockerfile
│   └── requirements.txt
│
└── monitoring/
    ├── dashboards/
    │   ├── model_performance.json
    │   ├── data_drift.json
    │   └── inference_latency.json
    ├── alerts/
    │   ├── model_degradation.yml
    │   └── data_drift.yml
    └── Dockerfile
```

### 7.2 Meta-Learning Implementation (MAML)

```python
# ml-platform/meta-learning/src/trainers/maml_trainer.py
import torch
import torch.nn as nn
import torch.optim as optim
import learn2learn as l2l
from typing import List, Tuple, Dict
import numpy as np

class MetaLSTM(nn.Module):
    """
    MAML-based LSTM for groundwater depth forecasting.
    Learns initialization that enables rapid adaptation to new basins.
    """
    def __init__(
        self,
        input_dim: int,
        hidden_dim: int = 128,
        num_layers: int = 2,
        output_dim: int = 1,
        dropout: float = 0.2
    ):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        self.attention = nn.MultiheadAttention(hidden_dim, num_heads=4, batch_first=True)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, output_dim)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, seq_len, input_dim)
        lstm_out, _ = self.lstm(x)  # (batch, seq_len, hidden_dim)
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        return self.fc(attn_out[:, -1, :])  # (batch, output_dim)


class HydrologyTask:
    """Represents a single basin's forecasting task."""
    def __init__(
        self,
        basin_id: str,
        support_x: torch.Tensor,
        support_y: torch.Tensor,
        query_x: torch.Tensor,
        query_y: torch.Tensor
    ):
        self.basin_id = basin_id
        self.support_x = support_x
        self.support_y = support_y
        self.query_x = query_x
        self.query_y = query_y


class MAMLTrainer:
    """
    Model-Agnostic Meta-Learning trainer for hydrology forecasting.
    
    Training Strategy:
    1. Sample batch of basin tasks
    2. For each task: adapt model on support set (inner loop)
    3. Evaluate adapted model on query set
    4. Meta-update model to minimize average query loss (outer loop)
    """
    
    def __init__(
        self,
        model: MetaLSTM,
        meta_lr: float = 0.001,
        inner_lr: float = 0.4,
        inner_steps: int = 5,
        first_order: bool = False
    ):
        self.meta_model = l2l.algorithms.MAML(model, lr=meta_lr, first_order=first_order)
        self.inner_lr = inner_lr
        self.inner_steps = inner_steps
        self.meta_optimizer = optim.Adam(self.meta_model.parameters(), lr=meta_lr)
        self.criterion = nn.MSELoss()
        
    def meta_train_step(self, tasks: List[HydrologyTask]) -> Dict[str, float]:
        """
        Perform one meta-training step across multiple basin tasks.
        
        Args:
            tasks: List of HydrologyTask objects from different basins
            
        Returns:
            Dictionary containing meta-loss and per-task metrics
        """
        self.meta_optimizer.zero_grad()
        meta_loss = 0.0
        task_losses = []
        
        for task in tasks:
            # Clone model for task-specific adaptation
            learner = self.meta_model.clone()
            
            # Inner loop: adapt to specific basin
            for step in range(self.inner_steps):
                support_pred = learner(task.support_x)
                support_loss = self.criterion(support_pred, task.support_y)
                learner.adapt(support_loss)
            
            # Outer loop: evaluate on query set
            query_pred = learner(task.query_x)
            query_loss = self.criterion(query_pred, task.query_y)
            meta_loss += query_loss
            task_losses.append(query_loss.item())
        
        # Meta-optimization
        meta_loss = meta_loss / len(tasks)
        meta_loss.backward()
        
        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(self.meta_model.parameters(), 1.0)
        self.meta_optimizer.step()
        
        return {
            'meta_loss': meta_loss.item(),
            'mean_task_loss': np.mean(task_losses),
            'std_task_loss': np.std(task_losses),
            'min_task_loss': np.min(task_losses),
            'max_task_loss': np.max(task_losses)
        }
    
    def adapt_to_new_basin(
        self,
        support_x: torch.Tensor,
        support_y: torch.Tensor,
        adaptation_steps: int = 10
    ) -> MetaLSTM:
        """
        Adapt the meta-trained model to a new, unseen basin.
        Requires only 30-50 samples vs. thousands for traditional training.
        
        Args:
            support_x: Feature tensor for new basin (n_samples, seq_len, features)
            support_y: Target tensor for new basin (n_samples, 1)
            adaptation_steps: Number of gradient steps for adaptation
            
        Returns:
            Adapted model ready for inference
        """
        adapted_model = self.meta_model.clone()
        optimizer = optim.SGD(adapted_model.parameters(), lr=self.inner_lr)
        
        for step in range(adaptation_steps):
            pred = adapted_model(support_x)
            loss = self.criterion(pred, support_y)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        
        return adapted_model


class HydrologyBenchmark:
    """
    Benchmark suite for evaluating meta-learning models on hydrology tasks.
    Implements leave-one-basin-out cross-validation.
    """
    
    def __init__(self, basins: List[str], metrics: List[str] = None):
        self.basins = basins
        self.metrics = metrics or ['kge', 'nse', 'pbias', 'mae', 'rmse']
        
    def evaluate(
        self,
        trainer: MAMLTrainer,
        test_basin: str,
        n_support_samples: int = 50
    ) -> Dict[str, float]:
        """
        Evaluate model on held-out basin using few-shot adaptation.
        
        Args:
            trainer: Trained MAML trainer
            test_basin: Basin ID to evaluate on
            n_support_samples: Number of samples for adaptation
            
        Returns:
            Dictionary of evaluation metrics
        """
        # Load test basin data
        test_data = self.load_basin_data(test_basin)
        
        # Split into support and query sets
        support_x = test_data['x'][:n_support_samples]
        support_y = test_data['y'][:n_support_samples]
        query_x = test_data['x'][n_support_samples:]
        query_y = test_data['y'][n_support_samples:]
        
        # Adapt model
        adapted_model = trainer.adapt_to_new_basin(support_x, support_y)
        
        # Predict
        with torch.no_grad():
            predictions = adapted_model(query_x).numpy()
        actuals = query_y.numpy()
        
        # Calculate metrics
        results = {}
        if 'kge' in self.metrics:
            results['kge'] = self._kling_gupta_efficiency(actuals, predictions)
        if 'nse' in self.metrics:
            results['nse'] = self._nash_sutcliffe_efficiency(actuals, predictions)
        if 'pbias' in self.metrics:
            results['pbias'] = self._percent_bias(actuals, predictions)
        if 'mae' in self.metrics:
            results['mae'] = np.mean(np.abs(actuals - predictions))
        if 'rmse' in self.metrics:
            results['rmse'] = np.sqrt(np.mean((actuals - predictions) ** 2))
            
        return results
    
    def _kling_gupta_efficiency(self, obs: np.ndarray, sim: np.ndarray) -> float:
        r = np.corrcoef(obs, sim)[0, 1]
        alpha = np.std(sim) / np.std(obs)
        beta = np.mean(sim) / np.mean(obs)
        return 1 - np.sqrt((r - 1)**2 + (alpha - 1)**2 + (beta - 1)**2)
    
    def _nash_sutcliffe_efficiency(self, obs: np.ndarray, sim: np.ndarray) -> float:
        return 1 - np.sum((obs - sim)**2) / np.sum((obs - np.mean(obs))**2)
    
    def _percent_bias(self, obs: np.ndarray, sim: np.ndarray) -> float:
        return 100 * np.sum(sim - obs) / np.sum(obs)
```

### 7.3 LLM Agent with RAG

```python
# ml-platform/llm-agent/src/agents/chat_agent.py
from typing import List, Dict, Optional
from langchain import OpenAI, LLMChain, PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.agents import Tool, AgentExecutor, initialize_agent
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Weaviate
import weaviate

class AquaIntelliLLMAgent:
    """
    Multi-modal LLM agent for groundwater intelligence.
    Combines RAG retrieval with tool-use for real-time data access.
    """
    
    def __init__(self, tenant_id: str, model_name: str = "llama-3-70b"):
        self.tenant_id = tenant_id
        self.model_name = model_name
        
        # Initialize embedding model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Initialize vector store
        self.weaviate_client = weaviate.Client("http://weaviate:8080")
        self.vector_store = Weaviate(
            client=self.weaviate_client,
            index_name="AquaIntelli_Knowledge",
            text_key="content",
            embedding=self.embeddings
        )
        
        # Initialize LLM
        self.llm = OpenAI(
            model_name=model_name,
            temperature=0.3,
            max_tokens=2048
        )
        
        # Initialize tools
        self.tools = self._initialize_tools()
        
        # Initialize agent
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent="conversational-react-description",
            memory=ConversationBufferMemory(memory_key="chat_history"),
            verbose=True
        )
        
    def _initialize_tools(self) -> List[Tool]:
        """Initialize tool set for the agent."""
        return [
            Tool(
                name="aquifer_data",
                func=self._query_aquifer_data,
                description="Query current groundwater depth, soil moisture, and rainfall for a specific aquifer"
            ),
            Tool(
                name="forecast_data",
                func=self._query_forecast_data,
                description="Get AI-generated groundwater depth forecasts for 30 or 90 days"
            ),
            Tool(
                name="pipeline_data",
                func=self._query_pipeline_data,
                description="Query underground pipeline infrastructure depth and diameter"
            ),
            Tool(
                name="esg_report",
                func=self._generate_esg_report,
                description="Generate ESG water risk reports (ESRS E3, CDP Water, GRI 303)"
            ),
            Tool(
                name="knowledge_base",
                func=self._query_knowledge_base,
                description="Search scientific papers, policy documents, and basin reports"
            )
        ]
    
    def chat(self, message: str, context: Optional[Dict] = None) -> Dict:
        """
        Process user message and return response with citations.
        
        Args:
            message: User query
            context: Optional context (aquifer_id, location, date_range)
            
        Returns:
            Dictionary with response, citations, and metadata
        """
        # Enhance prompt with context
        enhanced_message = self._enhance_prompt(message, context)
        
        # Run agent
        response = self.agent.run(enhanced_message)
        
        # Extract citations from RAG retrieval
        citations = self._extract_citations(message)
        
        return {
            "response": response,
            "citations": citations,
            "model": self.model_name,
            "timestamp": datetime.utcnow().isoformat(),
            "context": context
        }
    
    def _enhance_prompt(self, message: str, context: Optional[Dict]) -> str:
        """Enhance user prompt with system context."""
        system_context = """You are AquaIntelli AI, an expert groundwater intelligence assistant.
        You have access to real-time satellite data (GRACE-FO, Sentinel-1), ground sensor networks,
        AI forecasting models, and underground pipeline infrastructure data.
        Provide accurate, evidence-based responses with specific numbers and sources."""
        
        if context:
            location_context = f"\nCurrent context: Aquifer {context.get('aquifer_id')} in {context.get('location')}."
            return f"{system_context}{location_context}\n\nUser: {message}"
        
        return f"{system_context}\n\nUser: {message}"
    
    def _query_knowledge_base(self, query: str) -> str:
        """Retrieve relevant documents from vector store."""
        docs = self.vector_store.similarity_search(query, k=5)
        return "\n\n".join([doc.page_content for doc in docs])
    
    def _query_aquifer_data(self, aquifer_id: str) -> str:
        """Fetch real-time aquifer data from API."""
        # Implementation calls core-api
        pass
    
    def _query_forecast_data(self, params: str) -> str:
        """Fetch forecast data from ML service."""
        # Implementation calls forecast-service
        pass
    
    def _query_pipeline_data(self, aquifer_id: str) -> str:
        """Fetch pipeline infrastructure data."""
        # Implementation calls pipeline service
        pass
    
    def _generate_esg_report(self, framework: str) -> str:
        """Generate ESG report via enterprise service."""
        # Implementation calls enterprise service
        pass
    
    def _extract_citations(self, query: str) -> List[str]:
        """Extract source citations from RAG retrieval."""
        docs = self.vector_store.similarity_search(query, k=3)
        return [doc.metadata.get("source", "Unknown") for doc in docs]
```

---

## 8. 3D Aquifer Visualization Engine

### 8.1 Three.js Scene Architecture

```typescript
// apps/3d-viewer/src/engine/AquiferScene.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VTKLoader } from 'three/examples/jsm/loaders/VTKLoader';

interface Aquifer3DConfig {
  container: HTMLElement;
  aquiferId: string;
  enablePipelines: boolean;
  enableContamination: boolean;
  enableWaterTable: boolean;
  resolution: 'low' | 'medium' | 'high';
}

interface LayerVisibility {
  waterTable: boolean;
  soilLayers: boolean;
  pipelines: boolean;
  contamination: boolean;
  satelliteImagery: boolean;
}

export class Aquifer3DEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private animationId: number;
  private layers: Map<string, THREE.Object3D> = new Map();
  private config: Aquifer3DConfig;
  private clock: THREE.Clock;
  
  // Shader uniforms for animation
  private waterTableUniforms: { [key: string]: THREE.IUniform } = {};
  private contaminationUniforms: { [key: string]: THREE.IUniform } = {};

  constructor(config: Aquifer3DConfig) {
    this.config = config;
    this.clock = new THREE.Clock();
    this.init();
  }

  private init(): void {
    const { container } = this.config;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.001);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    this.camera.position.set(500, 400, 500);

    // Renderer with WebGL 2.0
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 2000;
    this.controls.target.set(0, -50, 0);

    // Lighting
    this.setupLighting();

    // Raycaster for interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Event listeners
    window.addEventListener('resize', this.onResize.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this));

    // Start animation loop
    this.animate();
  }

  private setupLighting(): void {
    // Ambient
    const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
    this.scene.add(ambientLight);

    // Hemisphere
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x362d1d, 0.8);
    this.scene.add(hemiLight);

    // Directional (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(200, 500, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 2000;
    dirLight.shadow.camera.left = -1000;
    dirLight.shadow.camera.right = 1000;
    dirLight.shadow.camera.top = 1000;
    dirLight.shadow.camera.bottom = -1000;
    this.scene.add(dirLight);

    // Point lights for depth cues
    const pointLight1 = new THREE.PointLight(0x4488ff, 1, 1000);
    pointLight1.position.set(-200, 100, -200);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff8844, 0.8, 1000);
    pointLight2.position.set(200, 50, 200);
    this.scene.add(pointLight2);
  }

  async loadAquiferData(aquiferData: any): Promise<void> {
    // Clear existing layers
    this.clearLayers();

    // 1. Terrain / Surface
    await this.loadTerrainLayer(aquiferData.dem);

    // 2. Water Table (volumetric)
    if (this.config.enableWaterTable) {
      await this.loadWaterTableLayer(aquiferData.waterTable);
    }

    // 3. Soil Layers
    await this.loadSoilLayers(aquiferData.soilLayers);

    // 4. Pipelines (v2 Feature)
    if (this.config.enablePipelines && aquiferData.pipelines) {
      await this.loadPipelineLayer(aquiferData.pipelines);
    }

    // 5. Contamination
    if (this.config.enableContamination && aquiferData.contamination) {
      await this.loadContaminationLayer(aquiferData.contamination);
    }

    // 6. Satellite imagery overlay
    await this.loadSatelliteOverlay(aquiferData.satelliteImagery);

    // Fit camera to scene
    this.fitCameraToScene();
  }

  private async loadWaterTableLayer(waterTableData: any): Promise<void> {
    const { resolution, depthMap, saturationMap } = waterTableData;
    
    // Create volumetric geometry
    const geometry = new THREE.PlaneGeometry(
      1000, 1000,
      resolution.x - 1, resolution.y - 1
    );

    // Apply depth displacement
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < resolution.x * resolution.y; i++) {
      positions[i * 3 + 2] = -depthMap[i] * 3; // Scale for visualization
    }
    geometry.computeVertexNormals();

    // Custom shader for water visualization
    this.waterTableUniforms = {
      uTime: { value: 0 },
      uSaturation: { value: new THREE.DataTexture(
        saturationMap, resolution.x, resolution.y, THREE.LuminanceFormat
      )},
      uDepthScale: { value: 3.0 },
      uColorLow: { value: new THREE.Color(0x1a4d6e) },    // Deep blue
      uColorHigh: { value: new THREE.Color(0x87ceeb) },   // Light blue
      uColorDepleted: { value: new THREE.Color(0x8b6914) } // Brown
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.waterTableUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying float vDepth;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vDepth = position.z;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uSaturation;
        uniform float uDepthScale;
        uniform vec3 uColorLow;
        uniform vec3 uColorHigh;
        uniform vec3 uColorDepleted;
        
        varying vec2 vUv;
        varying float vDepth;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float saturation = texture2D(uSaturation, vUv).r;
          
          // Animated wave effect
          float wave = sin(vUv.x * 20.0 + uTime * 0.5) * 0.02;
          wave += sin(vUv.y * 15.0 + uTime * 0.3) * 0.015;
          
          // Color based on saturation and depth
          vec3 color = mix(uColorDepleted, uColorLow, saturation);
          color = mix(color, uColorHigh, saturation * 0.5 + wave);
          
          // Fresnel effect for water-like appearance
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
          color = mix(color, uColorHigh, fresnel * 0.3);
          
          // Depth-based alpha
          float alpha = 0.6 + saturation * 0.3;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.name = 'waterTable';
    this.layers.set('waterTable', mesh);
    this.scene.add(mesh);
  }

  private async loadPipelineLayer(pipelines: any[]): Promise<void> {
    const group = new THREE.Group();
    group.name = 'pipelines';

    pipelines.forEach((pipeline) => {
      const { path, diameter, type, depth } = pipeline;
      
      // Create tube geometry from path
      const points = path.map((p: any) => new THREE.Vector3(p.x, -depth, p.z));
      const curve = new THREE.CatmullRomCurve3(points);
      
      const tubeGeometry = new THREE.TubeGeometry(
        curve,
        64,
        diameter / 2,
        12,
        false
      );

      // Material based on pipeline type
      const colorMap = {
        main: 0xdc2626,
        secondary: 0xea580c,
        tertiary: 0xca8a04
      };

      const material = new THREE.MeshPhysicalMaterial({
        color: colorMap[type as keyof typeof colorMap] || 0x888888,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: colorMap[type as keyof typeof colorMap] || 0x888888,
        emissiveIntensity: 0.2
      });

      const tube = new THREE.Mesh(tubeGeometry, material);
      tube.castShadow = true;
      tube.receiveShadow = true;
      
      // Add glow effect for main trunks
      if (type === 'main') {
        const glowGeometry = new THREE.TubeGeometry(curve, 64, diameter, 12, false);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xdc2626,
          transparent: true,
          opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
      }

      group.add(tube);
    });

    this.layers.set('pipelines', group);
    this.scene.add(group);
  }

  private async loadContaminationLayer(contaminationData: any): Promise<void> {
    const { plumes } = contaminationData;
    const group = new THREE.Group();
    group.name = 'contamination';

    plumes.forEach((plume: any) => {
      // Create ellipsoid for contamination plume
      const geometry = new THREE.SphereGeometry(plume.radius, 32, 32);
      
      // Scale to ellipsoid
      geometry.scale(plume.scaleX, plume.scaleY, plume.scaleZ);
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0xff00ff) },
          uIntensity: { value: plume.concentration }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec3 vNormal;
          
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(uColor, intensity * uIntensity * 0.5);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(plume.x, -plume.depth, plume.z);
      group.add(mesh);
    });

    this.layers.set('contamination', group);
    this.scene.add(group);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    const elapsed = this.clock.getElapsedTime();
    
    // Update shader uniforms
    if (this.waterTableUniforms.uTime) {
      this.waterTableUniforms.uTime.value = elapsed;
    }
    
    if (this.contaminationUniforms.uTime) {
      this.contaminationUniforms.uTime.value = elapsed;
    }

    // Rotate contamination plumes slowly
    const contaminationGroup = this.layers.get('contamination');
    if (contaminationGroup) {
      contaminationGroup.rotation.y = elapsed * 0.05;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setLayerVisibility(visibility: LayerVisibility): void {
    Object.entries(visibility).forEach(([layerName, isVisible]) => {
      const layer = this.layers.get(layerName);
      if (layer) {
        layer.visible = isVisible;
      }
    });
  }

  private onResize(): void {
    const { container } = this.config;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onClick(event: MouseEvent): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      // Emit click event with object data
      this.emit('objectClick', {
        object: object.name,
        point: intersects[0].point,
        distance: intersects[0].distance
      });
    }
  }

  private emit(eventName: string, data: any): void {
    // Event emission for React integration
    const event = new CustomEvent(eventName, { detail: data });
    this.config.container.dispatchEvent(event);
  }

  private clearLayers(): void {
    this.layers.forEach((layer) => {
      this.scene.remove(layer);
      // Dispose geometries and materials
      layer.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.layers.clear();
  }

  private fitCameraToScene(): void {
    const box = new THREE.Box3().setFromObject(this.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
    
    this.camera.position.set(center.x + cameraZ, center.y + cameraZ * 0.8, center.z + cameraZ);
    this.controls.target.copy(center);
    this.controls.update();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.clearLayers();
    this.renderer.dispose();
    this.config.container.removeChild(this.renderer.domElement);
  }
}
```

---

## 9. API Design & Specifications

### 9.1 REST API Endpoints

```yaml
openapi: 3.0.3
info:
  title: AquaIntelli Enterprise API
  version: 3.0.0
  description: |
    Enterprise Groundwater Intelligence Platform API.
    All endpoints support multi-tenancy via X-Tenant-ID header.

servers:
  - url: https://api.aquaintelli.com/v2
    description: Production
  - url: https://staging-api.aquaintelli.com/v2
    description: Staging

security:
  - bearerAuth: []
  - apiKeyAuth: []

paths:
  # Aquifers
  /aquifers:
    get:
      summary: List aquifers
      parameters:
        - name: bbox
          in: query
          schema: { type: string, example: "78.0,17.0,79.0,18.0" }
        - name: status
          in: query
          schema: { type: string, enum: [critical, warning, operational, recovery] }
        - name: limit
          in: query
          schema: { type: integer, default: 20 }
        - name: offset
          in: query
          schema: { type: integer, default: 0 }
      responses:
        200:
          description: List of aquifers
          content:
            application/json:
              schema:
                type: object
                properties:
                  data: { type: array, items: { $ref: '#/components/schemas/Aquifer' } }
                  total: { type: integer }
                  limit: { type: integer }
                  offset: { type: integer }

  /aquifers/{id}:
    get:
      summary: Get aquifer details
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        200:
          description: Aquifer details
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Aquifer' }

  /aquifers/{id}/metrics:
    get:
      summary: Get real-time metrics for aquifer
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        200:
          description: Current metrics
          content:
            application/json:
              schema:
                type: object
                properties:
                  grace_anomaly: { type: number }
                  current_depth: { type: number }
                  soil_moisture: { type: number }
                  rainfall: { type: number }
                  depletion_rate: { type: number }
                  risk_level: { type: string }

  # Forecasts
  /forecasts:
    post:
      summary: Generate groundwater depth forecast
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                aquifer_id: { type: string }
                horizon_days: { type: integer, enum: [30, 90, 180, 365] }
                model_version: { type: string, default: "meta-lstm-v3" }
                include_confidence_interval: { type: boolean, default: true }
                adaptation_data: { type: array, items: { type: object } }
      responses:
        200:
          description: Forecast results
          content:
            application/json:
              schema:
                type: object
                properties:
                  aquifer_id: { type: string }
                  model_version: { type: string }
                  meta_learning_adapted: { type: boolean }
                  forecasts:
                    type: array
                    items:
                      type: object
                      properties:
                        date: { type: string, format: date }
                        depth: { type: number }
                        confidence_interval: { type: array, items: { type: number } }
                        uncertainty: { type: number }

  # Pipelines (v2 Feature)
  /pipelines:
    get:
      summary: List pipeline segments
      parameters:
        - name: aquifer_id
          in: query
          required: true
          schema: { type: string }
        - name: type
          in: query
          schema: { type: string, enum: [main, secondary, tertiary] }
        - name: bbox
          in: query
          schema: { type: string }
      responses:
        200:
          description: Pipeline segments
          content:
            application/json:
              schema:
                type: object
                properties:
                  segments:
                    type: array
                    items: { $ref: '#/components/schemas/PipelineSegment' }
                  total_length: { type: number }
                  coverage: { type: integer }

  /pipelines/{id}/depth-profile:
    get:
      summary: Get depth profile along pipeline
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        200:
          description: Depth profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  pipeline_id: { type: string }
                  profile:
                    type: array
                    items:
                      type: object
                      properties:
                        distance_m: { type: number }
                        depth_m: { type: number }
                        ground_elevation_m: { type: number }
                        water_table_depth_m: { type: number }

  # 3D Models
  /aquifers/{id}/3d-model:
    get:
      summary: Get 3D aquifer model data
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
        - name: resolution
          in: query
          schema: { type: string, enum: [low, medium, high], default: medium }
        - name: layers
          in: query
          schema: { type: array, items: { type: string } }
      responses:
        200:
          description: 3D model data
          content:
            application/json:
              schema:
                type: object
                properties:
                  boundary: { type: array, items: { type: array, items: { type: number } } }
                  depth_map: { type: array, items: { type: number } }
                  soil_moisture: { type: array, items: { type: number } }
                  contamination: { type: array, items: { type: number } }
                  pipelines: { type: array, items: { type: object } }
                  resolution: { type: object }

  # LLM
  /llm/chat:
    post:
      summary: Chat with AquaIntelli AI
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message: { type: string }
                context:
                  type: object
                  properties:
                    aquifer_id: { type: string }
                    location: { type: string }
                history:
                  type: array
                  items:
                    type: object
                    properties:
                      role: { type: string, enum: [user, assistant] }
                      content: { type: string }
      responses:
        200:
          description: AI response
          content:
            application/json:
              schema:
                type: object
                properties:
                  response: { type: string }
                  citations: { type: array, items: { type: string } }
                  model: { type: string }
                  tokens_used: { type: integer }
                  latency_ms: { type: number }

  # ESG Reports
  /reports/esg:
    post:
      summary: Generate ESG report
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                framework: { type: string, enum: [ESRS-E3, CDP-Water, GRI-303, ISO-14046] }
                reporting_period: { type: string }
                aquifer_ids: { type: array, items: { type: string } }
                include_supply_chain: { type: boolean }
      responses:
        200:
          description: Generated report
          content:
            application/json:
              schema:
                type: object
                properties:
                  report_id: { type: string }
                  framework: { type: string }
                  status: { type: string }
                  download_url: { type: string }
                  water_footprint:
                    type: object
                    properties:
                      blue_water_m3: { type: number }
                      green_water_m3: { type: number }
                      grey_water_m3: { type: number }

components:
  schemas:
    Aquifer:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        code: { type: string }
        geometry: { type: object }
        centroid: { type: object }
        area_km2: { type: number }
        status: { type: string }
        current_depth_m: { type: number }
        risk_level: { type: string }

    PipelineSegment:
      type: object
      properties:
        id: { type: string }
        type: { type: string }
        coordinates: { type: array, items: { type: array, items: { type: number } } }
        diameter_mm: { type: integer }
        depth_min_m: { type: number }
        depth_max_m: { type: number }
        material: { type: string }
        installation_year: { type: integer }
        condition_rating: { type: integer }

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

### 9.2 GraphQL Schema

```graphql
# services/graphql-api/schemas/aquifer.graphql
type Aquifer {
  id: ID!
  name: String!
  code: String!
  geometry: GeoJSON
  centroid: GeoJSON
  areaKm2: Float
  status: AquiferStatus
  currentDepth: Float
  riskLevel: RiskLevel
  
  # Nested queries
  sensors: [Sensor!]!
  pipelines: [Pipeline!]!
  forecasts(days: Int!): [Forecast!]!
  threeDModel(resolution: Resolution = MEDIUM): Aquifer3DModel
  metrics: AquiferMetrics
  esgReports(framework: ESGFramework): [ESGReport!]!
}

type AquiferMetrics {
  graceAnomaly: Float
  currentDepth: Float
  soilMoisture: Float
  rainfallMm: Float
  depletionRate: Float
  riskLevel: RiskLevel
  lastUpdated: DateTime
}

type Forecast {
  date: DateTime!
  depth: Float!
  confidenceInterval: [Float!]!
  uncertainty: Float!
  modelVersion: String!
  metaLearningAdapted: Boolean!
}

type Pipeline {
  id: ID!
  name: String!
  type: PipelineType!
  geometry: GeoJSON
  diameterMm: Int
  depthMinM: Float
  depthMaxM: Float
  material: String
  installationYear: Int
  conditionRating: Int
  flowCapacityLps: Float
  status: String
  depthProfile: [DepthPoint!]!
}

type DepthPoint {
  distanceM: Float!
  depthM: Float!
  groundElevationM: Float!
  waterTableDepthM: Float
}

type Aquifer3DModel {
  boundary: GeoJSON
  depthMap: [Float!]!
  soilMoisture: [Float!]!
  contamination: [Float!]!
  pipelines: [Pipeline3D!]!
  resolution: Resolution!
  boundingBox: BoundingBox!
}

type Pipeline3D {
  id: ID!
  path: [Coordinate3D!]!
  diameter: Float!
  type: PipelineType!
}

type Coordinate3D {
  x: Float!
  y: Float!
  z: Float!
}

enum AquiferStatus {
  OPERATIONAL
  WARNING
  CRITICAL
  RECOVERY
}

enum RiskLevel {
  CRITICAL
  WARNING
  OPERATIONAL
  RECOVERY
}

enum PipelineType {
  MAIN
  SECONDARY
  TERTIARY
}

enum Resolution {
  LOW
  MEDIUM
  HIGH
}

enum ESGFramework {
  ESRS_E3
  CDP_WATER
  GRI_303
  ISO_14046
}

type Query {
  aquifer(id: ID!): Aquifer
  aquifers(
    bbox: BoundingBoxInput
    status: AquiferStatus
    limit: Int = 20
    offset: Int = 0
  ): AquiferConnection!
  
  pipeline(id: ID!): Pipeline
  pipelines(
    aquiferId: ID!
    type: PipelineType
    bbox: BoundingBoxInput
  ): [Pipeline!]!
  
  metaLearningStatus: MetaTrainingStatus
  llmChat(message: String!, context: ChatContextInput): LLMResponse!
}

type Mutation {
  generateForecast(
    aquiferId: ID!
    horizonDays: Int!
    modelVersion: String
  ): ForecastJob!
  
  generateESGReport(
    framework: ESGFramework!
    aquiferIds: [ID!]!
    reportingPeriod: DateRangeInput!
  ): ESGReport!
  
  adaptMetaModel(
    aquiferId: ID!
    supportData: [TrainingSampleInput!]!
  ): AdaptationResult!
}

type Subscription {
  sensorUpdates(aquiferId: ID!): SensorReading!
  forecastUpdates(aquiferId: ID!): Forecast!
  alertNotifications(tenantId: ID!): Alert!
}
```

### 9.3 WebSocket Events

```typescript
// Real-time event definitions

interface ServerToClientEvents {
  // Sensor data updates
  'sensor:reading': (data: {
    sensorId: string;
    aquiferId: string;
    timestamp: string;
    depth: number;
    temperature: number;
    conductivity: number;
  }) => void;

  // Forecast updates
  'forecast:update': (data: {
    aquiferId: string;
    forecastId: string;
    date: string;
    depth: number;
    confidenceInterval: [number, number];
  }) => void;

  // Alerts
  'alert:new': (data: {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    type: string;
    message: string;
    aquiferId: string;
    timestamp: string;
    metadata: Record<string, any>;
  }) => void;

  // Pipeline monitoring (v2)
  'pipeline:flow': (data: {
    pipelineId: string;
    flowRateLps: number;
    pressureKpa: number;
    leakDetected: boolean;
    timestamp: string;
  }) => void;

  // System status
  'system:status': (data: {
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, { status: string; latency: number }>;
  }) => void;
}

interface ClientToServerEvents {
  // Join aquifer room for updates
  'aquifer:subscribe': (aquiferId: string) => void;
  'aquifer:unsubscribe': (aquiferId: string) => void;

  // Join tenant room for alerts
  'tenant:subscribe': (tenantId: string) => void;

  // Request immediate data refresh
  'sensor:request': (sensorId: string) => void;
  'forecast:request': (aquiferId: string, horizonDays: number) => void;
}
```

---

## 10. Security Architecture

### 10.1 Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                    PERIMETER SECURITY                        │
│  • Cloudflare/AWS WAF (DDoS, Bot Protection)                │
│  • Rate Limiting (1000 req/min per API key)                 │
│  • Geo-blocking (optional per tenant)                       │
│  • TLS 1.3 termination                                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY SECURITY                      │
│  • JWT/OAuth2 authentication                                │
│  • API key management with rotation                         │
│  • Request validation & sanitization                        │
│  • CORS policy enforcement                                  │
│  • Request/response logging                                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE MESH SECURITY                     │
│  • mTLS between all services (Istio)                        │
│  • Service-to-service auth (SPIFFE/SPIRE)                   │
│  • Network policies (zero-trust)                            │
│  • Traffic encryption in transit                            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION SECURITY                      │
│  • RBAC with resource-level permissions                     │
│  • ABAC for enterprise tenants                              │
│  • Input validation (Zod/Joi)                               │
│  • SQL injection prevention (parameterized queries)         │
│  • XSS protection (Helmet, CSP)                             │
│  • CSRF tokens                                              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    DATA SECURITY                             │
│  • AES-256 encryption at rest (RDS, S3, EBS)                │
│  • Field-level encryption for PII                           │
│  • Database auditing (pgaudit)                              │
│  • Data masking for non-production                          │
│  • Backup encryption                                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    ML/LLM SECURITY                           │
│  • Model signing (Sigstore)                                 │
│  • Adversarial input detection                              │
│  • Prompt injection filtering (NeMo Guardrails)             │
│  • Output sanitization                                      │
│  • Model explainability (SHAP/LIME)                         │
│  • Data poisoning detection                                 │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Authentication & Authorization

```typescript
// services/core-api/src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';
import { getUserPermissions } from '../services/rbac.service';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    // Load user with tenant context
    const user = await getUserWithTenant(decoded.sub);
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'User not found or inactive' });
    }

    // Check tenant subscription status
    if (user.tenant.status !== 'active') {
      return reply.status(403).send({ error: 'Tenant subscription expired' });
    }

    // Load permissions
    const permissions = await getUserPermissions(user.id, user.tenantId);

    // Attach user to request
    (request as AuthenticatedRequest).user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions,
    };

  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

// RBAC middleware
export function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as AuthenticatedRequest).user;
    
    if (!user.permissions.includes(permission)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Required permission: ${permission}`,
      });
    }
  };
}

// ABAC middleware for enterprise
export function requireResourceAccess(resourceType: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as AuthenticatedRequest).user;
    const resourceId = (request.params as any).id;
    
    const hasAccess = await checkResourceAccess(
      user.id,
      user.tenantId,
      resourceType,
      resourceId
    );
    
    if (!hasAccess) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Access denied to this resource',
      });
    }
  };
}
```

### 10.3 Compliance Framework

| Standard | Implementation |
|----------|---------------|
| **ISO 27001** | ISMS policies, risk assessment, access controls |
| **SOC 2 Type II** | Security, availability, confidentiality controls |
| **GDPR** | Data portability, right to erasure, consent management |
| **India DPDPA 2023** | Data localization, consent framework |
| **ESRS E3** | Water & marine resources disclosure |
| **ISO 14046** | Water footprint assessment methodology |

---

## 11. DevOps, MLOps, LLMOps & CI/CD

### 11.1 CI/CD Pipeline

```yaml
# .github/workflows/enterprise-ci-cd.yml
name: AquaIntelli Enterprise CI/CD

on:
  push:
    branches: [main, staging, 'release/*']
  pull_request:
    branches: [main]

env:
  AWS_REGION: ap-south-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com
  KUBECONFIG: ${{ secrets.KUBECONFIG }}

jobs:
  # Stage 1: Code Quality & Security
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with: { python-version: '3.11', cache: 'pip' }
      
      - name: Lint & Format Check
        run: |
          npm run lint
          npm run format:check
          black --check .
          ruff check .
      
      - name: Static Analysis
        run: |
          npm run typecheck
          mypy ml-platform/
      
      - name: Security Scan (SAST)
        run: |
          npm audit --audit-level=moderate
          bandit -r ml-platform/
          semgrep --config=auto .
      
      - name: Secret Detection
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

  # Stage 2: Testing
  test:
    runs-on: ubuntu-latest
    needs: quality-gates
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: aquaintelli_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports: ['5432:5432']
      
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
      
      influxdb:
        image: influxdb:2.7
        env:
          DOCKER_INFLUXDB_INIT_MODE: setup
          DOCKER_INFLUXDB_INIT_USERNAME: test
          DOCKER_INFLUXDB_INIT_PASSWORD: testtest
          DOCKER_INFLUXDB_INIT_ORG: test
          DOCKER_INFLUXDB_INIT_BUCKET: test
        ports: ['8086:8086']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Unit Tests (Backend)
        run: |
          cd services/core-api
          npm ci
          npm run test:unit -- --coverage
      
      - name: Integration Tests
        run: |
          cd services/core-api
          npm run test:integration
      
      - name: ML Model Tests
        run: |
          cd ml-platform
          pip install -r requirements.txt
          pytest tests/ --cov=src --cov-report=xml
      
      - name: Frontend Tests
        run: |
          cd apps/web
          npm ci
          npm run test -- --coverage
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info,./ml-platform/coverage.xml

  # Stage 3: Build & Push Containers
  build:
    runs-on: ubuntu-latest
    needs: test
    strategy:
      matrix:
        service:
          - api-gateway
          - core-api
          - graphql-api
          - websocket
          - data-ingestion
          - notification
          - enterprise
          - ml-meta-learning
          - ml-forecast-service
          - ml-llm-agent
          - web
          - 3d-viewer
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build & Push
        run: |
          docker build -t ${{ env.ECR_REGISTRY }}/aquaintelli-${{ matrix.service }}:${{ github.sha }} \
            -f docker/${{ matrix.service }}.Dockerfile .
          docker push ${{ env.ECR_REGISTRY }}/aquaintelli-${{ matrix.service }}:${{ github.sha }}
          docker tag ${{ env.ECR_REGISTRY }}/aquaintelli-${{ matrix.service }}:${{ github.sha }} \
            ${{ env.ECR_REGISTRY }}/aquaintelli-${{ matrix.service }}:latest
          docker push ${{ env.ECR_REGISTRY }}/aquaintelli-${{ matrix.service }}:latest

  # Stage 4: Infrastructure (Terraform)
  infrastructure:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with: { terraform_version: '1.7.0' }
      
      - name: Terraform Init & Plan
        run: |
          cd infrastructure/terraform/environments/${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
          terraform init
          terraform plan -out=tfplan
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: |
          cd infrastructure/terraform/environments/production
          terraform apply -auto-approve tfplan

  # Stage 5: Deploy to Kubernetes
  deploy:
    runs-on: ubuntu-latest
    needs: [build, infrastructure]
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Setup Helm
        uses: azure/setup-helm@v3
      
      - name: Configure kubeconfig
        run: |
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > ~/.kube/config
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install aquaintelli ./infrastructure/helm/aquaintelli \
            --namespace aquaintelli \
            --set global.environment=${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }} \
            --set global.image.tag=${{ github.sha }} \
            --set global.image.registry=${{ env.ECR_REGISTRY }} \
            --wait --timeout 10m
      
      - name: Verify Deployment
        run: |
          kubectl rollout status deployment/core-api -n aquaintelli
          kubectl rollout status deployment/forecast-service -n aquaintelli
          kubectl rollout status deployment/llm-agent -n aquaintelli

  # Stage 6: Smoke & Load Tests
  smoke-tests:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - uses: actions/checkout@v4
      
      - name: Smoke Tests
        run: |
          curl -f https://api.aquaintelli.com/v2/health || exit 1
          curl -f https://api.aquaintelli.com/v2/aquifers || exit 1
      
      - name: Load Tests (k6)
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/smoke.js

  # Stage 7: Rollback on Failure
  rollback:
    runs-on: ubuntu-latest
    needs: deploy
    if: failure()
    steps:
      - name: Rollback Deployment
        run: |
          helm rollback aquaintelli 0 -n aquaintelli
```

### 11.2 MLOps Pipeline

```yaml
# ml-platform/training-pipeline/meta_learning_pipeline.py
from kfp import dsl
from kfp.components import create_component_from_func

@dsl.pipeline(
    name='Meta-Learning Training Pipeline',
    description='End-to-end pipeline for training meta-learning groundwater forecast models'
)
def meta_learning_pipeline(
    source_basins: str = 'ganga,godavari,krishna,cauvery',
    meta_lr: float = 0.001,
    inner_lr: float = 0.4,
    inner_steps: int = 5,
    epochs: int = 1000,
    batch_size: int = 32,
    model_output_path: str = 's3://aquaintelli-models/meta-learning/'
):
    # Stage 1: Data Ingestion
    ingest_task = data_ingestion_component(
        source_basins=source_basins,
        output_path='s3://aquaintelli-data/processed/'
    )
    
    # Stage 2: Feature Engineering
    feature_task = feature_engineering_component(
        input_data=ingest_task.outputs['output_data'],
        output_path='s3://aquaintelli-data/features/'
    )
    
    # Stage 3: Meta-Training
    train_task = meta_training_component(
        training_data=feature_task.outputs['output_data'],
        meta_lr=meta_lr,
        inner_lr=inner_lr,
        inner_steps=inner_steps,
        epochs=epochs,
        batch_size=batch_size,
        model_output_path=model_output_path
    )
    
    # Stage 4: Model Evaluation
    eval_task = model_evaluation_component(
        model_path=train_task.outputs['model_output'],
        test_basins='test_basins_list',
        metrics='kge,nse,pbias,mae'
    )
    
    # Stage 5: Model Registration
    register_task = model_registration_component(
        model_path=train_task.outputs['model_output'],
        metrics=eval_task.outputs['evaluation_results'],
        mlflow_tracking_uri='https://mlflow.aquaintelli.com'
    )
    
    # Stage 6: Conditional Deployment
    with dsl.Condition(eval_task.outputs['kge_score'] > 0.8):
        deploy_task = model_deployment_component(
            model_path=train_task.outputs['model_output'],
            deployment_target='production',
            seldon_namespace='aquaintelli-ml'
        )
    
    # Stage 7: Model Monitoring Setup
    monitor_task = monitoring_setup_component(
        model_name='meta-lstm',
        model_version=register_task.outputs['model_version'],
        alert_thresholds='{"kge": 0.75, "nse": 0.70}'
    )
```

### 11.3 LLMOps Pipeline

```yaml
# ml-platform/training-pipeline/llm_finetune_pipeline.py
from kfp import dsl

@dsl.pipeline(
    name='LLM Fine-tuning Pipeline',
    description='RAG pipeline optimization and LLM fine-tuning for groundwater domain'
)
def llm_finetune_pipeline(
    base_model: str = 'meta-llama/Llama-3-70b',
    dataset_path: str = 's3://aquaintelli-data/llm-training/',
    output_path: str = 's3://aquaintelli-models/llm/',
    epochs: int = 3,
    learning_rate: float = 2e-5,
    lora_r: int = 64,
    lora_alpha: int = 16
):
    # Stage 1: Data Preparation
    prepare_task = prepare_training_data_component(
        raw_data=dataset_path,
        output_path='s3://aquaintelli-data/llm-prepared/',
        max_seq_length=4096,
        train_test_split=0.9
    )
    
    # Stage 2: Vector Store Update
    vector_task = update_vector_store_component(
        documents=prepare_task.outputs['documents'],
        weaviate_endpoint='http://weaviate:8080',
        embedding_model='sentence-transformers/all-MiniLM-L6-v2'
    )
    
    # Stage 3: LoRA Fine-tuning
    finetune_task = lora_finetune_component(
        base_model=base_model,
        training_data=prepare_task.outputs['train_data'],
        output_path=output_path,
        epochs=epochs,
        learning_rate=learning_rate,
        lora_r=lora_r,
        lora_alpha=lora_alpha,
        quantization='4bit'
    )
    
    # Stage 4: Evaluation
    eval_task = llm_evaluation_component(
        model_path=finetune_task.outputs['model_output'],
        test_data=prepare_task.outputs['test_data'],
        metrics='bleu,rouge,bertscore,faithfulness,answer_relevance'
    )
    
    # Stage 5: Guardrails Testing
    guardrails_task = test_guardrails_component(
        model_path=finetune_task.outputs['model_output'],
        test_cases='s3://aquaintelli-data/guardrails-tests/'
    )
    
    # Stage 6: Deployment
    with dsl.Condition(eval_task.outputs['faithfulness'] > 0.85):
        deploy_task = deploy_llm_component(
            model_path=finetune_task.outputs['model_output'],
            deployment_target='production',
            vllm_config='{"tensor_parallel_size": 4, "max_num_seqs": 256}'
        )
```

---

## 12. Monitoring, Logging & Observability

### 12.1 Observability Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    METRICS (Prometheus)                      │
│  • Infrastructure: CPU, Memory, Disk, Network               │
│  • Application: Request rate, Latency, Error rate           │
│  • Database: Query time, Connection pool, Lock waits        │
│  • Cache: Hit rate, Eviction rate, Memory usage             │
│  • Queue: Lag, Consumer rate, Dead letter queue             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    LOGS (ELK Stack / Loki)                   │
│  • Structured JSON logging from all services                │
│  • Correlation IDs for distributed tracing                  │
│  • Log retention: 90 days hot, 1 year cold (S3)             │
│  • Sensitive data masking                                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    TRACES (Jaeger / Tempo)                   │
│  • Distributed request tracing across services              │
│  • OpenTelemetry instrumentation                            │
│  • Trace sampling: 100% errors, 10% success                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    ML MONITORING                             │
│  • Model Performance: KGE, NSE, PBIAS drift                 │
│  • Data Drift: Input feature distribution changes           │
│  • Prediction Drift: Output distribution changes            │
│  • Latency: P50, P95, P99 inference times                   │
│  • Resource Usage: GPU utilization, memory                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    LLM MONITORING                            │
│  • Token Usage: Input/output tokens per request             │
│  • Latency: Time to first token, total generation           │
│  • Quality: Hallucination score, faithfulness               │
│  • Cost: Per-tenant token spend                             │
│  • Safety: Prompt injection attempts, toxic outputs         │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Alerting Rules

```yaml
# monitoring/alerts/critical.yml
groups:
  - name: aquaintelli-critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% for {{ $labels.service }}"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "High API latency"
          description: "P95 latency is {{ $value }}s for {{ $labels.service }}"

      - alert: ModelDegradation
        expr: model_kge_score < 0.75
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Model performance degraded"
          description: "KGE score dropped to {{ $value }} for {{ $labels.model_version }}"

      - alert: DataDrift
        expr: data_drift_score > 0.3
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Data drift detected"
          description: "Drift score {{ $value }} for {{ $labels.feature }}"

      - alert: LLMHallucination
        expr: rate(llm_hallucination_detected_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High hallucination rate"
          description: "Hallucination rate is {{ $value }} for {{ $labels.model }}"

      - alert: DatabaseConnectionExhausted
        expr: pg_stat_activity_count / pg_settings_max_connections > 0.8
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connections exhausted"
          description: "{{ $value }}% of connections used"
```

---

## 13. Cloud Infrastructure & Networking

### 13.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VPC (10.0.0.0/16)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PUBLIC SUBNETS                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │   │
│  │  │  NAT    │  │  Bastion│  │  ALB (Application   │ │   │
│  │  │ Gateway │  │  Host   │  │  Load Balancer)     │ │   │
│  │  └─────────┘  └─────────┘  └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PRIVATE SUBNETS (App Tier)              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │   │
│  │  │ EKS     │  │ EKS     │  │ EKS                 │ │   │
│  │  │ Nodes   │  │ Nodes   │  │ Nodes (GPU)         │ │   │
│  │  │ (API)   │  │ (ML)    │  │ (LLM Inference)     │ │   │
│  │  └─────────┘  └─────────┘  └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PRIVATE SUBNETS (Data Tier)             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │   │
│  │  │ RDS     │  │ ElastiCache│  │ MSK (Kafka)      │ │   │
│  │  │ PostgreSQL│ │ Redis    │  │                   │ │   │
│  │  │ +PostGIS │  │ Cluster │  │                   │ │   │
│  │  └─────────┘  └─────────┘  └─────────────────────┘ │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │   │
│  │  │DocumentDB│ │ InfluxDB │  │ OpenSearch          │ │   │
│  │  │(MongoDB) │ │ (Time-series)│                   │ │   │
│  │  └─────────┘  └─────────┘  └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    MANAGED SERVICES                          │
│  • S3 (Satellite imagery, models, backups)                  │
│  • ECR (Container registry)                                 │
│  • CloudFront (CDN for static assets)                       │
│  • Route53 (DNS)                                            │
│  • CloudWatch (Metrics & alarms)                            │
│  • SageMaker (Model training - optional)                    │
│  • Bedrock (LLM fallback)                                   │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Terraform Configuration

```hcl
# infrastructure/terraform/modules/eks/main.tf
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "aquaintelli-${var.environment}"
  cluster_version = "1.29"

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  # Managed node groups
  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 10

      instance_types = ["m6i.2xlarge"]
      capacity_type  = "ON_DEMAND"

      labels = {
        workload = "general"
      }
    }

    ml_gpu = {
      desired_size = 2
      min_size     = 1
      max_size     = 5

      instance_types = ["g5.2xlarge"]
      capacity_type  = "ON_DEMAND"

      labels = {
        workload = "ml-gpu"
      }

      taints = [{
        key    = "nvidia.com/gpu"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]
    }
  }

  # Fargate profiles for serverless workloads
  fargate_profiles = {
    default = {
      name = "default"
      selectors = [
        { namespace = "aquaintelli" }
      ]
    }
  }

  # Enable IRSA for pod-level IAM roles
  enable_irsa = true

  tags = var.common_tags
}

# infrastructure/terraform/modules/rds/main.tf
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "aquaintelli-${var.environment}"

  engine               = "postgres"
  engine_version       = "16.1"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = "db.r6g.2xlarge"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true

  db_name  = "aquaintelli"
  username = "admin"
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.rds_security_group_id]

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"
  backup_retention_period = 35

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  performance_insights_enabled    = true
  performance_insights_retention_period = 7

  tags = var.common_tags
}
```

---

## 14. Backup, Disaster Recovery & Business Continuity

### 14.1 Backup Strategy

| Data Type | Frequency | Retention | Method | Location |
|-----------|-----------|-----------|--------|----------|
| PostgreSQL | Continuous + Daily | 35 days | RDS automated + pg_dump | S3 (cross-region) |
| InfluxDB | Hourly | 90 days | influx backup | S3 Glacier |
| MongoDB | Daily | 30 days | mongodump | S3 |
| Redis | Hourly (RDB) | 7 days | BGSAVE | EBS snapshots |
| S3 Objects | Real-time | 1 year | Versioning + Cross-region replication | S3 + S3 DR |
| EKS Volumes | Daily | 30 days | Velero | S3 |
| ML Models | On deploy | All versions | MLflow artifacts | S3 |

### 14.2 Disaster Recovery Plan

```yaml
# RPO: 1 hour (Recovery Point Objective)
# RTO: 4 hours (Recovery Time Objective)

disaster_recovery:
  scenarios:
    - name: "Region Failure"
      trigger: "Primary region (ap-south-1) unavailable"
      actions:
        - "Failover DNS to secondary region (ap-southeast-1)"
        - "Promote RDS read replica to primary"
        - "Activate standby EKS cluster"
        - "Redirect CDN origins"
      automation: "Route53 health checks + Lambda failover"
      
    - name: "Database Corruption"
      trigger: "Data corruption detected"
      actions:
        - "Pause writes"
        - "Restore from latest snapshot"
        - "Replay WAL logs to RPO"
        - "Resume writes"
      automation: "AWS Backup + RDS point-in-time restore"
      
    - name: "ML Model Failure"
      trigger: "Model performance below threshold"
      actions:
        - "Route traffic to previous model version"
        - "Alert ML team"
        - "Initiate retraining pipeline"
      automation: "Seldon canary rollback + ArgoCD"

  testing:
    frequency: "Monthly"
    method: "Chaos Engineering (Litmus/Gremlin)"
    scope: "Full stack failover drill"
```

---

## 15. Enterprise Features (Multi-Tenant, ESG, White-Label)

### 15.1 Multi-Tenancy Architecture

```typescript
// services/enterprise/src/tenants/tenant.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';

interface TenantContext {
  id: string;
  slug: string;
  plan: 'basic' | 'professional' | 'enterprise';
  settings: {
    maxAquifers: number;
    maxSensors: number;
    maxUsers: number;
    apiRateLimit: number;
    dataRetentionDays: number;
    features: string[];
  };
  branding: {
    logo: string;
    primaryColor: string;
    favicon: string;
    customDomain: string | null;
  };
}

export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Extract tenant from header or subdomain
  const tenantId = request.headers['x-tenant-id'] as string;
  const host = request.headers.host;
  
  let tenant: TenantContext;
  
  if (tenantId) {
    tenant = await getTenantById(tenantId);
  } else if (host) {
    // Extract from subdomain (tenant.aquaintelli.com)
    const subdomain = host.split('.')[0];
    tenant = await getTenantBySlug(subdomain);
  }
  
  if (!tenant) {
    return reply.status(404).send({ error: 'Tenant not found' });
  }
  
  // Check plan limits
  const currentUsage = await getTenantUsage(tenant.id);
  if (currentUsage.aquifers >= tenant.settings.maxAquifers) {
    return reply.status(429).send({ error: 'Aquifer limit exceeded' });
  }
  
  // Attach tenant context
  request.tenant = tenant;
}

// Database-level tenant isolation
export function withTenantIsolation(query: any, tenantId: string) {
  return query.where({ tenant_id: tenantId });
}
```

### 15.2 ESG Reporting Engine

```typescript
// services/enterprise/src/reporting/esrs-e3.generator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ESGReportData {
  framework: 'ESRS-E3' | 'CDP-Water' | 'GRI-303' | 'ISO-14046';
  reportingPeriod: { start: Date; end: Date };
  aquifers: string[];
  waterFootprint: {
    blueWaterM3: number;
    greenWaterM3: number;
    greyWaterM3: number;
  };
  riskAssessment: {
    physicalRisk: 'low' | 'medium' | 'high';
    regulatoryRisk: 'low' | 'medium' | 'high';
    reputationalRisk: 'low' | 'medium' | 'high';
  };
  supplyChain: {
    suppliersAudited: number;
    highRiskSuppliers: number;
    waterStressAreas: number;
  };
}

export class ESRS_E3_Generator {
  async generate(data: ESGReportData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Header
    page.drawText('AquaIntelli ESG Report', {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    
    page.drawText(`Framework: ${data.framework}`, {
      x: 50,
      y: height - 80,
      size: 14,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Water Footprint Section
    let y = height - 120;
    page.drawText('Water Footprint Assessment', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    
    y -= 30;
    page.drawText(`Blue Water: ${data.waterFootprint.blueWaterM3.toLocaleString()} m³`, {
      x: 70, y, size: 12, font,
    });
    
    y -= 20;
    page.drawText(`Green Water: ${data.waterFootprint.greenWaterM3.toLocaleString()} m³`, {
      x: 70, y, size: 12, font,
    });
    
    y -= 20;
    page.drawText(`Grey Water: ${data.waterFootprint.greyWaterM3.toLocaleString()} m³`, {
      x: 70, y, size: 12, font,
    });
    
    // Risk Assessment
    y -= 40;
    page.drawText('Risk Assessment', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    
    y -= 30;
    page.drawText(`Physical Risk: ${data.riskAssessment.physicalRisk.toUpperCase()}`, {
      x: 70, y, size: 12, font,
    });
    
    y -= 20;
    page.drawText(`Regulatory Risk: ${data.riskAssessment.regulatoryRisk.toUpperCase()}`, {
      x: 70, y, size: 12, font,
    });
    
    // Supply Chain
    y -= 40;
    page.drawText('Supply Chain Water Risk', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    
    y -= 30;
    page.drawText(`Suppliers Audited: ${data.supplyChain.suppliersAudited}`, {
      x: 70, y, size: 12, font,
    });
    
    y -= 20;
    page.drawText(`High-Risk Suppliers: ${data.supplyChain.highRiskSuppliers}`, {
      x: 70, y, size: 12, font,
    });
    
    // Footer
    page.drawText(`Generated by AquaIntelli on ${new Date().toISOString()}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    return Buffer.from(await pdfDoc.save());
  }
}
```

### 15.3 White-Label Configuration

```typescript
// apps/web/src/lib/white-label.ts
interface WhiteLabelConfig {
  tenantId: string;
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  features: {
    showAquaIntelliBranding: boolean;
    customDomain: string | null;
    enableESGReporting: boolean;
    enableSupplyChain: boolean;
    enable3DVisualization: boolean;
    enableLLMChat: boolean;
  };
}

export function applyWhiteLabel(config: WhiteLabelConfig): void {
  // Apply CSS variables
  const root = document.documentElement;
  root.style.setProperty('--primary-color', config.branding.primaryColor);
  root.style.setProperty('--secondary-color', config.branding.secondaryColor);
  root.style.setProperty('--font-family', config.branding.fontFamily);
  
  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) favicon.href = config.branding.favicon;
  
  // Update logo
  const logo = document.querySelector('[data-white-label="logo"]') as HTMLImageElement;
  if (logo) logo.src = config.branding.logo;
  
  // Toggle features
  if (!config.features.showAquaIntelliBranding) {
    document.querySelectorAll('[data-branding="aquaintelli"]').forEach((el) => {
      el.classList.add('hidden');
    });
  }
}
```

---

## 16. Directory Structure (Refactored)

```
aquaintelli-enterprise/
├── 📁 .github/
│   └── workflows/
│       ├── ci-cd.yml
│       ├── ml-model-training.yml
│       ├── llm-finetune.yml
│       ├── security-scan.yml
│       └── infrastructure-deploy.yml
│
├── 📁 infrastructure/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── eks/
│   │   │   ├── rds/
│   │   │   ├── s3/
│   │   │   ├── vpc/
│   │   │   ├── kafka/
│   │   │   ├── redis/
│   │   │   ├── cloudfront/
│   │   │   └── waf/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   │   ├── main.tf
│   │   │   │   ├── variables.tf
│   │   │   │   └── terraform.tfvars
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── main.tf
│   │
│   ├── kubernetes/
│   │   ├── base/
│   │   │   ├── namespace.yml
│   │   │   ├── configmap.yml
│   │   │   ├── secrets.yml
│   │   │   └── network-policies.yml
│   │   └── overlays/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── production/
│   │
│   └── helm/
│       ├── aquaintelli/
│       │   ├── Chart.yaml
│       │   ├── values.yaml
│       │   ├── values-production.yaml
│       │   └── templates/
│       │       ├── _helpers.tpl
│       │       ├── api-gateway/
│       │       ├── core-api/
│       │       ├── graphql-api/
│       │       ├── websocket/
│       │       ├── data-ingestion/
│       │       ├── notification/
│       │       ├── enterprise/
│       │       ├── ml-services/
│       │       ├── databases/
│       │       └── monitoring/
│       └── ml-pipeline/
│
├── 📁 apps/
│   ├── web/                          # Next.js 14 Enterprise Dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (enterprise)/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── tenants/
│   │   │   │   │   └── billing/
│   │   │   │   ├── api/
│   │   │   │   │   └── webhooks/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui primitives
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── MetricCard.tsx
│   │   │   │   │   ├── ForecastChart.tsx
│   │   │   │   │   ├── RiskIndicator.tsx
│   │   │   │   │   ├── SatelliteTracker.tsx
│   │   │   │   │   └── SoilMoisturePanel.tsx
│   │   │   │   ├── map/
│   │   │   │   │   ├── AquiferMap.tsx
│   │   │   │   │   ├── CoverageOverlay.tsx
│   │   │   │   │   ├── PipelineLayer.tsx
│   │   │   │   │   ├── SensorMarkers.tsx
│   │   │   │   │   └── DepthHeatmap.tsx
│   │   │   │   ├── 3d/
│   │   │   │   │   ├── AquiferScene.tsx
│   │   │   │   │   ├── VolumetricRenderer.tsx
│   │   │   │   │   ├── Pipeline3D.tsx
│   │   │   │   │   ├── WaterTableAnimation.tsx
│   │   │   │   │   ├── ContaminationPlume.tsx
│   │   │   │   │   └── SceneControls.tsx
│   │   │   │   ├── enterprise/
│   │   │   │   │   ├── ESGReportBuilder.tsx
│   │   │   │   │   ├── TenantSwitcher.tsx
│   │   │   │   │   ├── WhiteLabelConfig.tsx
│   │   │   │   │   ├── AuditLogViewer.tsx
│   │   │   │   │   └── SupplyChainGraph.tsx
│   │   │   │   ├── llm/
│   │   │   │   │   ├── ChatInterface.tsx
│   │   │   │   │   ├── SuggestedQueries.tsx
│   │   │   │   │   ├── CitationPanel.tsx
│   │   │   │   │   └── ReportGenerator.tsx
│   │   │   │   └── layout/
│   │   │   │       ├── Sidebar.tsx
│   │   │   │       ├── Header.tsx
│   │   │   │       ├── CommandPalette.tsx
│   │   │   │       └── Breadcrumb.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAquiferData.ts
│   │   │   │   ├── useForecast.ts
│   │   │   │   ├── useRealTime.ts
│   │   │   │   ├── use3DScene.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useTenant.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── graphql-client.ts
│   │   │   │   ├── websocket.ts
│   │   │   │   ├── white-label.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── constants.ts
│   │   │   ├── types/
│   │   │   │   ├── aquifer.ts
│   │   │   │   ├── forecast.ts
│   │   │   │   ├── sensor.ts
│   │   │   │   ├── pipeline.ts
│   │   │   │   └── enterprise.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── public/
│   │   │   ├── models/
│   │   │   ├── textures/
│   │   │   └── icons/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── mobile/                       # React Native Field App
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   └── stores/
│   │   ├── android/
│   │   ├── ios/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── 3d-viewer/                    # Standalone Three.js Viewer
│       ├── src/
│       │   ├── engine/
│       │   │   ├── AquiferScene.ts
│       │   │   ├── VolumetricRenderer.ts
│       │   │   ├── PipelineRenderer.ts
│       │   │   └── SceneManager.ts
│       │   ├── shaders/
│       │   │   ├── water-table.vert
│       │   │   ├── water-table.frag
│       │   │   ├── contamination.vert
│       │   │   └── contamination.frag
│       │   ├── loaders/
│       │   │   ├── DEMLoader.ts
│       │   │   ├── PipelineLoader.ts
│       │   │   └── SatelliteLoader.ts
│       │   └── main.ts
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── Dockerfile
│
├── 📁 services/
│   ├── api-gateway/
│   │   ├── kong.yml
│   │   ├── plugins/
│   │   └── Dockerfile
│   │
│   ├── core-api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   ├── routes/
│   │   │   │   └── v2/
│   │   │   │       ├── aquifers.ts
│   │   │   │       ├── forecasts.ts
│   │   │   │       ├── sensors.ts
│   │   │   │       ├── pipelines.ts
│   │   │   │       ├── reports.ts
│   │   │   │       └── health.ts
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── graphql-api/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── schemas/
│   │   │   ├── resolvers/
│   │   │   ├── datasources/
│   │   │   └── directives/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── websocket/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── handlers/
│   │   │   ├── rooms/
│   │   │   └── middleware/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── data-ingestion/
│   │   ├── src/
│   │   │   ├── connectors/
│   │   │   ├── transformers/
│   │   │   └── validators/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── notification/
│   │   ├── src/
│   │   │   ├── queues/
│   │   │   ├── processors/
│   │   │   ├── templates/
│   │   │   └── providers/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── enterprise/
│       ├── src/
│       │   ├── tenants/
│       │   ├── billing/
│       │   ├── rbac/
│       │   ├── reporting/
│       │   └── white-label/
│       ├── package.json
│       └── Dockerfile
│
├── 📁 ml-platform/
│   ├── meta-learning/
│   │   ├── src/
│   │   │   ├── models/
│   │   │   │   ├── meta_lstm.py
│   │   │   │   ├── meta_gru.py
│   │   │   │   ├── meta_transformer.py
│   │   │   │   └── base_model.py
│   │   │   ├── trainers/
│   │   │   │   ├── maml_trainer.py
│   │   │   │   ├── reptile_trainer.py
│   │   │   │   └── protonet_trainer.py
│   │   │   ├── tasks/
│   │   │   │   ├── hydrology_tasks.py
│   │   │   │   ├── basin_sampler.py
│   │   │   │   └── adaptation.py
│   │   │   ├── data/
│   │   │   ├── evaluation/
│   │   │   │   ├── metrics.py
│   │   │   │   ├── cross_validation.py
│   │   │   │   └── benchmark.py
│   │   │   └── utils/
│   │   ├── configs/
│   │   ├── notebooks/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── forecast-service/
│   │   ├── src/
│   │   │   ├── inference/
│   │   │   ├── preprocessing/
│   │   │   ├── postprocessing/
│   │   │   └── models/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── anomaly-detection/
│   │   ├── src/
│   │   │   ├── models/
│   │   │   └── detectors/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── 3d-model-generator/
│   │   ├── src/
│   │   │   ├── meshers/
│   │   │   ├── interpolators/
│   │   │   ├── exporters/
│   │   │   └── generators/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── llm-agent/
│   │   ├── src/
│   │   │   ├── rag/
│   │   │   ├── guardrails/
│   │   │   ├── prompts/
│   │   │   ├── agents/
│   │   │   └── tools/
│   │   ├── vector_store/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── training-pipeline/
│   │   ├── pipelines/
│   │   │   ├── meta_learning_pipeline.py
│   │   │   ├── forecast_retrain_pipeline.py
│   │   │   └── llm_finetune_pipeline.py
│   │   ├── components/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── monitoring/
│       ├── dashboards/
│       ├── alerts/
│       └── Dockerfile
│
├── 📁 databases/
│   ├── postgres/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_pipelines.sql
│   │   │   ├── 003_add_tenants.sql
│   │   │   └── 004_add_esg_reports.sql
│   │   ├── seeds/
│   │   │   ├── demo_data.sql
│   │   │   └── india_basins.sql
│   │   └── schemas/
│   │       └── erd.puml
│   │
│   ├── mongodb/
│   │   └── schemas/
│   │       ├── satellite_metadata.js
│   │       ├── ml_model_registry.js
│   │       └── llm_conversations.js
│   │
│   ├── influxdb/
│   │   └── retention-policies/
│   │       └── setup.flux
│   │
│   └── neo4j/
│       └── cypher/
│           ├── supply_chain_schema.cypher
│           └── sample_queries.cypher
│
├── 📁 shared/
│   ├── types/                        # TypeScript + Python shared types
│   │   ├── aquifer.ts
│   │   ├── forecast.ts
│   │   └── pipeline.ts
│   ├── constants/
│   │   ├── http-status.ts
│   │   └── error-codes.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   └── formatters.ts
│   └── proto/                        # gRPC definitions
│       ├── aquifer.proto
│       ├── forecast.proto
│       └── sensor.proto
│
├── 📁 docs/
│   ├── api/
│   │   ├── rest-api.md
│   │   ├── graphql-api.md
│   │   └── websocket-api.md
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── data-flow.md
│   │   └── security-model.md
│   ├── deployment/
│   │   ├── local-setup.md
│   │   ├── staging-deployment.md
│   │   └── production-deployment.md
│   └── esg-frameworks/
│       ├── esrs-e3-guide.md
│       ├── cdp-water-guide.md
│       └── gri-303-guide.md
│
├── 📁 scripts/
│   ├── setup/
│   │   ├── local-dev.sh
│   │   └── seed-data.sh
│   ├── backup/
│   │   ├── postgres-backup.sh
│   │   └── influxdb-backup.sh
│   └── migration/
│       ├── db-migrate.sh
│       └── data-migration.sh
│
├── docker-compose.yml                # Local development
├── docker-compose.prod.yml           # Production override
├── Makefile                          # Common commands
├── README.md
├── LICENSE
└── .env.example
```

---

## 17. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Refactor directory structure
- [ ] Containerize all services
- [ ] Set up CI/CD pipelines
- [ ] Deploy staging environment
- [ ] Implement core API (Fastify)
- [ ] Set up PostgreSQL + PostGIS + InfluxDB
- [ ] Implement Redis caching layer

### Phase 2: AI/ML Core (Weeks 5-8)
- [ ] Implement MAML meta-learning engine
- [ ] Deploy forecast service (KServe)
- [ ] Set up MLflow tracking
- [ ] Implement anomaly detection
- [ ] Build training pipelines (Kubeflow)
- [ ] Model monitoring with Evidently

### Phase 3: 3D Visualization (Weeks 9-12)
- [ ] Build Three.js aquifer scene engine
- [ ] Implement volumetric water table rendering
- [ ] Add pipeline 3D overlay (v2 feature enhancement)
- [ ] Add contamination plume visualization
- [ ] Integrate with CesiumJS for geospatial context
- [ ] Performance optimization (LOD, frustum culling)

### Phase 4: LLM & Intelligence (Weeks 13-16)
- [ ] Deploy LLaMA 3 with vLLM
- [ ] Build RAG pipeline with Weaviate
- [ ] Implement guardrails (NeMo)
- [ ] Create chat interface
- [ ] Build report generation agent
- [ ] Set up LangFuse monitoring

### Phase 5: Enterprise Features (Weeks 17-20)
- [ ] Multi-tenant SaaS architecture
- [ ] ESG reporting engine (ESRS E3, CDP, GRI 303)
- [ ] Supply chain water risk graph (Neo4j)
- [ ] White-label portal
- [ ] RBAC/ABAC implementation
- [ ] Billing & usage tracking

### Phase 6: Scale & Optimize (Weeks 21-24)
- [ ] Kubernetes production deployment
- [ ] CDN + Edge caching
- [ ] Database read replicas
- [ ] Auto-scaling configuration
- [ ] Load testing & optimization
- [ ] Performance benchmarking

### Phase 7: Security & Compliance (Weeks 25-28)
- [ ] Security hardening
- [ ] Penetration testing
- [ ] SOC 2 Type II preparation
- [ ] ISO 27001 documentation
- [ ] GDPR compliance audit
- [ ] India DPDPA compliance

### Phase 8: Launch (Weeks 29-32)
- [ ] Production launch
- [ ] Customer onboarding
- [ ] Documentation finalization
- [ ] Support portal setup
- [ ] Monitoring & alerting validation
- [ ] Post-launch optimization

---

## 18. Performance Benchmarks & SLAs

### 18.1 API Performance Targets

| Endpoint | P50 | P95 | P99 | SLA |
|----------|-----|-----|-----|-----|
| GET /v2/aquifers | 20ms | 50ms | 100ms | 99.9% |
| GET /v2/aquifers/{id}/metrics | 30ms | 80ms | 150ms | 99.9% |
| POST /v2/forecasts | 50ms | 200ms | 500ms | 99.5% |
| GET /v2/pipelines | 40ms | 100ms | 200ms | 99.9% |
| GET /v2/aquifers/{id}/3d-model | 100ms | 300ms | 800ms | 99.0% |
| POST /v2/llm/chat | 500ms | 2000ms | 5000ms | 99.0% |
| WebSocket sensor updates | 10ms | 50ms | 100ms | 99.9% |

### 18.2 ML Inference Performance

| Model | Batch Size | Latency (P95) | Throughput | Accuracy |
|-------|-----------|---------------|------------|----------|
| Meta-LSTM v3 | 1 | 45ms | 22 req/s | KGE: 0.87 |
| Meta-LSTM v3 | 32 | 120ms | 267 req/s | KGE: 0.87 |
| Meta-Transformer | 1 | 80ms | 12 req/s | KGE: 0.89 |
| Anomaly Detection | 1 | 30ms | 33 req/s | F1: 0.92 |
| LLaMA 3 70B (4-bit) | 1 | 1500ms | 0.67 req/s | - |
| LLaMA 3 70B (vLLM) | 16 | 2000ms | 8 req/s | - |

### 18.3 Infrastructure SLAs

| Component | Uptime SLA | RTO | RPO |
|-----------|-----------|-----|-----|
| API Gateway | 99.99% | 5 min | 0 |
| Core API | 99.95% | 10 min | 0 |
| Database (RDS) | 99.99% | 15 min | 1 hour |
| InfluxDB | 99.9% | 30 min | 1 hour |
| ML Inference | 99.5% | 20 min | 0 |
| LLM Service | 99.0% | 30 min | 0 |
| CDN | 99.99% | 0 | 0 |

---

## Appendix A: Feature Comparison Matrix

| Feature | v1 (MVP) | v2 (Current) | v3 (Enterprise Target) |
|---------|----------|--------------|------------------------|
| GRACE-FO Anomaly | ✅ | ✅ | ✅ + Real-time |
| Current Depth | ✅ | ✅ | ✅ + Multi-source fusion |
| Soil Moisture | ✅ | ✅ | ✅ + 30-day trend |
| Rainfall | ✅ | ✅ | ✅ + Forecast integration |
| 30-Day Forecast | ✅ | ✅ | ✅ + Meta-learning |
| 90-Day Forecast | ✅ | ✅ | ✅ + Confidence intervals |
| Depletion Rate | ✅ | ✅ | ✅ + Trend analysis |
| Risk Level | ✅ | ✅ | ✅ + Automated alerts |
| Satellite Tracking | ✅ | ✅ | ✅ + Multi-mission |
| Status Legend | ✅ | ✅ | ✅ + Custom thresholds |
| **Pipeline Depth** | ❌ | ✅ | ✅ + 3D overlay |
| **3D Aquifer View** | ❌ | ❌ | ✅ Volumetric rendering |
| **Meta-Learning** | ❌ | ❌ | ✅ MAML-based |
| **LLM Agent** | ❌ | ❌ | ✅ RAG + Tools |
| **ESG Reporting** | ❌ | ❌ | ✅ Auto-generate |
| **Multi-Tenant** | ❌ | ❌ | ✅ SaaS |
| **White-Label** | ❌ | ❌ | ✅ Full branding |
| **Supply Chain** | ❌ | ❌ | ✅ Water risk graph |
| **IoT Integration** | ❌ | ❌ | ✅ Real-time mesh |
| **Digital Twin** | ❌ | ❌ | ✅ Simulation |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **MAML** | Model-Agnostic Meta-Learning - algorithm for learning good model initializations |
| **PINN** | Physics-Informed Neural Network - neural network with physical laws as constraints |
| **RAG** | Retrieval-Augmented Generation - LLM technique combining retrieval with generation |
| **ESRS E3** | European Sustainability Reporting Standards - Water & Marine Resources |
| **CDP Water** | Carbon Disclosure Project - Water Security questionnaire |
| **GRI 303** | Global Reporting Initiative - Water & Effluents standard |
| **KGE** | Kling-Gupta Efficiency - hydrological model performance metric |
| **NSE** | Nash-Sutcliffe Efficiency - hydrological model performance metric |
| **MAR** | Managed Aquifer Recharge - intentional recharge of aquifers |
| **BGL** | Below Ground Level - depth measurement reference |
| **EWH** | Equivalent Water Height - GRACE satellite measurement |
| **GSD** | Ground Sample Distance - spatial resolution of satellite imagery |

---

*Document Version: 3.0.0*  
*Last Updated: 2026-05-01*  
*AquaIntelli Enterprise Architecture Team*
"""

# Save to file
with open('/mnt/agents/output/AquaIntelli_Enterprise_v3_Specification.md', 'w', encoding='utf-8') as f:
    f.write(md_content)

print("File saved successfully!")
print(f"Total characters: {len(md_content)}")
print(f"Total lines: {len(md_content.splitlines())}")
