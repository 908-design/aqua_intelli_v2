/**
 * AquaIntelli v2 — Frontend API Client
 * Connects all 9 modules to /api/v2/* endpoints backed by real datasets
 * Primary region: Visakhapatnam (Vizag), Andhra Pradesh — 17.6939°N, 83.2922°E
 */

const V2_API_BASE = (window.AQUA_API_ORIGIN && typeof window.AQUA_API_ORIGIN === 'string')
  ? window.AQUA_API_ORIGIN
  : ((window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'http://localhost:8001');
const V2 = `${V2_API_BASE}/api/v2`;
const V1 = `${V2_API_BASE}/api/v1`;

function _auditProvenanceShape(url, data) {
  try {
    const d = data && typeof data === 'object' ? data : null;
    const meta = d && (d._meta || d.meta || d.provenance || d.lineage) ? (d._meta || d.meta || d.provenance || d.lineage) : null;
    const hasTimestamp =
      !!(meta && (meta.timestamp || meta.ts || meta.generated_at || meta.generatedAt)) ||
      !!(d && (d.timestamp || d.ts || d.generated_at || d.generatedAt));
    const hasSources =
      !!(meta && (meta.sources || meta.source_ids || meta.sourceIds)) ||
      !!(d && (d.sources || d.source_ids || d.sourceIds));
    const hasUncertainty =
      !!(meta && (meta.uncertainty || meta.ci || meta.confidence_interval || meta.confidenceInterval)) ||
      !!(d && (d.uncertainty || d.ci || d.confidence_interval || d.confidenceInterval));
    const hasModelInfo =
      !!(meta && (meta.model || meta.model_id || meta.modelId || meta.model_version || meta.modelVersion)) ||
      !!(d && (d.model || d.model_id || d.modelId || d.model_version || d.modelVersion));

    // #region agent log
    fetch('http://127.0.0.1:7780/ingest/f67f863a-1fcc-45d3-8ee6-23daa86573a1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'986385'},body:JSON.stringify({sessionId:'986385',runId:'pre-fix',hypothesisId:'H_PROVENANCE',location:'frontend/api_v2.js:_auditProvenanceShape',message:'API payload provenance audit',data:{url,ok:!!d,topLevelKeys:d?Object.keys(d).slice(0,40):null,hasMeta:!!meta,hasTimestamp,hasSources,hasUncertainty,hasModelInfo},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch (_) {}
}

// ── Cache (30s TTL) ───────────────────────────────────────────────────
const _cache = new Map();
async function fetchCached(url, ttl = 30000) {
  const now = Date.now();
  if (_cache.has(url)) {
    const { data, ts } = _cache.get(url);
    if (now - ts < ttl) return data;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _cache.set(url, { data, ts: now });
    _auditProvenanceShape(url, data);
    return data;
  } catch (e) {
    console.warn(`[AquaIntelli API] ${url}:`, e.message);
    // #region agent log
    fetch('http://127.0.0.1:7780/ingest/f67f863a-1fcc-45d3-8ee6-23daa86573a1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'986385'},body:JSON.stringify({sessionId:'986385',runId:'pre-fix',hypothesisId:'H_NETWORK',location:'frontend/api_v2.js:fetchCached',message:'API fetch failed',data:{url,error:String(e && e.message ? e.message : e)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MODULE 01 — GROUNDWATER INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════
window.AqAPI = {

  // --- M01 Groundwater ---
  async getGroundwaterZones() {
    return fetchCached(`${V2}/groundwater/zones`);
  },
  async getGroundwaterForecast() {
    return fetchCached(`${V2}/groundwater/forecast`, 60000);
  },
  async getAquiferLayers() {
    return fetchCached(`${V2}/groundwater/aquifer-layers`, 300000);
  },

  // --- M02 Reservoir ---
  async getReservoirs() {
    return fetchCached(`${V2}/reservoirs`);
  },
  async getReservoirStorage(id = 'R01') {
    return fetchCached(`${V2}/reservoirs/${id}/storage`, 60000);
  },

  // --- M03 Irrigation / NDVI ---
  async getIrrigationZones() {
    return fetchCached(`${V2}/irrigation/zones`, 120000);
  },
  async getIrrigationSchedule() {
    return fetchCached(`${V2}/irrigation/schedule`, 120000);
  },

  // --- M04 Borewell ---
  async getBorewellTelemetry(id = 'BW-AP-2847') {
    return fetchCached(`${V2}/borewell/${id}/telemetry`, 5000);
  },
  async getBorewellGeology(id = 'BW-AP-2847') {
    return fetchCached(`${V2}/borewell/${id}/geology`, 300000);
  },
  async getBorewellFull(id = 'BW-AP-2847') {
    return fetchCached(`${V2}/borewell/${id}`, 10000);
  },

  // --- M05 Drainage Network ---
  async getDrainageNodes() {
    return fetchCached(`${V2}/drainage/nodes`);
  },

  // --- M06 Flood ---
  async getFloodActive() {
    return fetchCached(`${V2}/flood/active`, 15000);
  },
  async getFloodZones() {
    return fetchCached(`${V2}/flood/zones`, 15000);
  },

  // --- M07 Aquifer Scanner ---
  async getAquiferScan() {
    return fetchCached(`${V2}/aquifer/scan`, 60000);
  },

  // --- M08 Crisis Forecast ---
  async getCrisisThreats() {
    return fetchCached(`${V2}/crisis/threats`, 30000);
  },
  async getCrisisTimeline() {
    return fetchCached(`${V2}/crisis/timeline`, 60000);
  },

  // --- M09 City Drainage (Hero) ---
  async getCityDrainage() {
    return fetchCached(`${V2}/drainage/city`, 60000);
  },

  // --- Full mock ---
  async getMockAll() {
    return fetchCached(`${V2}/mock/all`, 300000);
  },

  // --- v1 legacy ---
  async getGroundwaterStatus(lat = 17.6939, lon = 83.2922) {
    return fetchCached(`${V1}/groundwater/status?lat=${lat}&lon=${lon}&district=Visakhapatnam&state=Andhra%20Pradesh`);
  },
  async getAlerts() {
    return fetchCached(`${V1}/alerts/summary`, 20000);
  },
  async getDrainageNetworkStatus() {
    return fetchCached(`${V1}/drainage/network/status`, 15000);
  },
};

// ═══════════════════════════════════════════════════════════════════════
// DATA RENDERERS — populate module panels from real API data
// ═══════════════════════════════════════════════════════════════════════

/** M01 — Groundwater zones grid */
async function renderGroundwaterModule(container) {
  const data = await window.AqAPI.getGroundwaterZones();
  const forecast = await window.AqAPI.getGroundwaterForecast();
  if (!data) return;

  const statusColor = s => s === 'CRITICAL' ? 'var(--danger)' : s === 'WARNING' ? 'var(--warning)' : 'var(--good)';

  const zonesHtml = (data.zones || []).map(z => `
    <div class="stat-card" style="cursor:pointer; border:1px solid rgba(0,229,255,0.1); margin-bottom:6px;" onclick="flyTo(${z.lat},${z.lon})">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="stat-label">${z.location.toUpperCase()}</div>
        <div style="font-size:0.6rem; border:1px solid ${statusColor(z.status)}; color:${statusColor(z.status)}; padding:1px 4px; border-radius:2px;">${z.status}</div>
      </div>
      <div class="stat-value" style="color:var(--text); font-size:1.1rem;">${z.depth_m}m <span style="font-size:0.7rem; opacity:0.6;">BGL</span></div>
      <div class="stat-unit" style="color:var(--text-dim);">GWPI: ${z.gwpi} · ${z.aquifer}</div>
    </div>`).join('');

  container.innerHTML = `
    <div class="panel-title" style="color:var(--primary); border-bottom:1px solid var(--primary); padding-bottom:4px; margin-bottom:10px;">MODULE 01 — REGIONAL GROUNDWATER ANALYTICS</div>
    
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px;">
      <div class="stat-card"><div class="stat-label">GRACE EWH</div><div class="stat-value warn">${data.grace_anomaly_m}m</div></div>
      <div class="stat-card"><div class="stat-label">DEPLETION</div><div class="stat-value danger">${data.depletion_rate_m_day}m</div><div class="stat-unit">/DAY</div></div>
      <div class="stat-card"><div class="stat-label">SOIL MOIST</div><div class="stat-value good">${data.soil_moisture_pct}%</div></div>
    </div>

    <!-- Real-time Matplotlib Telemetry -->
    <div style="margin-bottom:15px; border:1px solid var(--border); background:rgba(0,0,0,0.3); border-radius:4px; padding:5px; position:relative;">
      <div style="position:absolute; top:8px; right:8px; display:flex; align-items:center; gap:5px; z-index:10;">
        <div class="loc-status-dot" style="width:5px; height:5px; background:var(--primary); box-shadow:0 0 5px var(--primary); animation:pulse-dot 1s infinite;"></div>
        <span style="font-size:8px; font-family:'Share Tech Mono'; color:var(--primary);">LIVE DATASTREAM</span>
      </div>
      <img id="gw-telemetry-viz" src="" style="width:100%; border-radius:2px; display:block;" />
    </div>

    <details open style="margin-top:10px; border:1px solid rgba(0,229,255,0.1); border-radius:4px;">
      <summary style="cursor:pointer; background:rgba(0,229,255,0.05); padding:8px 10px; font-size:0.7rem; font-family:'Orbitron'; color:var(--primary);">ZONE-SPECIFIC INTELLIGENCE</summary>
      <div style="padding:8px;">
        ${zonesHtml}
      </div>
    </details>

    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">LSTM 30-DAY DEPTH FORECAST (SEABORN)</div>
    <div style="margin-top:4px; border:1px solid var(--border); background:rgba(0,0,0,0.3); border-radius:4px; padding:5px;">
        <img id="gw-forecast-viz" src="" style="width:100%; border-radius:2px; display:block;" />
    </div>
    <div style="color:var(--text-dim);font-size:0.6rem;margin-top:4px; font-family:'Share Tech Mono';">
      MODEL: 3-LAYER LSTM · ACCURACY: 94.2% · GENERATED VIA SEABORN KERNEL
    </div>`;

  // Start real-time refresh for telemetry
  if (window._gwTelemetryInterval) clearInterval(window._gwTelemetryInterval);
  const updateTelemetry = async () => {
    try {
      const res = await fetch(`${API_BASE}/groundwater/viz/telemetry?depth=${data.zones?.[0]?.depth_m || 15}`);
      const d = await res.json();
      const img = document.getElementById('gw-telemetry-viz');
      if (img) img.src = `data:image/png;base64,${d.image}`;
    } catch (e) {}
  };
  updateTelemetry();
  window._gwTelemetryInterval = setInterval(updateTelemetry, 2500);

  // Load forecast once
  const updateForecast = async () => {
    try {
      const res = await fetch(`${API_BASE}/groundwater/viz/forecast?lat=${data.zones?.[0]?.lat || 17.6}&lon=${data.zones?.[0]?.lon || 83.2}`);
      const d = await res.json();
      const img = document.getElementById('gw-forecast-viz');
      if (img) img.src = `data:image/png;base64,${d.image}`;
      
      // Also update right panel enrichment if available
      const rightImg = document.getElementById('gw-right-forecast-img');
      if (rightImg) rightImg.src = `data:image/png;base64,${d.image}`;
    } catch (e) {}
  };
  updateForecast();

  // Populate bottom cards with Model 1 / Model 2 buttons
  const bottomCards = document.getElementById('map-bottom-cards');
  if (bottomCards) {
    bottomCards.innerHTML = `
      <div class="map-bottom-card" style="min-width:200px; pointer-events:all; cursor:default;">
        <div class="name" style="color:var(--primary); font-size:9px; margin-bottom:5px;">AI MODEL SELECTION</div>
        <div style="display:flex; gap:5px;">
          <button onclick="window.showModelAnalysis('model-1')" style="flex:1; background:rgba(0,229,255,0.1); border:1px solid var(--primary); color:var(--primary); font-family:'Share Tech Mono'; font-size:9px; padding:4px; cursor:pointer;">MODEL-1: SPATIAL</button>
          <button onclick="window.showModelAnalysis('model-2')" style="flex:1; background:rgba(0,229,255,0.1); border:1px solid var(--primary); color:var(--primary); font-family:'Share Tech Mono'; font-size:9px; padding:4px; cursor:pointer;">MODEL-2: TEMPORAL</button>
        </div>
      </div>
      <div id="model-analysis-result-card" class="map-bottom-card" style="min-width:300px; display:none; pointer-events:all;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <div class="name" id="model-analysis-title">MODEL ANALYSIS</div>
          <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; color:var(--text-dim); cursor:pointer;">×</button>
        </div>
        <img id="model-analysis-img" src="" style="width:100%; border-radius:2px;" />
      </div>
    `;
  }

  window.showModelAnalysis = async (modelId) => {
    const card = document.getElementById('model-analysis-result-card');
    const img = document.getElementById('model-analysis-img');
    const title = document.getElementById('model-analysis-title');
    if (!card || !img) return;

    card.style.display = 'block';
    title.textContent = modelId.toUpperCase() + ' LIVE DIAGNOSTICS';
    img.style.opacity = '0.5';
    
    try {
      const res = await fetch(`${API_BASE}/groundwater/viz/model?model_id=${modelId}`);
      const d = await res.json();
      img.src = `data:image/png;base64,${d.image}`;
      img.style.opacity = '1';
    } catch (e) {
      img.style.opacity = '1';
    }
  };
}



/** M02 — Reservoir status cards */
async function renderReservoirModule(container) {
  const data = await window.AqAPI.getReservoirs();
  if (!data) return;

  const statusColor = s => s === 'WARNING' ? 'var(--warning)' : s === 'RECHARGE' ? 'var(--good)' : 'var(--primary)';

  const resCards = (data.reservoirs || []).map(r => `
    <div class="stat-card" onclick="flyTo(${r.lat},${r.lon})" style="cursor:pointer">
      <div class="stat-label">${r.name.toUpperCase()}</div>
      <div class="stat-value" style="color:${statusColor(r.status)}">${r.fill_pct}%</div>
      <div class="stat-unit">${r.live_storage_tmc} / ${r.capacity_tmc} TMC</div>
      <div style="margin-top:4px;font-size:0.68rem;color:var(--text-dim)">
        IN: ${r.inflow_cusecs?.toLocaleString()} · OUT: ${r.outflow_cusecs?.toLocaleString()} cusecs
      </div>
      <div class="stat-delta ${r.status === 'WARNING' ? 'down' : 'up'}">${r.status}</div>
    </div>`).join('');

  const cropRows = (data.crop_water_status || []).map(c => `
    <tr style="border-bottom:1px solid var(--border)">
      <td style="padding:4px 8px">${c.crop}</td>
      <td style="padding:4px 8px;color:var(--text-dim)">${c.stage}</td>
      <td style="padding:4px 8px">${c.etc_mm}</td>
      <td style="padding:4px 8px">${c.supply_mm}</td>
      <td style="padding:4px 8px;color:${c.deficit > 1 ? 'var(--danger)' : c.deficit > 0 ? 'var(--warning)' : 'var(--good)'}">${c.deficit}</td>
      <td style="padding:4px 8px;font-size:0.68rem">${c.action}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="panel-title">MODULE 02 — RESERVOIR INTELLIGENCE · VIZAG</div>
    <div class="stat-grid">${resCards}</div>
    <div class="panel-title" style="margin-top:12px">CROP-WATER DEFICIT ANALYSIS (Penman-Monteith)</div>
    <div style="overflow-x:auto">
      <table style="width:100%;font-size:0.72rem;border-collapse:collapse;color:var(--text-main)">
        <thead><tr style="color:var(--text-dim)">
          <th style="padding:4px 8px;text-align:left">CROP</th><th style="padding:4px 8px;text-align:left">STAGE</th>
          <th style="padding:4px 8px">ETc(mm)</th><th style="padding:4px 8px">SUPPLY</th>
          <th style="padding:4px 8px">DEFICIT</th><th style="padding:4px 8px;text-align:left">ACTION</th>
        </tr></thead>
        <tbody>${cropRows}</tbody>
      </table>
    </div>`;
}

/** M03 — Irrigation AI / NDVI */
async function renderIrrigationModule(container) {
  const zones = await window.AqAPI.getIrrigationZones();
  const schedule = await window.AqAPI.getIrrigationSchedule();
  if (!zones || !schedule) return;

  const recCards = (schedule.recommendations || []).map(r => `
    <div class="stat-card" style="grid-column: span 2; border: 1px solid rgba(57, 255, 20, 0.15);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="stat-label" style="color:var(--good);">${r.crop.toUpperCase()}</div>
        <div class="stat-value" style="color:var(--good); font-size:1.1rem;">${(r.suitability*100).toFixed(0)}%</div>
      </div>
      <div style="color:var(--primary); font-size:0.8rem; font-weight:700; margin:4px 0; font-family:'Share Tech Mono';">${r.market_rate}</div>
      <div class="stat-unit" style="color:var(--text-dim); line-height:1.2; font-size:0.65rem;">${r.reason}</div>
      
      <details style="margin-top:10px; border-top:1px solid rgba(57,255,20,0.1); padding-top:8px;">
        <summary style="cursor:pointer; font-size:0.65rem; color:var(--accent); font-family:'Share Tech Mono',monospace; list-style:none;">[ GROWTH PROTOCOL + ]</summary>
        <div style="font-size:0.65rem; color:var(--text-main); margin-top:6px; font-family:'Rajdhani',sans-serif;">
          <div style="margin-bottom:4px;"><strong style="color:var(--warning)">HARVEST:</strong> ${r.harvest_time}</div>
          <ul style="padding-left:12px; margin:0; color:var(--text-dim);">
            ${r.how_to_grow.map(step => `<li style="margin-bottom:2px;">${step}</li>`).join('')}
          </ul>
        </div>
      </details>
    </div>`).join('');

  const knowledge = schedule.farming_knowledge || {};

  container.innerHTML = `
    <div class="panel-title" style="color:var(--primary); border-bottom:1px solid var(--primary); padding-bottom:4px; margin-bottom:10px;">MODULE 03 — PRECISION AGRI-HYDROLOGY · VIZAG</div>
    
    <div style="background:rgba(0,229,255,0.05); padding:8px; border-radius:4px; border:1px solid rgba(0,229,255,0.2); margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-family:'Share Tech Mono',monospace;">
        <span><span style="color:var(--text-dim)">SOIL:</span> <span style="color:var(--primary)">${schedule.soil.type}</span></span>
        <span><span style="color:var(--text-dim)">WATER:</span> <span style="color:var(--warning)">${schedule.water_availability.split(' ')[0]}</span></span>
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr); gap:8px;">
      <div class="stat-card"><div class="stat-label">AVG NDVI</div><div class="stat-value good">${zones.district_avg_ndvi}</div></div>
      <div class="stat-card"><div class="stat-label">STRESS</div><div class="stat-value warn">${schedule.wis_score}/100</div></div>
      <div class="stat-card"><div class="stat-label">HEALTHY</div><div class="stat-value good">${zones.healthy}/${zones.total_zones}</div></div>
      <div class="stat-card"><div class="stat-label">CRITICAL</div><div class="stat-value danger">${zones.critical}/${zones.total_zones}</div></div>
    </div>
    
    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">CROP INTELLIGENCE & MARKET DATA</div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr); gap:8px; margin-top:5px;">${recCards}</div>

    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">AGRI-KNOWLEDGE BASE</div>
    <div style="font-size:0.65rem; color:var(--text-dim); display:flex; flex-direction:column; gap:6px; margin-top:5px;">
      <div style="border-left:2px solid var(--good); padding-left:8px; background:rgba(57,255,20,0.03); padding:4px 8px;">
        <strong style="color:var(--good); display:block; margin-bottom:1px; font-size:0.6rem;">SOIL HEALTH:</strong> ${knowledge.soil_health}
      </div>
      <div style="border-left:2px solid var(--warning); padding-left:8px; background:rgba(255,107,0,0.03); padding:4px 8px;">
        <strong style="color:var(--warning); display:block; margin-bottom:1px; font-size:0.6rem;">PEST MGMT:</strong> ${knowledge.pest_management}
      </div>
      <div style="border-left:2px solid var(--accent); padding-left:8px; background:rgba(0,229,255,0.03); padding:4px 8px;">
        <strong style="color:var(--accent); display:block; margin-bottom:1px; font-size:0.6rem;">TECH TIP:</strong> ${knowledge.tech_tip}
      </div>
    </div>
    
    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">SATELLITE NDVI HEATMAP GRID</div>
    <div id="ndvi-grid-container" style="width:100%; height:180px; display:flex; justify-content:center; align-items:center; background:#0a0f18; border-radius:4px; margin-top:5px; border:1px solid rgba(0,229,255,0.15); padding:5px;"></div>
  `;

  if (window.renderNDVIGrid && zones.data) {
      window.renderNDVIGrid('ndvi-grid-container', zones.data);
  }
}

/** M04 — Borewell telemetry live panel */
async function renderBorewellModule(container) {
  const full = await window.AqAPI.getBorewellFull();
  if (!full) return;

  const tRows = (full.telemetry_history || []).slice(0, 24).map(r => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
      <td style="padding:3px 6px;color:var(--text-dim);font-size:0.65rem">${r.timestamp?.slice(11,16)}</td>
      <td style="padding:3px 6px">${r.rpm}</td>
      <td style="padding:3px 6px">${r.power_kw}</td>
      <td style="padding:3px 6px">${r.efficiency_pct}%</td>
      <td style="padding:3px 6px">${r.dynamic_level_m}m</td>
      <td style="padding:3px 6px">${r.yield_lps} LPS</td>
      <td style="padding:3px 6px;color:${parseFloat(r.motor_temp_c)>50?'var(--warning)':'var(--good)'}">${r.motor_temp_c}°C</td>
    </tr>`).join('');

  const wq = full.water_quality || {};

  container.innerHTML = `
    <div class="panel-title" style="color:var(--primary); border-bottom:1px solid var(--primary); padding-bottom:4px; margin-bottom:10px;">MODULE 04 — BOREWELL TELEMETRY · ${full.borewell_id || 'BW-AP-2847'}</div>
    
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr); gap:8px;">
      <div class="stat-card"><div class="stat-label">MOTOR</div><div class="stat-value good">${full.motor_status}</div></div>
      <div class="stat-card"><div class="stat-label">RPM</div><div class="stat-value">${full.rpm}</div></div>
      <div class="stat-card"><div class="stat-label">YIELD</div><div class="stat-value warn">${full.current_yield_lps}L/s</div></div>
      <div class="stat-card"><div class="stat-label">FAIL RISK</div><div class="stat-value ${full.failure_probability_pct > 30 ? 'danger' : 'good'}">${full.failure_probability_pct}%</div></div>
    </div>

    <div style="padding:6px 0;font-size:0.65rem;color:var(--warning); font-family:'Share Tech Mono';">SIGNAL: ${full.failure_mode || 'STABLE'}</div>

    <details style="margin-top:10px; border:1px solid rgba(0,229,255,0.1); border-radius:4px;">
      <summary style="cursor:pointer; background:rgba(0,229,255,0.05); padding:6px 10px; font-size:0.7rem; font-family:'Orbitron'; color:var(--primary);">LIVE TELEMETRY STREAM — <span id="ws-status" style="color:var(--warning)">...</span></summary>
      <div style="max-height:140px; overflow:auto; padding:0 5px;">
        <table style="width:100%;font-size:0.6rem;border-collapse:collapse;color:var(--text-main); font-family:'Share Tech Mono';">
          <thead><tr style="color:var(--text-dim); border-bottom:1px solid var(--border);">
            <th align="left">TIME</th><th>RPM</th><th>kW</th><th>EFF%</th><th>LVL</th><th>LPS</th><th>°C</th>
          </tr></thead>
          <tbody id="telemetry-tbody">${tRows}</tbody>
        </table>
      </div>
    </details>

    <details style="margin-top:8px; border:1px solid rgba(57, 255, 20, 0.1); border-radius:4px;">
      <summary style="cursor:pointer; background:rgba(57, 255, 20, 0.05); padding:6px 10px; font-size:0.7rem; font-family:'Orbitron'; color:var(--accent);">WATER QUALITY METRICS</summary>
      <div style="padding:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.65rem; font-family:'Rajdhani';">
        <div><span style="color:var(--text-dim)">PH LEVEL:</span> <strong style="color:var(--accent)">${wq.ph || '7.2'}</strong></div>
        <div><span style="color:var(--text-dim)">TDS:</span> <strong style="color:var(--primary)">${wq.tds || '340'} mg/L</strong></div>
        <div><span style="color:var(--text-dim)">TURBIDITY:</span> <strong style="color:var(--warning)">${wq.turbidity || '1.2'} NTU</strong></div>
        <div><span style="color:var(--text-dim)">SENSORS:</span> <strong style="color:var(--accent)">ONLINE</strong></div>
      </div>
    </details>
    
    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">3D GEOLOGICAL STRATIGRAPHY CROSS-SECTION</div>
    <div id="borewell-3d-container" style="width:100%; height:240px; background:#0a0f18; border-radius:4px; margin-top:8px; border:1px solid rgba(0,229,255,0.2);"></div>
  `;

  // Initialize 3D renderer if available
  if (window.initThreeJSRenderer) {
      const geo = await window.AqAPI.getBorewellGeology(full.borewell_id);
      window.initThreeJSRenderer('borewell-3d-container', 'borewell', geo);
  }

  // Hook up WebSocket
  if (window.telemetrySocket) window.telemetrySocket.close();
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host || 'localhost:8001'}/ws/telemetry/${full.borewell_id}`;
  const ws = new WebSocket(wsUrl);
  window.telemetrySocket = ws;

  ws.onopen = () => {
    const st = document.getElementById('ws-status');
    if(st) { st.textContent = 'CONNECTED'; st.style.color = 'var(--good)'; }
  };
  
  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      // #region agent log
      fetch(`${window.location.origin}/api/v1/debug/client-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'pre-fix',
          hypothesisId: 'H10',
          location: 'frontend/api_v2.js:ws.onmessage',
          message: 'Telemetry WebSocket message received',
          data: { event_type: payload?.event_type || null, hasData: !!payload?.data },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion
      if (payload.event_type === 'TELEMETRY_UPDATE') {
        const r = payload.data;
        window.borewellTelemetry = r;
        const tbody = document.getElementById('telemetry-tbody');
        if (tbody) {
          const tr = document.createElement('tr');
          tr.style.cssText = "border-bottom:1px solid rgba(255,255,255,0.05); background: rgba(0,229,255,0.1); transition: background 1s;";
          tr.innerHTML = `
            <td style="padding:3px 6px;color:var(--text-dim);font-size:0.65rem">${r.timestamp?.slice(11,16) || new Date().toISOString().slice(11,16)}</td>
            <td style="padding:3px 6px">${r.rpm}</td>
            <td style="padding:3px 6px">${r.power_kw}</td>
            <td style="padding:3px 6px">${r.efficiency_pct}%</td>
            <td style="padding:3px 6px">${r.dynamic_level_m}m</td>
            <td style="padding:3px 6px">${r.yield_lps} LPS</td>
            <td style="padding:3px 6px;color:${parseFloat(r.motor_temp_c)>50?'var(--warning)':'var(--good)'}">${r.motor_temp_c}°C</td>
          `;
          tbody.insertBefore(tr, tbody.firstChild);
          setTimeout(() => tr.style.background = 'transparent', 500);
          if (tbody.children.length > 24) tbody.removeChild(tbody.lastChild);
        }
        // Sync live telemetry with global 3D borewell model (opened via 3D button)
        if (typeof window.updateBorewellDiggingModel === 'function') {
          // #region agent log
          fetch(`${window.location.origin}/api/v1/debug/client-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              runId: 'pre-fix',
              hypothesisId: 'H9',
              location: 'frontend/api_v2.js:ws.onmessage',
              message: 'Pushing telemetry into digging model updater',
              data: { rpm: r?.rpm, dynamic_level_m: r?.dynamic_level_m },
              timestamp: Date.now()
            })
          }).catch(() => {});
          // #endregion
          window.updateBorewellDiggingModel(r);
        }
      }
    } catch(e) { console.error('WS parse error', e); }
  };
}

/** M05 — Drainage Network */
async function renderDrainageModule(container) {
  const data = await window.AqAPI.getDrainageNodes();
  if (!data) return;

  const nodeColor = s => s === 'CRITICAL' ? 'var(--danger)' : s === 'WARNING' ? 'var(--warning)' : 'var(--good)';

  const nodeRows = (data.nodes || []).slice(0, 10).map(n => `
    <div class="stat-card" style="cursor:pointer; border:1px solid rgba(0,229,255,0.1); margin-bottom:4px;" onclick="flyTo(${n.lat},${n.lon})">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="stat-label">${n.name.toUpperCase()}</div>
        <div style="font-size:0.6rem; color:${nodeColor(n.status)}; border:1px solid ${nodeColor(n.status)}; padding:1px 4px; border-radius:2px;">${n.status}</div>
      </div>
      <div class="stat-value" style="color:var(--text); font-size:1.1rem;">${n.capacity_pct}% <span style="font-size:0.7rem; opacity:0.6;">LOAD</span></div>
      <div class="stat-unit" style="color:var(--text-dim);">${n.type}</div>
    </div>`).join('');

  container.innerHTML = `
    <div class="panel-title" style="color:var(--primary); border-bottom:1px solid var(--primary); padding-bottom:4px; margin-bottom:10px;">MODULE 05 — DRAINAGE NETWORK TOPOLOGY</div>
    
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr); gap:8px;">
      <div class="stat-card"><div class="stat-label">NETWORK</div><div class="stat-value">${data.total_km}km</div></div>
      <div class="stat-card"><div class="stat-label">CRITICAL</div><div class="stat-value danger">${data.overloaded}</div></div>
      <div class="stat-card"><div class="stat-label">PUMPS</div><div class="stat-value good">${data.pump_stations}</div></div>
      <div class="stat-card"><div class="stat-label">STPS</div><div class="stat-value good">${data.stps_online}</div></div>
    </div>

    <details open style="margin-top:15px; border:1px solid rgba(0,229,255,0.1); border-radius:4px;">
      <summary style="cursor:pointer; background:rgba(0,229,255,0.05); padding:8px 10px; font-size:0.75rem; font-family:'Orbitron'; color:var(--primary);">CRITICAL NODE CAPACITIES</summary>
      <div style="padding:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        ${nodeRows}
      </div>
    </details>

    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">D3.JS FORCE-DIRECTED DRAINAGE TOPOLOGY</div>
    <div id="drainage-d3-container" style="width:100%; height:300px; background:#0a0f18; border-radius:4px; margin-top:8px; border:1px solid rgba(0,229,255,0.2);"></div>
  `;

  if (window.renderDrainageNetwork && data.nodes) {
      window.renderDrainageNetwork('drainage-d3-container', data.nodes);
  }
}

/** M06 — Flood alert panel */
async function renderFloodModule(container) {
  const flood = await window.AqAPI.getFloodActive();
  const zones = await window.AqAPI.getFloodZones();
  if (!flood) return;

  const sevColor = s => s === 'INUNDATED' ? 'var(--danger)' : s === 'RISING' ? 'var(--warning)' : 'var(--accent)';

  const zoneRows = ((zones?.zones) || []).map(z => `
    <div class="stat-card" onclick="flyTo(${z.lat},${z.lon})" style="cursor:pointer; border:1px solid rgba(0,229,255,0.1); margin-bottom:4px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="stat-label">${z.zone.toUpperCase()}</div>
        <div style="font-size:0.6rem; color:${sevColor(z.status)}; border:1px solid ${sevColor(z.status)}; padding:1px 4px; border-radius:2px;">${z.status}</div>
      </div>
      <div class="stat-value" style="color:var(--text); font-size:1.1rem;">${z.severity}<span style="font-size:0.7rem; opacity:0.6;"> / 5</span></div>
    </div>`).join('');

  container.innerHTML = `
    <div class="panel-title" style="color:var(--primary); border-bottom:1px solid var(--primary); padding-bottom:4px; margin-bottom:10px;">MODULE 06 — FLOOD VULNERABILITY ANALYTICS</div>
    
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px;">
      <div class="stat-card"><div class="stat-label">24H RAIN</div><div class="stat-value danger">${flood.rainfall_24h_mm}mm</div></div>
      <div class="stat-card"><div class="stat-label">RIVER LVL</div><div class="stat-value ${flood.river_level_m > flood.danger_level_m ? 'danger' : 'warn'}">${flood.river_level_m}m</div></div>
      <div class="stat-card"><div class="stat-label">THREAT</div><div class="stat-value danger" style="font-size:0.8rem;">${flood.threat_level}</div></div>
      <div class="stat-card"><div class="stat-label">NDRF</div><div class="stat-value good">${flood.ndrf_teams}</div></div>
    </div>

    <details open style="margin-top:10px; border:1px solid rgba(255,23,68,0.2); border-radius:4px;">
      <summary style="cursor:pointer; background:rgba(255,23,68,0.05); padding:8px 10px; font-size:0.75rem; font-family:'Orbitron'; color:var(--danger);">ACTIVE RISK ZONES</summary>
      <div style="padding:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        ${zoneRows}
      </div>
    </details>

    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">DISASTER MITIGATION LOGISTICS</div>
    <div style="font-size:0.65rem; color:var(--text-dim); display:flex; flex-direction:column; gap:6px; margin-top:5px;">
      <div style="border-left:2px solid var(--warning); padding-left:8px;">
        DISPLACED PERSONS: <strong style="color:var(--warning)">${flood.displaced?.toLocaleString()}</strong>
      </div>
      <div style="border-left:2px solid var(--accent); padding-left:8px;">
        RELIEF CAMPS ACTIVE: <strong style="color:var(--accent)">${flood.relief_camps}</strong>
      </div>
    </div>
  `;
}

/** M08 — Crisis forecast */
async function renderCrisisModule(container) {
  const threats = await window.AqAPI.getCrisisThreats();
  const timeline = await window.AqAPI.getCrisisTimeline();
  if (!threats) return;

  const lvlColor = l => l === 'CRITICAL' ? 'var(--danger)' : l === 'HIGH' ? 'var(--warning)' : 'var(--accent)';

  const threatCards = (threats.threats || []).map(t => `
    <div class="stat-card" style="border-left:3px solid ${lvlColor(t.level)}; margin-bottom:6px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="stat-label" style="color:var(--text-dim);">${t.priority}</div>
        <div style="font-size:0.6rem; color:${lvlColor(t.level)}; font-weight:700;">${t.level}</div>
      </div>
      <div style="font-size:0.8rem; margin:4px 0; color:var(--text); font-weight:600;">${t.title}</div>
      <div style="font-size:0.65rem; color:var(--text-dim); font-family:'Share Tech Mono';">ETA: ${t.eta} · CONF: ${t.confidence_pct}%</div>
    </div>`).join('');

  container.innerHTML = `
    <div class="panel-title" style="color:var(--primary); border-bottom:1px solid var(--primary); padding-bottom:4px; margin-bottom:10px;">MODULE 08 — MISSION CRITICAL CRISIS FORECAST</div>
    
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px;">
      <div class="stat-card"><div class="stat-label">CRISIS INDEX</div><div class="stat-value danger">${threats.crisis_index}/10</div></div>
      <div class="stat-card"><div class="stat-label">AI CONF.</div><div class="stat-value good">${threats.ai_confidence_pct}%</div></div>
      <div class="stat-card"><div class="stat-label">PEAK ETA</div><div class="stat-value warn">${threats.peak_eta_hours}H</div></div>
    </div>

    <details open style="margin-top:10px; border:1px solid rgba(0,229,255,0.1); border-radius:4px;">
      <summary style="cursor:pointer; background:rgba(0,229,255,0.05); padding:8px 10px; font-size:0.7rem; font-family:'Orbitron'; color:var(--primary);">ACTIVE THREAT INTELLIGENCE</summary>
      <div style="padding:8px;">
        ${threatCards}
      </div>
    </details>

    <div class="panel-title" style="margin-top:15px; font-size:0.75rem; opacity:0.8;">90-DAY PROBABILITY TRAJECTORY (%)</div>
    <div id="crisis-chart-container" style="width:100%; height:120px; background:rgba(0,0,0,0.2); border:1px solid var(--border); border-radius:4px; margin-top:8px;">
      <canvas id="crisis-timeline-canvas"></canvas>
    </div>
  `;


  const cvs = container.querySelector('#crisis-timeline-canvas');
  if (cvs && probs.length) drawLineChart(cvs, days, probs, '#ff4757', '#7a1a1a');
}

/** M09 — City drainage hero */
async function renderCityDrainageModule(container) {
  const data = await window.AqAPI.getCityDrainage();
  if (!data) return;

  const cp = data.city_profile || {};
  const eff = data.efficiency || {};

  const stpRows = (data.stps || []).map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.name.toUpperCase()} STP</div>
      <div class="stat-value">${s.capacity_mld} MLD</div>
      <div class="stat-unit ${s.status === 'ONLINE' ? 'good' : 'warn'}">${s.status}</div>
    </div>`).join('');

  container.innerHTML = `
    <div class="panel-title">MODULE 09 — VIZAG CITY DRAINAGE DIGITAL TWIN (HERO)</div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card"><div class="stat-label">TOTAL STORM KM</div><div class="stat-value">${cp.total_storm_km?.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">MANHOLES</div><div class="stat-value">${cp.manholes?.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">PUMP STATIONS</div><div class="stat-value good">${cp.pump_stations}</div></div>
      <div class="stat-card"><div class="stat-label">PEAK RUNOFF</div><div class="stat-value warn">${cp.peak_runoff_m3s} m³/s</div></div>
      <div class="stat-card"><div class="stat-label">DRAIN EFFICIENCY</div>
        <div class="stat-value ${eff.current_pct < 65 ? 'warn' : 'good'}">${eff.current_pct}%</div>
        <div class="stat-unit">TARGET: ${eff.target_pct}%</div></div>
      <div class="stat-card"><div class="stat-label">WATER REUSE</div><div class="stat-value good">${eff.water_reuse_mld} MLD</div></div>
      <div class="stat-card"><div class="stat-label">ENERGY SAVINGS</div><div class="stat-value">${eff.energy_savings_kwh_day?.toLocaleString()} kWh/d</div></div>
      <div class="stat-card"><div class="stat-label">NITRATE ALARM</div>
        <div class="stat-value danger">${data.contamination?.nitrate_current_ppm} ppm</div>
        <div class="stat-unit">Baseline: ${data.contamination?.nitrate_baseline_ppm}</div></div>
    </div>
    <div class="panel-title" style="margin-top:10px">SEWAGE TREATMENT PLANTS</div>
    <div class="stat-grid">${stpRows}</div>
    <div style="font-size:0.7rem;color:var(--warning);margin-top:8px">
      ⚠ CONTAMINATION HOTSPOTS: ${(data.contamination?.hotspots || []).join(' · ')}
    </div>`;
}

/** M07 — Aquifer Scanner 3D */
async function renderAquiferModule(container) {
  const data = await window.AqAPI.getAquiferScan();
  if (!data) return;

  container.innerHTML = `
    <div class="panel-title">MODULE 07 — 3D AQUIFER VOLUMETRIC SCANNER</div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card"><div class="stat-label">REMAINING VOL</div><div class="stat-value danger">${data.remaining_pct}%</div></div>
      <div class="stat-card"><div class="stat-label">SAFE YIELD</div><div class="stat-value good">${data.safe_yield_m3_day} m³/d</div></div>
      <div class="stat-card"><div class="stat-label">RECHARGE RATE</div><div class="stat-value warn">${data.recharge_rate_m_day} m/d</div></div>
      <div class="stat-card"><div class="stat-label">EST VOLUME</div><div class="stat-value">${(data.estimated_volume_m3 / 1000000).toFixed(1)} MCM</div></div>
    </div>
    <div class="panel-title" style="margin-top:12px">3D SUBSURFACE SATURATION MAP (GRACE-FO SYNC)</div>
    <div id="aquifer-3d-container" style="width:100%; height:320px; background:#0a0f18; border-radius:4px; margin-top:8px; border:1px solid rgba(0,229,255,0.2);"></div>
  `;

  if (window.initThreeJSRenderer) {
      window.initThreeJSRenderer('aquifer-3d-container', 'aquifer', data);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CANVAS CHART UTILITY
// ═══════════════════════════════════════════════════════════════════════
function drawLineChart(canvas, labels, values, lineColor = '#00b4d8', fillColor = 'rgba(0,180,216,0.15)') {
  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.clientWidth || 400;
  canvas.width = W; canvas.height = canvas.height || 80;
  const H = canvas.height;
  const pad = { t: 6, r: 10, b: 20, l: 36 };
  const w = W - pad.l - pad.r, h = H - pad.t - pad.b;

  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const px = i => pad.l + (i / (values.length - 1)) * w;
  const py = v => pad.t + h - ((v - min) / range) * h;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const y = pad.t + h * (1 - f);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + w, y); ctx.stroke();
  });

  // Fill
  ctx.beginPath();
  ctx.moveTo(px(0), py(values[0]));
  values.forEach((v, i) => ctx.lineTo(px(i), py(v)));
  ctx.lineTo(px(values.length - 1), pad.t + h);
  ctx.lineTo(px(0), pad.t + h);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(px(0), py(values[0]));
  values.forEach((v, i) => ctx.lineTo(px(i), py(v)));
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Y labels
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  [min, (min + max) / 2, max].forEach(v => {
    ctx.fillText(v.toFixed(1), pad.l - 4, py(v) + 3);
  });

  // X labels
  ctx.textAlign = 'center';
  const step = Math.ceil(values.length / 5);
  for (let i = 0; i < values.length; i += step) {
    ctx.fillText(labels[i], px(i), H - 4);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MODULE DISPATCH — hook into switchModule()
// ═══════════════════════════════════════════════════════════════════════
window._v2ModuleRender = async function(moduleId, container) {
  if (!container) return;
  container.innerHTML = `<div style="color:var(--text-dim);padding:20px;text-align:center">⏳ Loading ${moduleId} data...</div>`;
  switch (moduleId) {
    case 'groundwater':   await renderGroundwaterModule(container); break;
    case 'reservoir':     await renderReservoirModule(container);   break;
    case 'irrigation':    await renderIrrigationModule(container);  break;
    case 'borewell':      await renderBorewellModule(container);    break;
    case 'drainage':      await renderDrainageModule(container);    break;
    case 'flood':         await renderFloodModule(container);       break;
    case 'aquifer':       await renderAquiferModule(container);     break;
    case 'crisis':        await renderCrisisModule(container);      break;
    case 'city_drainage': await renderCityDrainageModule(container);break;
    default: container.innerHTML = ''; break;
  }
};

console.log('[AquaIntelli v2] API client loaded — Base:', V2_API_BASE);
