-- AquaIntelli Enterprise v3 — PostgreSQL + PostGIS Init
-- Runs automatically on first docker-compose up

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tenants (Multi-tenancy) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'basic',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default tenant
INSERT INTO tenants (id, name, slug, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'AquaIntelli Default', 'default', 'enterprise', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ── Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ── Aquifers ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aquifers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    geometry GEOMETRY(POLYGON, 4326),
    centroid GEOMETRY(POINT, 4326),
    area_km2 DECIMAL(10, 2),
    max_depth DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'operational',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aquifers_geometry ON aquifers USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_aquifers_tenant ON aquifers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aquifers_status ON aquifers(status);

-- Default aquifer (Hyderabad)
INSERT INTO aquifers (tenant_id, name, code, centroid, area_km2, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Hyderabad Aquifer System',
    'HYD-AP-001',
    ST_SetSRID(ST_MakePoint(78.487, 17.385), 4326),
    847.0,
    'warning'
) ON CONFLICT (code) DO NOTHING;

-- ── Sensors / Monitoring Wells ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aquifer_id UUID REFERENCES aquifers(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location GEOMETRY(POINT, 4326),
    elevation DECIMAL(10, 2),
    depth DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sensors_aquifer ON sensors(aquifer_id);

-- ── Pipelines (v2 Feature) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    aquifer_id UUID REFERENCES aquifers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    geometry GEOMETRY(LINESTRING, 4326),
    diameter_mm INTEGER,
    depth_min_m DECIMAL(5, 2),
    depth_max_m DECIMAL(5, 2),
    material VARCHAR(100),
    installation_year INTEGER,
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
    status VARCHAR(50) DEFAULT 'operational',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipelines_geometry ON pipelines USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_pipelines_aquifer ON pipelines(aquifer_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_type ON pipelines(type);

-- ── ESG Reports ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS esg_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    framework VARCHAR(50) NOT NULL,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    water_footprint JSONB,
    risk_assessment JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    audit_trail JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_tenant ON esg_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_esg_framework ON esg_reports(framework);

-- ── Audit Logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ── Supply Chain Graph (mirror) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supply_chain_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location GEOMETRY(POINT, 4326),
    water_risk_score DECIMAL(5, 2),
    blue_water_m3 DECIMAL(15, 2),
    green_water_m3 DECIMAL(15, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supply_chain_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    source_id UUID REFERENCES supply_chain_nodes(id),
    target_id UUID REFERENCES supply_chain_nodes(id),
    relationship_type VARCHAR(100) NOT NULL,
    water_volume_m3 DECIMAL(15, 2),
    metadata JSONB DEFAULT '{}'
);
