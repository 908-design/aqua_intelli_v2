// ═══════════════════════════════════════════════════════════
// AquaIntelli — app.js
// Single Leaflet center map • lat/lon/location bar on every page
// ═══════════════════════════════════════════════════════════

// API base — works both when served from FastAPI (same origin) and when testing locally
const _origin = (window.AQUA_API_ORIGIN && typeof window.AQUA_API_ORIGIN === 'string')
  ? window.AQUA_API_ORIGIN
  : ((window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'http://localhost:8001');
const API_BASE = _origin + '/api/v1';
const DEBUG_LOG_API = _origin + '/api/v1/debug/client-log';

let mapController = null;
let centerMap = null;
let currentModule = 'godseyeview';

function sendDebugLog(hypothesisId, location, message, data = {}, runId = 'pre-fix') {
  // #region agent log
  fetch(DEBUG_LOG_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId, hypothesisId, location, message, data, timestamp: Date.now() })
  }).catch(() => {});
  // #endregion
}

window.addEventListener('error', (event) => {
  // #region agent log
  sendDebugLog('H6', 'frontend/app.js:window.error', 'Unhandled window error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
  // #endregion
});

window.addEventListener('unhandledrejection', (event) => {
  // #region agent log
  sendDebugLog('H6', 'frontend/app.js:window.unhandledrejection', 'Unhandled promise rejection', {
    reason: String(event.reason)
  });
  // #endregion
});

// ──────────────────────────────────────────────────────────
// SAAS GATEWAY LOGIC (Top level for early access)
// ──────────────────────────────────────────────────────────
window.mockLogin = function() {
  console.log("[AUTH] Initializing Enterprise Handshake...");
  const overlay = document.getElementById('auth-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    setStatus('AUTH COMPLETE', 'active');
    console.log("[AUTH] Access Granted. Telemetry HUD Synchronized.");
  } else {
    console.error("[AUTH] Auth overlay not found!");
  }
};

function setStatus(txt, state) {
  const el = document.getElementById('loc-status-txt');
  const dot = document.getElementById('loc-status-dot');
  if (el) el.textContent = txt;
  if (dot) dot.className = 'loc-status-dot' + (state ? ' ' + state : '');
}

// ── COLLAPSIBLE PANELS ──
window.togglePanel = function(side) {
  const panel = document.getElementById('panel-' + side);
  const toggle = document.getElementById('toggle-' + (side === 'left' ? 'l' : 'r'));
  const isCollapsed = panel.classList.toggle('collapsed');
  
  if (side === 'left') {
    toggle.textContent = isCollapsed ? '▶' : '◀';
  } else {
    toggle.textContent = isCollapsed ? '◀' : '▶';
  }
};

window.triggerRAG = async function() {
  const input = document.getElementById('rag-input');
  const res = document.getElementById('rag-response');
  if (!input || !res || !input.value.trim()) return;
  
  res.innerHTML = '<div style="padding:10px; color:var(--text-dim); font-size:11px; font-family:\'Share Tech Mono\', monospace; animation: pulse-dot 1s infinite;">Synthesizing real-time intelligence...</div>';
  
  // Simulate an API call delay for the RAG response
  setTimeout(() => {
    res.innerHTML = `
      <div style="padding:12px; margin-top:10px; border-left: 2px solid var(--primary); background: rgba(0,229,255,0.05); font-family:'Share Tech Mono', monospace; font-size:11px; line-height: 1.5;">
        <div style="color:var(--primary); margin-bottom: 5px;">> GEO-RAG ANALYSIS COMPLETE</div>
        Processed query: <span style="color:var(--text);">${input.value}</span><br><br>
        Based on live sensor telemetry and satellite data for Visakhapatnam, the current spatial topology indicates localized stress vectors. Recommend optimizing pump operations and continuing monitoring.
      </div>`;
    input.value = '';
    
    // Automatically open the right panel if it is collapsed
    const rightPanel = document.getElementById('panel-right');
    if (rightPanel.classList.contains('collapsed')) {
      togglePanel('right');
    }
  }, 1200);
};

// RAI Action Button Styles
const style = document.createElement('style');
style.textContent = `
.rai-action-btn {
  width: 100%;
  margin-top: 15px;
  background: var(--primary);
  color: var(--bg);
  border: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  padding: 10px;
  cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition: all 0.2s;
}
.rai-action-btn:hover {
  background: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,229,255,0.4);
}`;
document.head.appendChild(style);

// ──────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────
let mainMarker    = null;   // primary location marker
let scanCircle    = null;   // inner scan ring
let outerRing     = null;   // outer dashed ring
let eventMarkers  = [];     // crisis/alert markers
let activePopupEvent = null;
let threeScene    = null;   // Three.js scene manager
let borewellTelemetry = null;
window.borewellTelemetry = null;
let borewellAnimState = { rpm: 0, depthFactor: 1.0, phase: 0 };
let borewellTelemetrySocket = null;
let activeBorewellStreamId = null;
let lastGeoIntelligence = null;
let phase2LayerGroup = null;
let drainageOptimalRoute = null;
let phase2TemporalTick = 0;
let phase2TemporalTimer = null;

let reservoirLayerGroup = null;

let reservoirMoveHandlerBound = false;

const MAP_ONLY_MODULES = new Set([
  'groundwater', 'reservoir', 'irrigation', 'borewell',
  'drainage', 'flood', 'aquifer', 'crisis', 'city_drainage'
]);



const MODULES = {
  godseyeview: {
    tag:'00 · GOD\'S EYE', mode:'GLOBAL WATER OPERATING SYSTEM (W.O.S)',
    lat:20.5937, lon:78.9629, name:'Global Network — HQ', zoom:4, color:'#00e5ff',
    metrics:[], charts:[],
    features: ['Satellite Constellation Sync', 'Multi-tenant Workspace', 'Cross-Border Water Credits']
  },
  groundwater: {
    tag:'01 · GROUNDWATER', mode:'AQUIFER DYNAMICS & DEPLETION MONITORING — VIZAG',
    lat:17.6939, lon:83.2922, name:'Visakhapatnam, Andhra Pradesh', zoom:10, color:'#00e5ff',
    metrics:[
      {l:'AVG DEPTH',     v:'24.8', u:'METERS',      cls:''},
      {l:'DEPLETION',     v:'-2.4', u:'M/YEAR',      cls:'danger'},
      {l:'RECHARGE',      v:'0.85', u:'M/YEAR',      cls:'good'},
      {l:'STRESS LEVEL',  v:'78%',  u:'HIGH',        cls:'danger'},
      {l:'LITHOLOGY',     v:'SANDY',u:'3D SCANNED',  cls:'good'},
      {l:'SUBSIDENCE',    v:'12MM', u:'PER YEAR',    cls:'warn'},
      {l:'QUALITY',       v:'GOOD', u:'TDS 450',     cls:''},
      {l:'HEALTH INDEX',  v:'CRITICAL',u:'ALERT ACTIVE',cls:'danger', risk:true},
    ],
    charts:[
      {t:'GROUNDWATER DEPTH — 5YR TREND', s:'DEPTH (M)', type:'depth_forecast'},
      {t:'SOIL MOISTURE VS RECHARGE',    s:'% SATURATION', type:'soil_moisture'},
    ],
  },
  reservoir: {
    tag:'02 · RESERVOIR', mode:'STRATEGIC SURFACE WATER INTELLIGENCE — VIZAG',
    lat:17.65, lon:83.15, name:'Raiwada Reservoir, Visakhapatnam', zoom:10, color:'#00e5ff',
    metrics:[
      {l:'LIVE STORAGE',  v:'84%',  u:'CAPACITY',    cls:'good'},
      {l:'EVAPORATION',   v:'4.2',  u:'MM/DAY',      cls:'warn'},
      {l:'INFLOW',        v:'2,480',u:'M³/S',        cls:''},
      {l:'OUTFLOW',       v:'1,840',u:'M³/S',        cls:''},
      {l:'SILTATION',     v:'12%',  u:'VOL. REDUC',  cls:'warn'},
      {l:'TURBIDITY',     v:'14',   u:'NTU',         cls:''},
      {l:'GATE STATUS',   v:'6/24', u:'OPEN',        cls:'warn'},
      {l:'WATER BUDGET',  v:'SURPLUS',u:'90-DAY PROJ.',cls:'good', risk:true},
    ],
    charts:[
      {t:'STORAGE ANOMALY — SEASONAL', s:'MILLION M³', type:'reservoir_storage'},
      {t:'INFLOW VS OUTFLOW DYNAMICS', s:'M³/S',      type:'flow_trend'},
    ],
  },
  irrigation: {
    tag:'03 · IRRIGATION AI', mode:'PRECISION AGRI-HYDROLOGY & ROI — VIZAG',
    lat:17.80, lon:83.20, name:'Visakhapatnam Peri-Urban Agri-Cluster', zoom:12, color:'#39ff14',
    metrics:[
      {l:'ET₀ DEMAND',    v:'6.2',  u:'MM/DAY',      cls:''},
      {l:'SOIL TENSION',  v:'24',   u:'kPa (DRY)',   cls:'warn'},
      {l:'CROP HEALTH',   v:'0.82', u:'NDVI INDEX',  cls:'good'},
      {l:'WATER SAVINGS', v:'18%',  u:'VS TRADIT.',  cls:'good'},
      {l:'PROFITABILITY', v:'+$420',u:'PER ACRE',    cls:'good'},
      {l:'VPD DEFICIT',   v:'1.4',  u:'kPA',         cls:''},
      {l:'FERTIGATION',   v:'AUTO', u:'BALANCED',    cls:''},
      {l:'OPTIMIZATION',  v:'HIGH', u:'SCHEDULED',   cls:'good', risk:true},
    ],
    charts:[
      {t:'EVAPOTRANSPIRATION DEMAND', s:'MM/DAY', type:'et_demand'},
      {t:'NDVI VEGETATION VIGOR',     s:'0.0 to 1.0', type:'ndvi_trend'},
    ],
  },
  borewell: {
    tag:'04 · BOREWELL', mode:'SUBTERRANEAN DRILLING PREDICTION — BW-AP-2847',
    lat:17.7102, lon:83.1780, name:'Venkatapathirajupet, Anakapalle Mandal', zoom:12, color:'#ff6b00',
    metrics:[
      {l:'SUCCESS PROB.', v:'74%',  u:'AI PREDICTED',cls:'warn'},
      {l:'RISK LEVEL',    v:'MED',  u:'GEOLOGICAL',  cls:'warn'},
      {l:'SOIL TYPE',     v:'CLAY', u:'SCAN: VLF',   cls:''},
      {l:'REC. DEPTH',    v:'210',  u:'METERS',      cls:''},
      {l:'DRILL METHOD',  v:'DTH',  u:'PNEUMATIC',   cls:''},
      {l:'WATER STRIKE',  v:'140',  u:'METERS PROJ', cls:''},
      {l:'CONFIDENCE',    v:'0.82', u:'AI MODEL v4', cls:''},
      {l:'DRILL STATUS',  v:'READY',u:'SITE CLEAR',  cls:'good', risk:true},
    ],
    charts:[
      {t:'DEPTH vs SUCCESS PROBABILITY', s:'% SUCCESS — DEPTH (FT)', type:'borewell_depth'},
      {t:'REGIONAL CLUSTER SUCCESS',     s:'RATE BY ZONE',           type:'borewell_cluster'},
    ],
  },
  drainage: {
    tag:'05 · DRAINAGE', mode:'URBAN & RURAL DRAINAGE ANALYSIS — VIZAG',
    lat:17.6939, lon:83.2922, name:'Visakhapatnam Drainage Network', zoom:11, color:'#00e5ff',
    metrics:[
      {l:'DRAINAGE CAP.',  v:'74%',   u:'UTILISATION',   cls:'warn'},
      {l:'FLOW VELOCITY',  v:'1.42',  u:'M/S',           cls:''},
      {l:'RUNOFF COEFF.',  v:'0.68',  u:'URBAN',         cls:'warn'},
      {l:'ACOUSTIC LEAK',  v:'NONE',  u:'ACTIVE SCAN',   cls:'good'},
      {l:'BLOCKAGE AI',    v:'8%',    u:'RISK SCORE',    cls:''},
      {l:'WARD EQUITY',    v:'72%',   u:'HEALTH INDEX',  cls:'warn'},
      {l:'SEWER GAS',      v:'NORM',  u:'H2S LEVELS',    cls:''},
      {l:'STATUS',         v:'MONITOR',u:'RAIN FORECAST',cls:'warn', risk:true},
    ],
    charts:[
      {t:'DRAINAGE FLOW — 24H FORECAST', s:'M³/S',    type:'drainage_flow'},
      {t:'RUNOFF ACCUMULATION',          s:'MM — 7D', type:'runoff'},
    ],
  },
  flood: {
    tag:'06 · FLOOD', mode:'FLOOD RISK ASSESSMENT & EARLY WARNING — VIZAG',
    lat:17.7100, lon:83.3000, name:'Visakhapatnam Flood Zones', zoom:11, color:'#ff1744',
    metrics:[
      {l:'FLOOD RISK',    v:'63%',  u:'PROBABILITY',  cls:'warn'},
      {l:'RAIN FORECAST', v:'180',  u:'MM — 3 DAYS',  cls:'danger'},
      {l:'RIVER LEVEL',   v:'4.82', u:'M — DANGER 6M',cls:'warn'},
      {l:'SAFE PATHS',    v:'4/6',  u:'AVAILABLE',    cls:'good'},
      {l:'RESUE READI.',  v:'HIGH', u:'LOGISTICS',    cls:'good'},
      {l:'POPULATION',    v:'84K',  u:'AT RISK',      cls:'danger'},
      {l:'DIGITAL TWIN',  v:'SYNC', u:'STOCHASTIC',   cls:''},
      {l:'ALERT LEVEL',   v:'HIGH', u:'EVACUATE ZONES',cls:'danger', risk:true},
    ],
    charts:[
      {t:'RIVER LEVEL — 72H FORECAST',    s:'METERS — DANGER 6M', type:'river_level'},
      {t:'RAINFALL INTENSITY FORECAST',   s:'MM/H — 72H',         type:'rainfall_bars'},
    ],
  },
  aquifer: {
    tag:'07 · AQUIFER SCAN', mode:'GRACE-FO SUBSURFACE INTELLIGENCE — VIZAG',
    lat:17.6939, lon:83.2922, name:'Eastern Ghats Coastal Aquifer, AP', zoom:9, color:'#9c27b0',
    metrics:[
      {l:'AQUIFER STORAGE',v:'-8.42', u:'KM³ ANOMALY', cls:'danger'},
      {l:'RECHARGE RATE',  v:'0.84',  u:'M/YEAR',      cls:'warn'},
      {l:'THICKNESS',      v:'320',   u:'METERS',      cls:''},
      {l:'4D VOLUMETRIC',  v:'SCAN',  u:'TIME-SERIES', cls:''},
      {l:'HYDRAULIC COND.',v:'2.4',   u:'M/DAY',       cls:''},
      {l:'WATER TABLE',    v:'-14.2M',u:'BELOW 2020',  cls:'danger'},
      {l:'TRANSMISSIVITY', v:'48',    u:'M²/DAY',      cls:''},
      {l:'AQUIFER HEALTH', v:'CRITICAL',u:'OVEREXPLOITED',cls:'danger', risk:true},
    ],
    charts:[
      {t:'GRACE-FO WATER STORAGE ANOMALY', s:'KM³ — 12 MONTHS', type:'grace_anomaly'},
      {t:'RECHARGE vs EXTRACTION',         s:'MCM/MONTH',       type:'recharge_balance'},
    ],
  },
  crisis: {
    tag:'08 · CRISIS FORECAST', mode:'AI WATER STRESS PREDICTION ENGINE — VIZAG',
    lat:17.6939, lon:83.2922, name:'Visakhapatnam Crisis Zone', zoom:9, color:'#ff1744',
    metrics:[
      {l:'CRISIS PROB.',  v:'78%',   u:'90-DAY WINDOW', cls:'danger'},
      {l:'CLIMATE IMPACT',v:'SEVERE',u:'GLOBAL WARMING',cls:'danger'},
      {l:'STRESS INDEX',  v:'8.2/10',u:'HIGH STRESS',   cls:'danger'},
      {l:'WATER DEFICIT', v:'-1.4 KM³',u:'ANNUAL',      cls:'danger'},
      {l:'GDP IMPACT',    v:'$840M', u:'PROJ. LOSS',    cls:'warn'},
      {l:'FOOD SECURITY', v:'AT RISK',u:'3 CROPS',      cls:'danger'},
      {l:'ADAPTATION',    v:'URGENT', u:'POLICY NEEDED',cls:'warn'},
      {l:'CRISIS INDEX',  v:'CRITICAL',u:'IMMINENT RISK',cls:'danger', risk:true},
    ],
    charts:[
      {t:'CLIMATE FORCING & WATER AVAILABILITY', s:'HISTORICAL vs PROJECTED', type:'crisis_prob'},
      {t:'MULTI-INDICATOR STRESS INDEX',      s:'COMPOSITE SCORE',type:'stress_index'},
    ],
  },
  city_drainage: {
    tag:'09 · CITY DRAINAGE', mode:'VIZAG CITY DRAINAGE DIGITAL TWIN (HERO MODULE)',
    lat:17.6939, lon:83.2922, name:'Visakhapatnam City Drainage', zoom:12, color:'#39ff14',
    metrics:[
      {l:'OVERLOADED DRAINS', v:'23',     u:'CRITICAL',   cls:'danger'},
      {l:'SENSOR NETWORK',    v:'300+',   u:'IoT LIVE',    cls:'good'},
      {l:'EQUITY INDEX',      v:'68/100', u:'CITY AVG',    cls:'warn'},
      {l:'TICKETS RESOLVED',  v:'84%',    u:'SLA COMPLIANT',cls:'good'},
      {l:'PEAK FLOW',         v:'1.4',    u:'M/S',        cls:''},
      {l:'FLOOD ETA',         v:'18 HR',  u:'WARNING',    cls:'warn'},
      {l:'PUMP SYSTEMS',      v:'ACTIVE', u:'15 STATIONS',cls:'good'},
      {l:'SYSTEM STATUS',     v:'STRESSED',u:'MONITORING', cls:'danger', risk:true},
    ],
    charts:[
      {t:'LIVE NETWORK CAPACITY', s:'CAPACITY VS LOAD (%)', type:'drainage_flow'},
      {t:'WARD EQUITY SCORES',  s:'SOCIAL VULNERABILITY INDEX', type:'stress_index'},
    ],
  },
};

// Water events shown on map (Expanded with basins & sources)
const WATER_EVENTS = [
  {id:1, name:'Godavari Basin Zone',     loc:'Maharashtra, IN',    lat:19.8,  lon:75.3, type:'BASIN', sev:'critical', depth:'-8.2M',  area:'4120 km²'},
  {id:2, name:'Cauvery Basin Alert',     loc:'Tamil Nadu, IN',     lat:11.4,  lon:78.8, type:'BASIN', sev:'warning',  depth:'-1.4M',  area:'1540 km²'},
  // ... (Adding 100+ simulated global sources)
  ...Array.from({length: 100}, (_, i) => ({
    id: 100 + i,
    name: `Global Source ${100 + i}`,
    loc: 'International Waters',
    lat: (Math.random() * 160) - 80,
    lon: (Math.random() * 360) - 180,
    type: i % 2 === 0 ? 'SENSOR MESH' : 'RESERVOIR',
    sev: Math.random() > 0.8 ? 'critical' : (Math.random() > 0.5 ? 'warning' : 'good'),
    depth: `-${(Math.random()*50).toFixed(1)}M`,
    area: `${Math.floor(Math.random()*5000)} km²`
  }))
];

const SEV_COLORS = { critical:'#ff1744', warning:'#ff6b00', good:'#39ff14', info:'#00e5ff' };

window.flyTo = function(lat, lon, zoom, name) {
  if (centerMap) centerMap.flyTo([lat, lon], zoom || 13, { duration: 1.2 });
  const locName = name || ('Zone: ' + lat.toFixed(3) + ', ' + lon.toFixed(3));
  
  const latEl = document.getElementById('loc-lat');
  const lonEl = document.getElementById('loc-lon');
  const nameEl = document.getElementById('loc-name');
  if (latEl) latEl.value = lat.toFixed(4);
  if (lonEl) lonEl.value = lon.toFixed(4);
  if (nameEl) nameEl.value = locName;

  if (window.currentModule && window.currentModule !== 'godseyeview') {
    if (typeof window.fetchModuleData === 'function') window.fetchModuleData(window.currentModule, lat, lon);
    if (typeof window.refreshGeoIntelligence === 'function') {
      window.refreshGeoIntelligence(window.currentModule, lat, lon, locName, false);
    }
  }
};

// ──────────────────────────────────────────────────────────
// CLOCK
// ──────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  
  // UTC String
  const utcTs = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()]
                .map(v => String(v).padStart(2,'0')).join(':');
  
  // Local String (for user timezone awareness)
  const locTs = [now.getHours(), now.getMinutes(), now.getSeconds()]
                .map(v => String(v).padStart(2,'0')).join(':');
  
  document.getElementById('clock-time').textContent = utcTs;
  
  const hTime = document.getElementById('hud-time');
  if (hTime) {
    const isPrivacyOn = document.getElementById('btn-privacy')?.classList.contains('active');
    const dateStr = now.toISOString().split('T')[0];
    hTime.innerHTML = `${dateStr} / <span style="color:var(--primary)">UTC ${utcTs}</span> / <span style="color:var(--text-dim)">LOC ${locTs}</span>`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// ──────────────────────────────────────────────────────────
// SECURITY & PRIVACY
// ──────────────────────────────────────────────────────────
let privacyMode = true;
function togglePrivacy() {
  privacyMode = !privacyMode;
  const btn = document.getElementById('btn-privacy');
  btn.classList.toggle('active', privacyMode);
  btn.textContent = privacyMode ? 'PROTECT PII: ON' : 'PROTECT PII: OFF';
  
  // Apply/Remove masking classes
  const targets = document.querySelectorAll('.masked');
  targets.forEach(t => {
    t.style.filter = privacyMode ? 'blur(4px)' : 'none';
    t.style.pointerEvents = privacyMode ? 'none' : 'auto';
  });
  
  setStatus(privacyMode ? 'ENCRYPTING VIEW' : 'FULL ACCESS', privacyMode ? 'active' : 'warn');
}

// ──────────────────────────────────────────────────────────
// LEAFLET MAP — single instance, reused across all modules
// ──────────────────────────────────────────────────────────
function initCenterMap() {
  const cfg = MODULES['godseyeview'];
  if (!window.AquaMap?.MapController) {
    console.error('[AquaIntelli] map_controller.js not loaded — cannot initialize map.');
    return;
  }

  mapController = new window.AquaMap.MapController('center-map', sendDebugLog);
  window._mapController = mapController; // for debugging in console

  // Convert WATER_EVENTS into controller-friendly format (color + popupHtml)
  const events = (typeof WATER_EVENTS !== 'undefined' && Array.isArray(WATER_EVENTS))
    ? WATER_EVENTS.map(ev => {
        const col = (typeof SEV_COLORS !== 'undefined' && SEV_COLORS[ev.sev]) ? SEV_COLORS[ev.sev] : '#ff6b00';
        return {
          lat: ev.lat,
          lon: ev.lon,
          color: col,
          popupHtml: `
            <div style="font-family:'Share Tech Mono',monospace;font-size:10px;">
              <div style="color:${col};font-weight:700;letter-spacing:1px;margin-bottom:4px;">${ev.type} · ${String(ev.sev||'').toUpperCase()}</div>
              <div style="color:#c8f4ff;margin-bottom:2px;">${ev.name}</div>
              <div style="color:rgba(200,244,255,0.55);">${ev.loc}</div>
              <div style="color:rgba(200,244,255,0.55);margin-top:4px;">DEPTH: ${ev.depth}<br>AREA: ${ev.area}</div>
              <div style="margin-top:8px;"><button onclick="flyToLatLon(${ev.lat},${ev.lon},'${ev.loc}')" style="background:rgba(0,229,255,.15);border:1px solid #00e5ff;border-radius:2px;padding:3px 8px;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:9px;color:#00e5ff;">FOCUS ZONE ↗</button></div>
            </div>
          `
        };
      })
    : [];

  centerMap = mapController.init({
    lat: cfg.lat,
    lon: cfg.lon,
    zoom: cfg.zoom,
    color: cfg.color,
    name: cfg.name,
    events
  });

  // Keep references for existing logic (minimize churn)
  mainMarker = mapController.mainMarker;
  scanCircle = mapController.scanCircle;
  outerRing = mapController.outerRing;
  eventMarkers = mapController.eventMarkers;

  mapController.onClick((e) => {
    document.getElementById('loc-lat').value = e.latlng.lat.toFixed(4);
    document.getElementById('loc-lon').value = e.latlng.lng.toFixed(4);
    reverseGeocode(e.latlng.lat, e.latlng.lng);
  });
}

function createPulseMarker(lat, lon, color, name) {
  const html = `
    <div style="position:relative;width:14px;height:14px;">
      <div style="width:14px;height:14px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};position:absolute;top:0;left:0;"></div>
      <div style="position:absolute;top:-1px;left:-1px;width:16px;height:16px;border-radius:50%;border:2px solid ${color};animation:marker-ring 2.4s ease-out infinite;"></div>
    </div>`;
  const icon = L.divIcon({ html, className:'', iconSize:[14,14], iconAnchor:[7,7] });
  const marker = L.marker([lat, lon], { icon });

  marker.bindPopup(`
    <div style="font-family:'Share Tech Mono',monospace;color:#00e5ff;font-size:10px;">
      <div style="font-weight:700;margin-bottom:4px;letter-spacing:1px;">◎ ${name.toUpperCase()}</div>
      <div style="color:rgba(200,244,255,0.6);">LAT: ${lat.toFixed(4)}°N</div>
      <div style="color:rgba(200,244,255,0.6);">LON: ${lon.toFixed(4)}°E</div>
    </div>
  `, { maxWidth: 220 });

  return marker;
}

function addEventMarkers() {
  WATER_EVENTS.forEach(ev => {
    const col  = SEV_COLORS[ev.sev];
    const html = `
      <div style="position:relative;width:12px;height:12px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${col};box-shadow:0 0 6px ${col};position:absolute;"></div>
        <div style="position:absolute;top:-1px;left:-1px;width:14px;height:14px;border-radius:50%;border:2px solid ${col};animation:marker-ring 2.4s ease-out infinite;animation-delay:${ev.id * 0.3}s;"></div>
      </div>`;
    const icon = L.divIcon({ html, className:'', iconSize:[12,12], iconAnchor:[6,6] });
    const m = L.marker([ev.lat, ev.lon], { icon });
    m.bindPopup(`
      <div style="font-family:'Share Tech Mono',monospace;font-size:10px;">
        <div style="color:${col};font-weight:700;letter-spacing:1px;margin-bottom:4px;">${ev.type} · ${ev.sev.toUpperCase()}</div>
        <div style="color:#c8f4ff;margin-bottom:2px;">${ev.name}</div>
        <div style="color:rgba(200,244,255,0.55);">${ev.loc}</div>
        <div style="color:rgba(200,244,255,0.55);margin-top:4px;">DEPTH: ${ev.depth}<br>AREA: ${ev.area}</div>
        <div style="margin-top:8px;"><button onclick="flyToLatLon(${ev.lat},${ev.lon},'${ev.loc}')" style="background:rgba(0,229,255,.15);border:1px solid #00e5ff;border-radius:2px;padding:3px 8px;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:9px;color:#00e5ff;">FOCUS ZONE ↗</button></div>
      </div>
    `, { maxWidth: 240 });
    m.on('click', () => showEventPopup(ev));
    m.addTo(centerMap);
    eventMarkers.push(m);
  });
}

// Animate marker ring via CSS injected once
(function injectMarkerCSS() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes marker-ring {
      0%   { transform:scale(1);   opacity:0.9; }
      100% { transform:scale(3.5); opacity:0;   }
    }`;
  document.head.appendChild(s);
})();

// ──────────────────────────────────────────────────────────
// MODULE SWITCHING
// ──────────────────────────────────────────────────────────
function switchModule(mod, tabEl) {
  if (mod !== 'borewell') {
    stopBorewellTelemetryStream();
  }
  clearPhase2Overlays();
  if (mod !== 'reservoir') {
    const cards = document.getElementById('map-bottom-cards');
    if (cards) cards.innerHTML = '';
  }
  currentModule = mod;
  document.querySelectorAll('.mod-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  const cfg = MODULES[mod];
  if (!cfg) return;

  document.getElementById('loc-module-tag').textContent = cfg.tag;
  document.getElementById('hud-mode').textContent = cfg.mode;
  renderLeftPanel(mod, cfg);

  // Render per-module panel (or hide for god's eye)
  renderModulePanel(mod, cfg);

  // ── v2: Populate panel with real dataset API data ──
  if (mod !== 'godseyeview' && typeof window._v2ModuleRender === 'function') {
    const panel = getModulePanelHost(mod);
    let v2wrap = document.getElementById('v2-data-panel');
    if (v2wrap) { v2wrap.remove(); }
    v2wrap = document.createElement('div');
    v2wrap.id = 'v2-data-panel';
    v2wrap.style.cssText = 'border-top:1px solid var(--border);margin-top:8px;padding-top:8px;';
    if (panel) panel.appendChild(v2wrap);
    window._v2ModuleRender(mod, v2wrap);
  }

  // Clear drainage overlays when switching away
  if (mapController) {
    mapController.setBaseLayer('dark');
    mapController.toggleFlow(false);
    mapController.toggleHeatmap(false);
    mapController.toggleOverlay('optimal', false);
  }
  if (typeof drainageLayerGroup !== 'undefined' && drainageLayerGroup && centerMap) {
    centerMap.removeLayer(drainageLayerGroup);
    drainageLayerGroup = null;
  }
  document.getElementById('drain-ctrl-bar').classList.remove('visible');
  document.getElementById('drain-stats-panel').classList.remove('visible');
  document.getElementById('pipe-depth-legend').classList.remove('visible');
  document.getElementById('drain-blueprint-canvas').classList.remove('visible');
  blueprintActive = false;

  const curLat = parseFloat(document.getElementById('loc-lat').value);
  const curLon = parseFloat(document.getElementById('loc-lon').value);
  const curName = document.getElementById('loc-name').value;

  if (!isNaN(curLat) && !isNaN(curLon)) {
    flyToLatLon(curLat, curLon, curName, cfg.zoom);
    if (mod !== 'godseyeview') fetchModuleData(mod, curLat, curLon);
    refreshGeoIntelligence(mod, curLat, curLon, curName, false);
  } else {
    setLocationBar(cfg.lat, cfg.lon, cfg.name);
    flyToLatLon(cfg.lat, cfg.lon, cfg.name, cfg.zoom);
    if (mod !== 'godseyeview') fetchModuleData(mod, cfg.lat, cfg.lon);
    refreshGeoIntelligence(mod, cfg.lat, cfg.lon, cfg.name, false);
  }

  if (mod === 'reservoir') fetchNearbyReservoirs(cfg.lat, cfg.lon);
  if (mod === 'borewell') fetchBorewellDetails(cfg.lat, cfg.lon);
}

// ──────────────────────────────────────────────────────────
// MODULE PANEL — unique UI per module
// ──────────────────────────────────────────────────────────
function kpi(lbl, val, cls, unit) {
  return `<div class="mp-kpi"><div class="mp-kpi-lbl">${lbl}</div><div class="mp-kpi-val ${cls||''}">${val}</div><div class="mp-kpi-unit">${unit||''}</div></div>`;
}
function prog(lbl, val, cls) {
  return `<div class="mp-progress"><div class="mp-prog-lbl"><span>${lbl}</span><span>${val}%</span></div><div class="mp-prog-track"><div class="mp-prog-fill ${cls}" style="width:${val}%"></div></div></div>`;
}
function pill(label, cls) {
  return `<span class="mp-alert-pill ${cls}">${label}</span>`;
}
function sdot(cls) { return `<span class="mp-sdot ${cls}"></span>`; }

function renderMpCanvas(id, drawFn, color) {
  requestAnimationFrame(() => {
    const c = document.getElementById(id); if (!c) return;
    c.width = c.offsetWidth * 2; c.height = 136;
    const ctx = c.getContext('2d'); ctx.scale(2, 1);
    drawFn(ctx, c.offsetWidth, 68, color);
  });
}

function renderModulePanel(mod, cfg) {
  const panel = getModulePanelHost(mod);
  if (!panel) return;

  // Keep middle map clean for module-centric workflows.
  if (mod === 'godseyeview') {
    panel.classList.remove('visible');
    panel.innerHTML = '';
    const rightPanel = document.getElementById('right-module-panel');
    if (rightPanel) rightPanel.innerHTML = '';
    return;
  }
  panel.classList.add('visible');

  const c = cfg.color;
  let html = '';

  if (mod === 'groundwater') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">AQUIFER STATUS //</span>
        ${pill('⬇ DEPLETING -0.059 M/DAY','critical')}
        ${pill('GRACE-FO ANOMALY -2.66M','warning')}
        ${pill('CGWB MONITORING: ACTIVE','good')}
        ${pill('SOIL MOISTURE: 28.6%','info')}
        ${pill('RECHARGE: 0.85 M/YR','info')}
      </div>
      <div class="mp-strip">
        ${kpi('GW DEPTH (BGL)','73.3','','METERS')}
        ${kpi('GRACE ANOMALY','-2.66','danger','M EWH')}
        ${kpi('SOIL MOISTURE','28.6%','good','VOLUMETRIC')}
        ${kpi('DEPLETION RATE','-0.059','danger','M/DAY')}
        ${kpi('30-DAY FCST','70.9','warn','METERS')}
        ${kpi('90-DAY FCST','68.3','warn','METERS')}
        ${kpi('RECHARGE','0.85','good','M/YEAR')}
        ${kpi('RISK LEVEL','WARNING','warn','RECOVERING')}
      </div>
      <div class="mp-charts">
        <div class="mp-chart-box"><div class="mp-chart-title">90-DAY DEPTH FORECAST</div><div class="mp-chart-sub">METERS BGL · AI MODEL v3</div><canvas id="mpc-1" class="mp-canvas"></canvas></div>
        <div class="mp-chart-box"><div class="mp-chart-title">SOIL MOISTURE vs RECHARGE</div><div class="mp-chart-sub">% SATURATION · 30 DAYS</div><canvas id="mpc-2" class="mp-canvas"></canvas></div>
      </div>`;
  } else if (mod === 'reservoir') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">RESERVOIR STATUS //</span>
        ${pill('LIVE STORAGE: 84%','good')}
        ${pill('INFLOW 2,480 M³/S','info')}
        ${pill('OUTFLOW 1,840 M³/S','info')}
        ${pill('SILTATION: 12% VOLUME','warning')}
        ${pill('GATE STATUS: 6/24 OPEN','warning')}
      </div>
      <div class="mp-strip">
        ${kpi('LIVE STORAGE','84%','good','CAPACITY')}
        ${kpi('INFLOW','2,480','','M³/S')}
        ${kpi('OUTFLOW','1,840','','M³/S')}
        ${kpi('EVAPORATION','4.2','warn','MM/DAY')}
        ${kpi('SILTATION','12%','warn','VOL. REDUC.')}
        ${kpi('TURBIDITY','14 NTU','','')}
        ${kpi('GATE STATUS','6/24','warn','OPEN')}
        ${kpi('90-DAY PROJ.','SURPLUS','good','')}
      </div>
      <div class="mp-row" style="height:76px;border-bottom:1px solid var(--border)">
        ${prog('STORAGE LEVEL',84,'good')}
        ${prog('INFLOW CAPACITY',72,'warn')}
        ${prog('SILT REDUCTION',88,'good')}
        ${prog('OPERATIONAL GATES',25,'danger')}
        ${prog('WATER QUALITY',86,'good')}
      </div>`;
  } else if (mod === 'irrigation') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">AGRI-HYDROLOGY //</span>
        ${pill('ET₀ DEMAND: 6.2 MM/DAY','warning')}
        ${pill('NDVI: 0.82 ✓ HEALTHY','good')}
        ${pill('18% WATER SAVED','good')}
        ${pill('SOIL TENSION: 24 kPa','warning')}
        ${pill('FERTIGATION: AUTO','info')}
        ${pill('ROI: +$420/ACRE','good')}
      </div>
      <div class="mp-strip">
        <div class="mp-icon-row">
          <div class="mp-icon-cell"><span class="mp-icon-sym">🌾</span><span class="mp-icon-lbl">CROP HEALTH</span><span class="mp-icon-val" style="color:var(--accent)">0.82 NDVI</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">💧</span><span class="mp-icon-lbl">ET₀ DEMAND</span><span class="mp-icon-val" style="color:var(--warning)">6.2 MM/D</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">🌡️</span><span class="mp-icon-lbl">VPD DEFICIT</span><span class="mp-icon-val">1.4 kPa</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">🪱</span><span class="mp-icon-lbl">SOIL TENSION</span><span class="mp-icon-val" style="color:var(--warning)">24 kPa</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">💰</span><span class="mp-icon-lbl">PROFITABILITY</span><span class="mp-icon-val" style="color:var(--accent)">+$420/AC</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">⚗️</span><span class="mp-icon-lbl">FERTIGATION</span><span class="mp-icon-val" style="color:var(--accent)">AUTO</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">💦</span><span class="mp-icon-lbl">SAVINGS</span><span class="mp-icon-val" style="color:var(--accent)">18%</span></div>
          <div class="mp-icon-cell"><span class="mp-icon-sym">🤖</span><span class="mp-icon-lbl">AI OPTIMIZE</span><span class="mp-icon-val" style="color:var(--accent)">HIGH</span></div>
        </div>
      </div>
      <div class="mp-charts">
        <div class="mp-chart-box"><div class="mp-chart-title">EVAPOTRANSPIRATION DEMAND</div><div class="mp-chart-sub">MM/DAY · 30 DAYS</div><canvas id="mpc-1" class="mp-canvas"></canvas></div>
        <div class="mp-chart-box"><div class="mp-chart-title">NDVI VEGETATION VIGOR</div><div class="mp-chart-sub">SENTINEL-2 · 0.0 TO 1.0</div><canvas id="mpc-2" class="mp-canvas"></canvas></div>
      </div>`;
  } else if (mod === 'borewell') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">BOREWELL AI //</span>
        ${pill('SUCCESS PROB: 74%','warning')}
        ${pill('REC. DEPTH: 210M','info')}
        ${pill('SOIL: CLAY · VLF SCAN','info')}
        ${pill('DRILL METHOD: DTH PNEUMATIC','info')}
        ${pill('SITE: CLEAR ✓','good')}
      </div>
      <div class="mp-strip">
        ${kpi('SUCCESS PROB.','74%','warn','AI PREDICTED')}
        ${kpi('RISK LEVEL','MEDIUM','warn','GEOLOGICAL')}
        ${kpi('SOIL TYPE','CLAY','','VLF SCANNED')}
        ${kpi('REC. DEPTH','210 M','','TARGET')}
        ${kpi('WATER STRIKE','140 M','','PROJ. DEPTH')}
        ${kpi('DRILL METHOD','DTH','','PNEUMATIC')}
        ${kpi('AI CONFIDENCE','0.82','good','MODEL v4')}
        ${kpi('SITE STATUS','READY','good','CLEAR')}
      </div>
      <div class="mp-row" style="height:76px;border-bottom:1px solid var(--border)">
        ${prog('SUCCESS PROBABILITY',74,'warn')}
        ${prog('GEOLOGICAL STABILITY',61,'warn')}
        ${prog('AQUIFER REACHABILITY',82,'good')}
        ${prog('WATER QUALITY EXPECTED',78,'good')}
        ${prog('SITE RISK SCORE',38,'good')}
      </div>`;
  } else if (mod === 'drainage') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">DRAINAGE NETWORK //</span>
        ${pill('CAPACITY: 74% UTILISED','warning')}
        ${pill('FLOW: 1.42 M/S','info')}
        ${pill('NO ACOUSTIC LEAKS','good')}
        ${pill('BLOCKAGE RISK: 8%','info')}
        ${pill('RAIN FORECAST: MONITOR','warning')}
      </div>
      <div class="mp-status-bar">
        <div class="mp-status-item">${sdot('good')} NETWORK OPERATIONAL</div>
        <div class="mp-status-item">${sdot('warn')} 74% CAPACITY UTILISED</div>
        <div class="mp-status-item">${sdot('good')} NO ACTIVE LEAKS</div>
        <div class="mp-status-item">${sdot('warn')} RAIN FORECAST: HIGH</div>
        <div class="mp-status-item">${sdot('good')} SEWER GAS: NORMAL</div>
      </div>
      <div class="mp-strip">
        ${kpi('DRAINAGE CAP.','74%','warn','UTILISATION')}
        ${kpi('FLOW VELOCITY','1.42','','M/S')}
        ${kpi('RUNOFF COEFF.','0.68','warn','URBAN')}
        ${kpi('ACOUSTIC LEAK','NONE','good','ACTIVE SCAN')}
        ${kpi('BLOCKAGE RISK','8%','','AI SCORE')}
        ${kpi('WARD EQUITY','72%','warn','HEALTH IDX')}
        ${kpi('SEWER GAS','NORM','good','H2S LEVELS')}
        ${kpi('STATUS','MONITOR','warn','RAIN FCST')}
      </div>
      <div class="mp-charts">
        <div class="mp-chart-box"><div class="mp-chart-title">DRAINAGE FLOW — 24H FORECAST</div><div class="mp-chart-sub">M³/S · NETWORK CAPACITY</div><canvas id="mpc-1" class="mp-canvas"></canvas></div>
        <div class="mp-chart-box"><div class="mp-chart-title">RUNOFF ACCUMULATION</div><div class="mp-chart-sub">MM · 7-DAY TREND</div><canvas id="mpc-2" class="mp-canvas"></canvas></div>
      </div>`;
  } else if (mod === 'flood') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">⚠ FLOOD EARLY WARNING //</span>
        ${pill('🔴 RISK: 63% PROBABILITY','critical')}
        ${pill('RAINFALL: 180MM IN 3 DAYS','critical')}
        ${pill('RIVER: 4.82M — DANGER 6M','warning')}
        ${pill('84,000 PEOPLE AT RISK','critical')}
        ${pill('EVACUATION: 4/6 PATHS OPEN','warning')}
      </div>
      <div class="mp-row" style="height:58px;border-bottom:1px solid var(--border)">
        <div class="mp-flood-meter"><div class="mp-prog-lbl"><span>FLOOD RISK PROBABILITY</span><span style="color:var(--warning)">63%</span></div><div class="mp-flood-bar-wrap"><div class="mp-flood-bar" style="width:63%;background:linear-gradient(90deg,#ff6b00,#ff1744)"></div></div></div>
        <div class="mp-flood-meter"><div class="mp-prog-lbl"><span>RIVER LEVEL vs DANGER</span><span style="color:var(--warning)">4.82M / 6M</span></div><div class="mp-flood-bar-wrap"><div class="mp-flood-bar" style="width:80%;background:linear-gradient(90deg,#ff6b00,#ff1744)"></div></div></div>
        <div class="mp-flood-meter"><div class="mp-prog-lbl"><span>RESCUE READINESS</span><span style="color:var(--accent)">HIGH</span></div><div class="mp-flood-bar-wrap"><div class="mp-flood-bar" style="width:85%;background:linear-gradient(90deg,var(--accent),#00ff6e)"></div></div></div>
        <div class="mp-flood-meter"><div class="mp-prog-lbl"><span>SAFE EVACUATION PATHS</span><span style="color:var(--warning)">4/6</span></div><div class="mp-flood-bar-wrap"><div class="mp-flood-bar" style="width:67%;background:linear-gradient(90deg,#ff6b00,#ffb300)"></div></div></div>
      </div>
      <div class="mp-strip">
        ${kpi('FLOOD RISK','63%','warn','PROBABILITY')}
        ${kpi('RAIN FCST','180 MM','danger','3 DAYS')}
        ${kpi('RIVER LEVEL','4.82 M','warn','DANGER 6M')}
        ${kpi('SAFE PATHS','4/6','warn','AVAILABLE')}
        ${kpi('RESCUE','HIGH','good','LOGISTICS')}
        ${kpi('POPULATION','84,000','danger','AT RISK')}
        ${kpi('DIGITAL TWIN','SYNC','','STOCHASTIC')}
        ${kpi('ALERT LEVEL','HIGH','danger','EVACUATE')}
      </div>`;
  } else if (mod === 'aquifer') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">GRACE-FO SUBSURFACE //</span>
        ${pill('STORAGE: -8.42 KM³ ANOMALY','critical')}
        ${pill('RECHARGE: 0.84 M/YR','warning')}
        ${pill('WATER TABLE: -14.2M BELOW 2020','critical')}
        ${pill('OVEREXPLOITED — CRITICAL','critical')}
        ${pill('4D VOLUMETRIC: ACTIVE','info')}
      </div>
      <div class="mp-status-bar">
        <div class="mp-status-item">${sdot('danger')} AQUIFER: CRITICAL</div>
        <div class="mp-status-item">${sdot('danger')} STORAGE ANOMALY: -8.42 KM³</div>
        <div class="mp-status-item">${sdot('warn')}  RECHARGE: 0.84 M/YR</div>
        <div class="mp-status-item">${sdot('good')}  4D SCAN: ACTIVE</div>
        <div class="mp-status-item">${sdot('danger')} OVEREXPLOITATION DETECTED</div>
      </div>
      <div class="mp-strip">
        ${kpi('AQUIFER STORAGE','-8.42','danger','KM³ ANOMALY')}
        ${kpi('RECHARGE RATE','0.84','warn','M/YEAR')}
        ${kpi('THICKNESS','320 M','','')}
        ${kpi('HYDRAULIC COND.','2.4','','M/DAY')}
        ${kpi('WATER TABLE','-14.2 M','danger','BELOW 2020')}
        ${kpi('TRANSMISSIVITY','48','','M²/DAY')}
        ${kpi('4D VOLUMETRIC','ACTIVE','good','TIME-SERIES')}
        ${kpi('AQUIFER HEALTH','CRITICAL','danger','OVEREXPLOITED')}
      </div>
      <div class="mp-charts">
        <div class="mp-chart-box"><div class="mp-chart-title">GRACE-FO WATER STORAGE ANOMALY</div><div class="mp-chart-sub">KM³ · 12 MONTHS</div><canvas id="mpc-1" class="mp-canvas"></canvas></div>
        <div class="mp-chart-box"><div class="mp-chart-title">RECHARGE vs EXTRACTION BALANCE</div><div class="mp-chart-sub">MCM/MONTH</div><canvas id="mpc-2" class="mp-canvas"></canvas></div>
      </div>`;
  } else if (mod === 'crisis') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">🆘 CRISIS ENGINE //</span>
        ${pill('CRISIS PROB: 78% · 90-DAY','critical')}
        ${pill('STRESS INDEX: 8.2/10','critical')}
        ${pill('WATER DEFICIT: -1.4 KM³/YR','critical')}
        ${pill('GDP IMPACT: $840M PROJECTED','warning')}
        ${pill('FOOD SECURITY: 3 CROPS AT RISK','critical')}
      </div>
      <div class="mp-row" style="height:58px;border-bottom:1px solid var(--border)">
        <div class="mp-risk-dial"><div class="mp-dial-val" style="color:var(--danger)">78%</div><div class="mp-dial-info"><strong style="color:var(--text)">CRISIS PROBABILITY</strong>90-DAY WINDOW · AI ENGINE</div></div>
        <div class="mp-risk-dial"><div class="mp-dial-val" style="color:var(--danger)">8.2</div><div class="mp-dial-info"><strong style="color:var(--text)">STRESS INDEX</strong>OUT OF 10 · HIGH STRESS</div></div>
        <div class="mp-risk-dial"><div class="mp-dial-val" style="color:var(--danger)">-1.4</div><div class="mp-dial-info"><strong style="color:var(--text)">WATER DEFICIT KM³</strong>ANNUAL SHORTFALL</div></div>
        <div class="mp-risk-dial"><div class="mp-dial-val" style="color:var(--warning)">$840M</div><div class="mp-dial-info"><strong style="color:var(--text)">PROJECTED GDP LOSS</strong>ECONOMIC IMPACT MODEL</div></div>
        <div class="mp-risk-dial"><div class="mp-dial-val" style="color:var(--warning)">URGENT</div><div class="mp-dial-info"><strong style="color:var(--text)">POLICY ACTION</strong>ADAPTATION REQUIRED</div></div>
      </div>
      <div class="mp-charts">
        <div class="mp-chart-box"><div class="mp-chart-title">CLIMATE FORCING vs WATER AVAILABILITY</div><div class="mp-chart-sub">HISTORICAL vs PROJECTED</div><canvas id="mpc-1" class="mp-canvas"></canvas></div>
        <div class="mp-chart-box"><div class="mp-chart-title">MULTI-INDICATOR STRESS INDEX</div><div class="mp-chart-sub">GW · RAIN · DEMAND · TEMP · POLICY</div><canvas id="mpc-2" class="mp-canvas"></canvas></div>
      </div>`;
  } else if (mod === 'city_drainage') {
    html = `
      <div class="mp-alerts">
        <span class="mp-alert-label">URBAN NETWORK //</span>
        ${pill('23 DRAINS OVERLOADED','critical')}
        ${pill('300+ IoT SENSORS LIVE','good')}
        ${pill('EQUITY INDEX: 68/100','warning')}
        ${pill('FLOOD ETA: 18 HRS','warning')}
        ${pill('15 PUMP STATIONS ACTIVE','good')}
      </div>
      <div class="mp-status-bar">
        <div class="mp-status-item">${sdot('danger')} 23 CRITICAL DRAINS</div>
        <div class="mp-status-item">${sdot('good')}  IoT NETWORK: 300+ LIVE</div>
        <div class="mp-status-item">${sdot('warn')}  EQUITY: 68/100</div>
        <div class="mp-status-item">${sdot('warn')}  FLOOD ETA: 18 HRS</div>
        <div class="mp-status-item">${sdot('good')}  SLA COMPLIANCE: 84%</div>
      </div>
      <div class="mp-strip">
        ${kpi('OVERLOADED','23','danger','CRITICAL DRAINS')}
        ${kpi('IoT SENSORS','300+','good','LIVE')}
        ${kpi('EQUITY INDEX','68/100','warn','CITY AVG')}
        ${kpi('TICKETS RESOLVED','84%','good','SLA COMPLIANT')}
        ${kpi('PEAK FLOW','1.4 M/S','','')}
        ${kpi('FLOOD ETA','18 HRS','warn','WARNING')}
        ${kpi('PUMP STATIONS','15 ACTIVE','good','')}
        ${kpi('SYSTEM STATUS','STRESSED','danger','MONITORING')}
      </div>`;
  }

  panel.innerHTML = html;

  // Draw charts after render
  requestAnimationFrame(() => {
    const c1 = document.getElementById('mpc-1');
    const c2 = document.getElementById('mpc-2');
    const chartTypes = {
      groundwater:  ['depth_forecast','soil_moisture'],
      irrigation:   ['et_demand','ndvi_trend'],
      drainage:     ['drainage_flow','runoff'],
      aquifer:      ['grace_anomaly','recharge_balance'],
      crisis:       ['crisis_prob','stress_index'],
    };
    const types = chartTypes[mod];
    if (types && c1) {
      c1.width = c1.offsetWidth * 2; c1.height = 136;
      const ctx1 = c1.getContext('2d'); ctx1.scale(2, 1);
      renderChart(ctx1, c1.offsetWidth, 68, types[0], cfg.color);
    }
    if (types && c2) {
      c2.width = c2.offsetWidth * 2; c2.height = 136;
      const ctx2 = c2.getContext('2d'); ctx2.scale(2, 1);
      renderChart(ctx2, c2.offsetWidth, 68, types[1], cfg.color);
    }
  });
}

function getModulePanelHost(mod) {
  return document.getElementById('right-module-panel');
}


function renderLeftPanel(mod, cfg) {
  const leftPanel = document.querySelector('.panel-left');
  if (!leftPanel) return;

  if (mod === 'godseyeview') {
    leftPanel.innerHTML = `
      <div class="panel-section">
        <div class="panel-title">GLOBAL STATUS</div>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">AQUIFER ZONES</div>
            <div class="stat-value warn" id="gs-zones">847</div>
            <div class="stat-unit">MONITORED</div>
            <div class="stat-delta down" id="gs-zones-delta">↓ 3.2% THIS MONTH</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">CRITICAL ALERTS</div>
            <div class="stat-value danger" id="alert-count">3</div>
            <div class="stat-unit">ACTIVE NOW</div>
            <div class="stat-delta down" id="gs-alerts-delta">↑ 2 NEW TODAY</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">BOREWELLS PRED.</div>
            <div class="stat-value good" id="gs-borewells">1,247</div>
            <div class="stat-unit">SITES SCANNED</div>
            <div class="stat-delta up">↑ 89 TODAY</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">SATELLITE PASS</div>
            <div class="stat-value" id="gs-sat">12</div>
            <div class="stat-unit">ACTIVE ORBITS</div>
            <div class="stat-delta up">● SYNCING</div>
          </div>
        </div>

        <div style="margin-top:10px;">
          <div class="panel-title">GROUNDWATER INDEX — 30D</div>
          <div class="mini-chart" id="mini-chart"></div>
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-title">INTELLIGENCE FEED</div>
      </div>
      <div class="alert-feed" id="alert-feed"></div>
    `;
    buildMiniChart();
    buildAlertFeed();
    return;
  }

  const metrics = (cfg && Array.isArray(cfg.metrics) ? cfg.metrics : []).slice(0, 6);
  const cards = metrics.map((m, i) => `
    <div class="stat-card">
      <div class="stat-label" id="ml-${i}">${m.l}</div>
      <div class="stat-value ${m.cls || ''}" id="mv-${i}">${m.v}</div>
      <div class="stat-unit" id="mu-${i}">${m.u || ''}</div>
      <div class="stat-delta ${m.cls === 'danger' ? 'down' : 'up'}">${m.cls === 'danger' ? 'ALERT' : 'TRACKING'}</div>
    </div>
  `).join('');


  const moduleFeed = (cfg && Array.isArray(cfg.charts) ? cfg.charts : []).map((c, i) => `
    <div class="alert-item">
      <div class="alert-header">
        <span class="alert-badge badge-info">MODEL ${i + 1}</span>
        <span class="alert-type">${(c.type || 'telemetry').toUpperCase().replaceAll('_', ' ')}</span>
        <span class="alert-time">LIVE</span>
      </div>
      <div class="alert-title">${c.t}</div>
      <div class="alert-desc">${c.s}</div>
    </div>
  `).join('');

  leftPanel.innerHTML = `
    <div class="panel-section">
      <div class="panel-title">${cfg.tag} STATUS</div>
      <div class="stat-grid">
        ${cards || '<div class="stat-card"><div class="stat-label">NO METRICS</div><div class="stat-value">--</div><div class="stat-unit">WAITING DATA</div></div>'}
      </div>
      <div style="margin-top:10px;">
        <div class="panel-title">LIVE TELEMETRY SNAPSHOT</div>
        <div class="mini-chart" id="mini-chart"></div>
      </div>
    </div>
    <div class="panel-section">
      <div class="panel-title">MODULE INTELLIGENCE FEED</div>
      <div style="display:none" id="alert-count">3</div>
    </div>
    <div class="alert-feed" id="alert-feed">
      ${moduleFeed || '<div class="alert-item"><div class="alert-title">No module feed available</div></div>'}
    </div>
  `;
  buildMiniChart();
}

async function fetchNearbyReservoirs(lat, lon) {
  try {
    const r = await fetch(`${API_BASE}/reservoirs/nearby?lat=${lat}&lon=${lon}&radius=200`);
    const data = await r.json();
    const cfg = MODULES['reservoir'];
    
    if (data && data.length > 0) {
      const res = data[0];
      const totalCap = data.reduce((sum, d) => sum + (d.capacity_mcm || 0), 0);
      
      cfg.metrics[0].v = data.length.toString();
      cfg.metrics[1].v = totalCap > 0 ? totalCap.toLocaleString() : "UNKNOWN";
      cfg.metrics[2].v = (res.name || "UNKNOWN").substring(0, 14).toUpperCase();
      cfg.metrics[2].u = "RVR: " + (res.river || "UNKNOWN").substring(0, 9).toUpperCase();
      cfg.metrics[3].v = (65 + Math.random()*15).toFixed(1) + "%"; // Live Mock level
      
      populateMetrics(cfg.metrics);
      document.getElementById('loc-name').value = res.name + ", " + res.state;
      renderReservoirMapExperience(lat, lon, data);
      
    } else {
      cfg.metrics[0].v = "0";
      cfg.metrics[1].v = "0";
      cfg.metrics[2].v = "NONE";
      cfg.metrics[2].u = "---";
      cfg.metrics[3].v = "N/A";
      populateMetrics(cfg.metrics);
      renderReservoirMapExperience(lat, lon, []);
    }
  } catch(e) {
    console.error("Reservoir fetch failed", e);
    renderReservoirMapExperience(lat, lon, []);
  }
}

function renderReservoirMapExperience(lat, lon, reservoirs) {
  if (!centerMap) return;
  const list = (Array.isArray(reservoirs) && reservoirs.length > 0)
    ? reservoirs.slice(0, 5).map((r, i) => ({
        id: r.id || `res-${i}`,
        name: r.name || `Reservoir ${i + 1}`,
        lat: Number(r.lat || r.latitude || (lat + ((Math.random() - 0.5) * 0.2))),
        lon: Number(r.lon || r.longitude || (lon + ((Math.random() - 0.5) * 0.2))),
        capacity_mcm: Number(r.capacity_mcm || (80 + Math.random() * 260)),
        criticality: Number(r.criticality || (35 + Math.random() * 55)),
      }))
    : Array.from({ length: 4 }, (_, i) => ({
        id: `sim-${i}`,
        name: `Nearby Reservoir ${i + 1}`,
        lat: lat + ((Math.random() - 0.5) * 0.16),
        lon: lon + ((Math.random() - 0.5) * 0.16),
        capacity_mcm: 120 + Math.random() * 220,
        criticality: 40 + Math.random() * 45,
      }));

  if (reservoirLayerGroup && centerMap) centerMap.removeLayer(reservoirLayerGroup);
  reservoirLayerGroup = L.layerGroup().addTo(centerMap);

  list.forEach((res) => {
    const col = res.criticality > 72 ? '#ff1744' : res.criticality > 48 ? '#ff6b00' : '#39ff14';
    L.circleMarker([res.lat, res.lon], {
      radius: 7,
      color: col,
      fillColor: col,
      fillOpacity: 0.38,
      weight: 1.5,
    }).bindPopup(`
      <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:#c8f4ff;">
        <div style="color:${col};font-weight:700;">${res.name.toUpperCase()}</div>
        <div>CAP: ${res.capacity_mcm.toFixed(0)} MCM</div>
        <div>CRITICALITY: ${res.criticality.toFixed(0)} / 100</div>
        <div style="margin-top:6px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lon}" target="_blank" style="color:#00e5ff;">OPEN DIRECTIONS ↗</a>
        </div>
      </div>
    `).addTo(reservoirLayerGroup);
    L.polyline([[lat, lon], [res.lat, res.lon]], {
      color: 'rgba(0,229,255,.45)',
      weight: 1,
      dashArray: '4 7',
    }).addTo(reservoirLayerGroup);
  });

  renderReservoirBottomCards(list, lat, lon);
  updateReservoirHoverStatus(list);

  if (!reservoirMoveHandlerBound) {
    centerMap.on('moveend', () => {
      if (currentModule === 'reservoir') updateReservoirHoverStatus(list);
    });
    reservoirMoveHandlerBound = true;
  }
}

function renderReservoirBottomCards(list, fromLat, fromLon) {
  const container = document.getElementById('map-bottom-cards');
  if (!container) return;
  if (currentModule !== 'reservoir') {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = list.slice(0, 3).map((res) => {
    const distKm = centerMap ? (centerMap.distance([fromLat, fromLon], [res.lat, res.lon]) / 1000) : 0;
    return `
      <div class="map-bottom-card">
        <div class="name">${res.name.toUpperCase()}</div>
        <div>DIST: ${distKm.toFixed(1)} km</div>
        <div>CAP: ${res.capacity_mcm.toFixed(0)} MCM</div>
        <div>RISK: ${res.criticality.toFixed(0)} / 100</div>
      </div>
    `;
  }).join('');
}

function updateReservoirHoverStatus(list) {
  const card = document.getElementById('map-hover-status-card');
  if (!card) return;
  if (currentModule !== 'reservoir' || !centerMap || !list.length) {
    card.innerHTML = '';
    return;
  }
  const c = centerMap.getCenter();
  const nearest = list.slice().sort((a, b) => {
    const da = centerMap.distance([c.lat, c.lng], [a.lat, a.lon]);
    const db = centerMap.distance([c.lat, c.lng], [b.lat, b.lon]);
    return da - db;
  })[0];
  const nearestDist = centerMap.distance([c.lat, c.lng], [nearest.lat, nearest.lon]) / 1000;
  card.innerHTML = `
    <div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">RESERVOIR STATUS PANEL</div>
    <div>FOCUS: <span style="color:var(--primary);">${nearest.name.toUpperCase()}</span></div>
    <div>DISTANCE: ${nearestDist.toFixed(1)} km</div>
    <div>CAPACITY: ${nearest.capacity_mcm.toFixed(0)} MCM</div>
    <div>CRITICALITY: <span style="color:${nearest.criticality > 70 ? 'var(--danger)' : nearest.criticality > 45 ? 'var(--warning)' : 'var(--accent)'};">${nearest.criticality.toFixed(0)} / 100</span></div>
  `;
}

async function fetchBorewellDetails(lat, lon) {
  try {
    const r = await fetch(`${API_BASE}/borewell/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: lat, lon: lon })
    });
    const data = await r.json();
    if (!data || data.error) throw new Error(data.error || "Prediction failed");
    
    const cfg = MODULES['borewell'];
    
    // Distribute variables into metrics with safety defaults
    const prob = data.success_probability !== undefined ? (data.success_probability * 100).toFixed(0) : "72";
    cfg.metrics[0].v = prob + "%";
    cfg.metrics[1].v = data.risk_level || "MEDIUM";
    cfg.metrics[2].v = (data.soil_type || "red").toUpperCase();
    cfg.metrics[3].v = (data.recommended_depth_m || 210) + "M";
    cfg.metrics[4].v = data.machinery_recommended || "DTH RIG";
    cfg.metrics[5].v = data.drilling_method || "PNEUMATIC";
    cfg.metrics[6].v = (data.confidence_score || 0.72).toFixed(2);
    
    populateMetrics(cfg.metrics);
    startBorewellTelemetryStream(lat, lon);
    
    // Update Why? explainability (future work: show d.recommendation)
    console.log("Borewell logic:", data.recommendation);
  } catch(e) { console.error("Borewell fetch failed", e); }
}

function stopBorewellTelemetryStream() {
  if (borewellTelemetrySocket) {
    try {
      borewellTelemetrySocket.close();
    } catch (_) {}
  }
  borewellTelemetrySocket = null;
  activeBorewellStreamId = null;
}

function startBorewellTelemetryStream(lat, lon) {
  const streamId = `BW-${lat.toFixed(3)}-${lon.toFixed(3)}`;
  if (activeBorewellStreamId === streamId && borewellTelemetrySocket) return;
  stopBorewellTelemetryStream();
  activeBorewellStreamId = streamId;

  const wsBase = (window.location.origin && window.location.origin !== 'null')
    ? window.location.origin.replace(/^http/i, 'ws')
    : 'ws://localhost:8001';
  const wsUrl = `${wsBase}/ws/telemetry/${encodeURIComponent(streamId)}`;

  try {
    borewellTelemetrySocket = new WebSocket(wsUrl);
  } catch (err) {
    console.error('Failed to initialize borewell telemetry stream', err);
    return;
  }

  borewellTelemetrySocket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const reading = msg && msg.data ? msg.data : null;
      if (!reading || currentModule !== 'borewell') return;
      applyBorewellTelemetryToUI(reading);
      updateBorewellDiggingModel(reading);
    } catch (err) {
      console.error('Failed parsing borewell telemetry event', err);
    }
  };

  borewellTelemetrySocket.onerror = (event) => {
    console.error('Borewell telemetry stream error', event);
  };

  borewellTelemetrySocket.onclose = () => {
    if (currentModule === 'borewell' && activeBorewellStreamId === streamId) {
      setTimeout(() => {
        if (currentModule === 'borewell' && activeBorewellStreamId === streamId) {
          startBorewellTelemetryStream(lat, lon);
        }
      }, 1500);
    }
  };
}

function applyBorewellTelemetryToUI(reading) {
  const rpm = Number(reading.rpm || 0);
  const dynamicLevel = Number(reading.dynamic_level_m || 0);
  const yieldLps = Number(reading.yield_lps || 0);
  const efficiency = Number(reading.efficiency_pct || 0);
  const temperature = Number(reading.motor_temp_c || 0);
  const powerKw = Number(reading.power_kw || 0);

  const cfg = MODULES['borewell'];
  if (!cfg || !cfg.metrics || cfg.metrics.length < 8) return;

  cfg.metrics[3].v = `${dynamicLevel.toFixed(1)} M`;
  cfg.metrics[4].v = `${rpm.toFixed(0)} RPM`;
  cfg.metrics[5].v = `${yieldLps.toFixed(2)} LPS`;
  cfg.metrics[6].v = `${(efficiency / 100).toFixed(2)}`;
  cfg.metrics[7].v = temperature > 58 ? 'HOT' : 'READY';
  cfg.metrics[7].u = `${temperature.toFixed(1)}C / ${powerKw.toFixed(1)}KW`;
  cfg.metrics[7].cls = temperature > 58 ? 'warn' : 'good';

  populateMetrics(cfg.metrics);
}

function setLocationBar(lat, lon, name) {
  document.getElementById('loc-lat').value  = lat;
  document.getElementById('loc-lon').value  = lon;
  document.getElementById('loc-name').value = name;
}

// ──────────────────────────────────────────────────────────
// ANALYZE / FLY-TO
// ──────────────────────────────────────────────────────────
function analyzeLocation() {
  const lat  = parseFloat(document.getElementById('loc-lat').value);
  const lon  = parseFloat(document.getElementById('loc-lon').value);
  const name = document.getElementById('loc-name').value.trim() || `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;

  if (isNaN(lat) || isNaN(lon)) return;

  flyToLatLon(lat, lon, name);

  // If we're on a module, also fetch live API
  if (currentModule !== 'godseyeview') {
    fetchModuleData(currentModule, lat, lon);
  }
  refreshGeoIntelligence(currentModule, lat, lon, name, false);
}

function flyToLatLon(lat, lon, name, zoom) {
  if (!centerMap) return;
  const cfg   = MODULES[currentModule] || MODULES['godseyeview'];
  const z     = zoom || cfg.zoom || 10;
  const color = cfg.color || '#00e5ff';

  // Smooth fly
  centerMap.flyTo([lat, lon], z, { duration: 1.2, easeLinearity: 0.25 });

  // Move main marker
  mainMarker.setLatLng([lat, lon]);
  mainMarker.setPopupContent(`
    <div style="font-family:'Share Tech Mono',monospace;color:${color};font-size:10px;">
      <div style="font-weight:700;margin-bottom:4px;letter-spacing:1px;">◎ ${name.toUpperCase()}</div>
      <div style="color:rgba(200,244,255,0.6);">LAT: ${lat.toFixed(4)}°N</div>
      <div style="color:rgba(200,244,255,0.6);">LON: ${lon.toFixed(4)}°E</div>
    </div>
  `);

  // Move scan circles & recolor
  scanCircle.setLatLng([lat, lon]).setStyle({ color, fillColor: color });
  outerRing.setLatLng([lat, lon]).setStyle({ color });

  // Update all HUD elements
  updateHUD(lat, lon, name, color);
  updateRightPanel(lat, lon, name);

  // Blink status
  setStatus('ANALYZING...', 'busy');
  setTimeout(() => setStatus('OPERATIONAL', ''), 2000);
}

function onCoordInput() {
  // live crosshair sync — only move map when both fields are valid numbers
  const lat = parseFloat(document.getElementById('loc-lat').value);
  const lon = parseFloat(document.getElementById('loc-lon').value);
  if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
    document.getElementById('hud-coords').textContent = `${lat.toFixed(3)}°N / ${lon.toFixed(3)}°E`;
  }
}

// ──────────────────────────────────────────────────────────
// GEOLOCATION
// ──────────────────────────────────────────────────────────
function geolocate() {
  if (!navigator.geolocation) { setStatus('GPS UNAVAILABLE', 'error'); return; }
  setStatus('ACQUIRING GPS...', 'busy');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lon = parseFloat(pos.coords.longitude.toFixed(4));
      document.getElementById('loc-lat').value = lat;
      document.getElementById('loc-lon').value = lon;
      
      // Reverse geocode to get name
      reverseGeocode(lat, lon).then(() => {
        const name = document.getElementById('loc-name').value;
        // In godseyeview, zoom to local level (e.g. 12)
        const localZoom = currentModule === 'godseyeview' ? 12 : (MODULES[currentModule]?.zoom || 12);
        flyToLatLon(lat, lon, name, localZoom);
        refreshGeoIntelligence(currentModule, lat, lon, name, false);
      });
    },
    err => { setStatus('GPS ERROR', 'error'); setTimeout(()=>setStatus('READY',''),3000); }
  );
}


function hashFromLatLon(lat, lon) {
  const x = Math.sin((lat * 12.9898) + (lon * 78.233)) * 43758.5453;
  return x - Math.floor(x);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function generateGeoIntelligence(mod, lat, lon, forceSim = false) {
  const seed = hashFromLatLon(lat, lon);
  const terrain = clamp(((Math.sin(lat / 6) + 1) * 0.5) + (forceSim ? 0.1 : 0), 0, 1);
  const coastal = clamp((Math.cos(lon / 8) + 1) * 0.5, 0, 1);
  const rainfall = clamp(420 + (seed * 1100) + (terrain * 140), 200, 2200);
  const elevation = clamp(40 + (terrain * 760), 5, 1800);
  const urbanDensity = clamp(((Math.sin(lon / 4) + 1) * 50) + (seed * 35), 8, 98);
  const gwDepth = clamp(22 + (urbanDensity * 0.55) - (rainfall / 85) + (forceSim ? 4 : 0), 8, 95);
  const recharge = clamp((rainfall / 1800) * (1 - (urbanDensity / 140)), 0.08, 0.95);
  const floodProb = clamp((rainfall / 2200) * 0.6 + coastal * 0.3 + (urbanDensity / 200), 0.05, 0.96);
  const droughtProb = clamp((gwDepth / 100) * 0.55 + ((1 - recharge) * 0.45), 0.05, 0.97);
  const waterSecurity = clamp(100 - (gwDepth * 0.7) - (floodProb * 18) + (recharge * 30), 8, 99);
  const riskIndex = clamp((floodProb * 45) + (droughtProb * 45) + ((urbanDensity / 100) * 10), 5, 99);

  const moduleRisk = {
    godseyeview: riskIndex,
    groundwater: clamp((gwDepth * 0.9) + (droughtProb * 18), 5, 99),
    reservoir: clamp((floodProb * 60) + (urbanDensity * 0.3), 5, 99),
    irrigation: clamp((droughtProb * 65) + ((1 - recharge) * 20), 5, 99),
    borewell: clamp((gwDepth * 0.95) + ((1 - recharge) * 18), 5, 99),
    drainage: clamp((floodProb * 72) + (urbanDensity * 0.25), 5, 99),
    flood: clamp((floodProb * 85) + (coastal * 10), 5, 99),
    aquifer: clamp((gwDepth * 0.92) + ((1 - recharge) * 25), 5, 99),
    crisis: clamp((riskIndex * 0.92) + (coastal * 6), 5, 99),
    city_drainage: clamp((floodProb * 70) + (urbanDensity * 0.28), 5, 99),
  };

  return {
    lat, lon, rainfall, elevation, urbanDensity, coastal, terrain,
    groundwaterDepth: gwDepth,
    rechargeRate: recharge,
    floodProbability: floodProb,
    droughtProbability: droughtProb,
    waterSecurityScore: waterSecurity,
    regionalRiskIndex: riskIndex,
    moduleRiskScore: moduleRisk[mod] || riskIndex,
    climateAnomaly: ((rainfall - 900) / 900) + (coastal * 0.2),
    hazards: {
      tsunami: coastal > 0.75 ? coastal * 0.9 : 0,
      cyclone: coastal > 0.5 ? coastal * 0.7 : 0,
      flood: floodProb,
      drought: droughtProb
    }
  };
}


function applyGeoIntelligenceToModule(mod, intel) {
  const cfg = MODULES[mod];
  if (!cfg || !cfg.metrics) return;
  const riskTag = intel.moduleRiskScore > 70 ? 'HIGH' : intel.moduleRiskScore > 45 ? 'MED' : 'LOW';

  if (mod === 'groundwater' || mod === 'aquifer') {
    cfg.metrics[0].v = `${intel.groundwaterDepth.toFixed(1)}`;
    cfg.metrics[1].v = `${(intel.rechargeRate * 100).toFixed(0)}%`;
    cfg.metrics[7].v = riskTag;
  } else if (mod === 'borewell') {
    cfg.metrics[0].v = `${clamp(100 - intel.moduleRiskScore, 10, 95).toFixed(0)}%`;
    cfg.metrics[3].v = `${Math.round(intel.groundwaterDepth * 2.8)} M`;
    cfg.metrics[7].v = riskTag === 'HIGH' ? 'CAUTION' : 'READY';
  } else if (mod === 'reservoir') {
    cfg.metrics[0].v = `${clamp(92 - intel.moduleRiskScore * 0.6, 20, 96).toFixed(0)}%`;
    cfg.metrics[7].v = riskTag;
  } else if (mod === 'drainage' || mod === 'city_drainage') {
    cfg.metrics[0].v = `${clamp(60 + (intel.floodProbability * 30), 30, 98).toFixed(0)}%`;
    cfg.metrics[7].v = riskTag;
  } else if (mod === 'flood' || mod === 'crisis') {
    cfg.metrics[0].v = `${(intel.floodProbability * 100).toFixed(0)}%`;
    cfg.metrics[7].v = riskTag;
  } else if (mod === 'irrigation') {
    cfg.metrics[0].v = `${clamp(3.5 + (intel.urbanDensity / 40), 2, 8).toFixed(1)}`;
    cfg.metrics[7].v = riskTag;
  }

  populateMetrics(cfg.metrics);
}

function renderMapIntelligenceCard(mod, intel, locationName) {
  const card = document.getElementById('map-intelligence-card');
  if (!card) return;
  const riskColor = intel.moduleRiskScore > 70 ? 'var(--danger)' : intel.moduleRiskScore > 45 ? 'var(--warning)' : 'var(--accent)';
  
  card.innerHTML = `
    <div style="background:rgba(2,8,16,0.85); border:1px solid var(--border-s); padding:10px; border-radius:4px; backdrop-filter:blur(10px); box-shadow:0 0 20px rgba(0,0,0,0.5);">
      <div class="mic-title" style="border-bottom:1px solid rgba(0,229,255,0.3); padding-bottom:5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>TACTICAL OVERLAY · ${mod.toUpperCase().replaceAll('_', ' ')}</span>
        <span style="font-size:8px; color:var(--accent); border:1px solid var(--accent); padding:1px 4px; border-radius:2px;">SECURE LINK</span>
      </div>
      <div class="mic-row" style="margin-bottom:6px;"><span style="font-size:10px; opacity:0.6;">COORDINATES</span><strong style="font-size:11px; color:var(--primary); font-family:'Share Tech Mono';">${intel.lat.toFixed(4)} N / ${intel.lon.toFixed(4)} E</strong></div>
      <div class="mic-row"><span>LOCATION</span><strong style="color:var(--text);">${(locationName || 'Active Region').toUpperCase().slice(0, 30)}</strong></div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.05);">
        <div>
          <div style="font-size:9px; color:var(--text-dim);">WATER SECURITY</div>
          <div style="font-size:16px; font-weight:700; color:var(--primary);">${intel.waterSecurityScore.toFixed(0)}<span style="font-size:10px; font-weight:400; opacity:0.5;">/100</span></div>
        </div>
        <div>
          <div style="font-size:9px; color:var(--text-dim);">RISK INDEX</div>
          <div style="font-size:16px; font-weight:700; color:${riskColor};">${intel.moduleRiskScore.toFixed(0)}%</div>
        </div>
      </div>
      
      <div style="margin-top:10px; font-size:9px; font-family:'Share Tech Mono'; color:var(--text-dim); display:flex; gap:10px;">
        <span>DEPTH: <span style="color:var(--text);">${intel.groundwaterDepth.toFixed(1)}m</span></span>
        <span>RECHARGE: <span style="color:var(--text);">${(intel.rechargeRate * 100).toFixed(0)}%</span></span>
      </div>
    </div>
  `;
}

function clearPhase2Overlays() {
  if (centerMap && phase2LayerGroup) {
    centerMap.removeLayer(phase2LayerGroup);
  }
  phase2LayerGroup = null;
}

function getScenarioTemporalProfile() {
  const profiles = {
    normal: { intervalMs: 2200, waveDiv: 2.3, amp: 1.0, riskBias: 0, floodBias: 0, droughtBias: 0 },
    overuse: { intervalMs: 1400, waveDiv: 1.9, amp: 1.35, riskBias: 7, floodBias: -0.02, droughtBias: 0.06 },
    leak: { intervalMs: 1200, waveDiv: 1.5, amp: 1.5, riskBias: 10, floodBias: 0.08, droughtBias: -0.01 },
    contamination: { intervalMs: 900, waveDiv: 1.25, amp: 1.85, riskBias: 16, floodBias: 0.11, droughtBias: 0.02 },
  };
  return profiles[currentScenario] || profiles.normal;
}

function getTemporalIntel(baseIntel, tick) {
  const profile = getScenarioTemporalProfile();
  const wave = Math.sin(tick / profile.waveDiv) * profile.amp;
  return {
    ...baseIntel,
    groundwaterDepth: clamp(baseIntel.groundwaterDepth + (wave * 1.4), 6, 110),
    rechargeRate: clamp(baseIntel.rechargeRate + (wave * 0.02), 0.05, 0.98),
    floodProbability: clamp(baseIntel.floodProbability + (wave * 0.03) + profile.floodBias, 0.03, 0.99),
    droughtProbability: clamp(baseIntel.droughtProbability - (wave * 0.02) + profile.droughtBias, 0.03, 0.99),
    moduleRiskScore: clamp(baseIntel.moduleRiskScore + (wave * 2.2) + profile.riskBias, 3, 99),
    waterSecurityScore: clamp(baseIntel.waterSecurityScore - (wave * 1.6), 3, 99),
  };
}

function renderPhase2Overlays(mod, lat, lon, intel, tick = 0) {
  if (!centerMap) return;
  clearPhase2Overlays();
  phase2LayerGroup = L.layerGroup().addTo(centerMap);
  const timeShift = (tick % 24) / 24;

  if (mod === 'godseyeview') {
    const zoom = centerMap.getZoom();
    const nodeCount = zoom < 6 ? 25 : 12;
    const spread = zoom < 6 ? 80 : (20 / Math.pow(2, zoom - 6));
    
    const globalNodes = Array.from({ length: nodeCount }, (_, i) => {
      const seed = hashFromLatLon(lat + i, lon - i);
      const angle = (i / nodeCount) * Math.PI * 2 + (tick * 0.02);
      const dist = spread * (0.3 + seed * 0.7);
      return { 
        lat: lat + Math.sin(angle) * dist, 
        lon: lon + Math.cos(angle) * (dist * 1.2),
        sev: seed > 0.85 ? 'danger' : (seed > 0.6 ? 'warn' : 'primary')
      };
    });

    globalNodes.forEach((n, i) => {
      const col = varColor('--' + n.sev);
      L.circleMarker([n.lat, n.lon], {
        radius: 3 + Math.sin(tick * 0.15 + i) * 1.5,
        color: col,
        fillColor: col,
        fillOpacity: 0.35,
        weight: 1,
      }).addTo(phase2LayerGroup);

      L.polyline([[lat, lon], [n.lat, n.lon]], {
        color: col,
        weight: 0.6,
        opacity: 0.15,
        dashArray: '3 6',
      }).addTo(phase2LayerGroup);

      const t = (timeShift + (i * 0.13)) % 1;
      const pLat = lat + (n.lat - lat) * t;
      const pLon = lon + (n.lon - lon) * t;
      L.circleMarker([pLat, pLon], {
        radius: 2,
        color: varColor('--accent'),
        fillColor: varColor('--accent'),
        fillOpacity: 0.9,
        weight: 0,
      }).addTo(phase2LayerGroup);
    });
  }


  if (mod === 'groundwater') {
    const contourLevels = [0.55, 0.75, 1];
    contourLevels.forEach((f, i) => {
      L.circle([lat, lon], {
        radius: (1600 + (i * 1300)) * (1 + intel.groundwaterDepth / 120) * (1 + (Math.sin((tick / 2) + i) * 0.05)),
        color: i === 2 ? '#ff6b00' : '#00e5ff',
        fillColor: i === 2 ? '#ff6b00' : '#00e5ff',
        fillOpacity: 0.06 * f,
        opacity: 0.35,
        weight: 1.2,
        dashArray: i === 2 ? '6 6' : '0',
      }).bindTooltip(`Aquifer Layer ${i+1} | Depth: ${intel.groundwaterDepth.toFixed(1)}m | Trend: ${i===2?'CRITICAL':'STABLE'}`, { sticky: true }).addTo(phase2LayerGroup);
    });
    for (let i = 0; i < 10; i++) {
      const jitterLat = lat + ((Math.random() - 0.5) * 0.08);
      const jitterLon = lon + ((Math.random() - 0.5) * 0.08);
      L.circleMarker([jitterLat, jitterLon], {
        radius: 2 + Math.random() * 3,
        color: '#39ff14',
        fillColor: '#39ff14',
        fillOpacity: 0.35,
        weight: 0.8,
      }).addTo(phase2LayerGroup);
    }
  }

  if (mod === 'borewell') {
    L.circle([lat, lon], {
      radius: 420,
      color: '#ff6b00',
      fillColor: '#ff6b00',
      fillOpacity: 0.18,
      weight: 2,
    }).bindTooltip(`Borewell Radius of Influence | ${Math.round(intel.groundwaterDepth * 2.8)}m Target Depth`, { sticky: true }).addTo(phase2LayerGroup);
    L.circle([lat, lon], {
      radius: 900 + (intel.groundwaterDepth * 8),
      color: '#00e5ff',
      fillColor: '#00e5ff',
      fillOpacity: 0.05,
      weight: 1,
      dashArray: '5 8',
    }).addTo(phase2LayerGroup);
    const offsets = [0.01, -0.015, 0.02, -0.012];
    offsets.forEach((o, i) => {
      L.polyline([[lat + o, lon - 0.03], [lat + o * 0.4, lon], [lat + o, lon + 0.03]], {
        color: i % 2 === 0 ? 'rgba(255,107,0,0.6)' : 'rgba(0,229,255,0.45)',
        weight: 1.3,
      }).addTo(phase2LayerGroup);
      const t = (timeShift + (i * 0.17)) % 1;
      const pathA = [lat + o, lon - 0.03];
      const pathB = [lat + o * 0.4, lon];
      const segLat = pathA[0] + ((pathB[0] - pathA[0]) * t);
      const segLon = pathA[1] + ((pathB[1] - pathA[1]) * t);
      L.circleMarker([segLat, segLon], {
        radius: 2.8,
        color: '#00e5ff',
        fillColor: '#00e5ff',
        fillOpacity: 0.8,
        weight: 0.7,
      }).addTo(phase2LayerGroup);
    });
    L.marker([lat, lon], {
      icon: L.divIcon({
        className: '',
        html: `<div style="font-family:'Share Tech Mono',monospace;color:#ff6b00;background:rgba(2,8,16,.85);border:1px solid #ff6b00;padding:2px 6px;font-size:9px;">DRILL CORE • ${Math.round(intel.groundwaterDepth * 2.8)}m</div>`,
      }),
    }).addTo(phase2LayerGroup);
  }

  if (mod === 'flood') {
    const bands = [0.35, 0.55, 0.8];
    bands.forEach((b, i) => {
      L.circle([lat + (i * 0.01), lon + (i * 0.015)], {
        radius: 900 + (i * 1000) + (intel.floodProbability * 1600),
        color: i === 2 ? '#ff1744' : '#ff6b00',
        fillColor: i === 2 ? '#ff1744' : '#ff6b00',
        fillOpacity: 0.07 * b,
        weight: 1.2,
      }).bindTooltip(`Flood Risk Zone ${i+1} | Prob: ${(intel.floodProbability * 100).toFixed(0)}%`, { sticky: true }).addTo(phase2LayerGroup);
    });
    const riverPath = [
      [lat - 0.05, lon - 0.07],
      [lat - 0.01, lon - 0.03],
      [lat + 0.03, lon + 0.01],
      [lat + 0.07, lon + 0.08],
    ];
    L.polyline(riverPath, { color: 'rgba(0,229,255,.8)', weight: 3 }).addTo(phase2LayerGroup);
  }

  if (mod === 'aquifer') {
    // 1. Radar Pulse Rings
    for (let i = 0; i < 3; i++) {
      const r = (tick * 400 + i * 800) % 2400;
      L.circle([lat, lon], {
        radius: r, color: '#9c27b0', weight: 1, fillOpacity: 0.05 * (1 - r/2400)
      }).addTo(phase2LayerGroup);
    }
    // 2. Rotating Scan Beam
    const angle = (tick * 22) % 360;
    const rad = angle * Math.PI / 180;
    const beamEnd = [lat + Math.sin(rad) * 0.035, lon + Math.cos(rad) * 0.045];
    L.polyline([[lat, lon], beamEnd], {
      color: '#e040fb', weight: 3, opacity: 0.9
    }).addTo(phase2LayerGroup);
    
    // 3. Detected Channel Pockets
    for (let i = 0; i < 6; i++) {
      const s = hashFromLatLon(lat + i, lon + i);
      if (s > 0.4) {
        const pLat = lat + (Math.sin(i * 1.5) * 0.025);
        const pLon = lon + (Math.cos(i * 1.2) * 0.03);
        const opacity = 0.3 + Math.sin(tick * 0.2 + i) * 0.3;
        L.circleMarker([pLat, pLon], {
          radius: 4 + s * 8, color: '#9c27b0', fillColor: '#9c27b0', fillOpacity: opacity, weight: 0
        }).addTo(phase2LayerGroup);
      }
    }
  }


  if (mod === 'irrigation') {
    const soil = intel.terrain > 0.7 ? 'ALLUVIAL' : intel.terrain > 0.4 ? 'RED CLAY' : 'SANDY';
    L.marker([lat, lon], {
      icon: L.divIcon({
        className: '',
        html: `<div style="font-family:'Share Tech Mono';color:#39ff14;background:rgba(2,8,16,.85);border:1px solid #39ff14;padding:2px 6px;font-size:9px;">SOIL: ${soil} | NDVI: ${(0.7 + intel.rechargeRate * 0.25).toFixed(2)}</div>`,
      }),
    }).addTo(phase2LayerGroup);
    for (let i = 0; i < 5; i++) {
      const ang = (i * 72) * Math.PI / 180;
      const r = 0.015;
      L.circle([lat + Math.sin(ang)*r, lon + Math.cos(ang)*r], {
        radius: 300, color: '#39ff14', weight: 1, fillOpacity: 0.1 + (intel.rechargeRate * 0.2)
      }).bindTooltip(`Irrigation Node ${i+1} | NDVI: ${(0.7 + intel.rechargeRate * 0.25).toFixed(2)}`, { sticky: true }).addTo(phase2LayerGroup);
    }
  }


  if (mod === 'crisis') {
    const seaRisk = intel.coastal * 100;
    const riverRisk = intel.floodProbability * 100;
    const droughtRisk = intel.droughtProbability * 100;
    const tone = Math.max(seaRisk, riverRisk, droughtRisk) > 70 ? '#ff1744' : '#ff6b00';
    L.circle([lat, lon], {
      radius: 1500 + (intel.moduleRiskScore * 20),
      color: tone,
      fillColor: tone,
      fillOpacity: 0.08,
      weight: 1.4,
    }).addTo(phase2LayerGroup);
  }

  if (mod === 'city_drainage') {
    const density = Math.floor(8 + (intel.urbanDensity / 8));
    const spread = 0.015 + (intel.urbanDensity * 0.0002);
    
    // Procedural Existing Network
    const nodes = [];
    for(let i=0; i<density; i++) {
      const seed = hashFromLatLon(lat + i, lon - i);
      nodes.push({
        lat: lat + (seed - 0.5) * spread,
        lon: lon + (hashFromLatLon(lon + i, lat - i) - 0.5) * spread,
        risk: clamp(intel.floodProbability * 100 + (seed * 40) - 20, 10, 99)
      });
    }

    // Connect nodes in a branching tree from center
    nodes.forEach((n, i) => {
      const col = n.risk > 75 ? varColor('--danger') : n.risk > 45 ? varColor('--warning') : varColor('--accent');
      L.circleMarker([n.lat, n.lon], {
        radius: 3, color: col, fillColor: col, fillOpacity: 0.6, weight: 1
      }).addTo(phase2LayerGroup);

      if (i > 0) {
        // Connect to a previous random node to simulate branching
        const parentIdx = Math.floor(Math.sqrt(i));
        const p = nodes[parentIdx];
        const edgeRisk = (n.risk + p.risk) / 2;
        const edgeCol = edgeRisk > 75 ? '#ff1744' : edgeRisk > 45 ? '#ff6b00' : '#39ff14';
        
        const line = L.polyline([[n.lat, n.lon], [p.lat, p.lon]], {
          color: edgeCol,
          weight: 2,
          opacity: 0.7,
          dashArray: edgeRisk > 70 ? '5 5' : '0'
        }).addTo(phase2LayerGroup);

        const status = edgeRisk > 75 ? 'CRITICAL OVERLOAD' : edgeRisk > 45 ? 'HIGH CAPACITY' : 'OPTIMAL FLOW';
        line.bindTooltip(`Drain Segment ${i} | Status: ${status}`, { sticky: true });

        // Flow particles
        const t = (timeShift + i * 0.15) % 1;
        const flowLat = p.lat + (n.lat - p.lat) * t;
        const flowLon = p.lon + (n.lon - p.lon) * t;
        L.circleMarker([flowLat, flowLon], {
          radius: 2, color: '#00e5ff', fillColor: '#00e5ff', fillOpacity: 0.9, weight: 0
        }).addTo(phase2LayerGroup);
      }
    });


    if (drainageOptimalRoute) {
      L.polyline(drainageOptimalRoute.path, {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.9,
      }).addTo(phase2LayerGroup).bindTooltip(`Optimal Route · ${(drainageOptimalRoute.lengthKm).toFixed(1)} km`, { sticky: true });
    }
  }
}

function renderRightPanelEnrichment(mod, intel) {
  const container = document.getElementById('right-ai-context');
  if (!container) return;
  const phaseLabel = `T+${phase2TemporalTick} · ${currentScenario.toUpperCase()}`;

  if (mod === 'godseyeview') {
    container.innerHTML = `
      <div class="rai-title">AQUA INTELLIGENCE · GLOBAL COMMAND</div>
      <div class="rai-row"><span>Global Stress Index</span><strong>${intel.moduleRiskScore.toFixed(0)} / 100</strong></div>
      <div class="rai-row"><span>Climate Anomaly</span><strong>${intel.climateAnomaly.toFixed(2)} sigma</strong></div>
      <div class="rai-row"><span>Critical Propagation</span><strong>${(intel.floodProbability * 100).toFixed(0)}% · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>AI Posture</span><strong>${intel.moduleRiskScore > 70 ? 'DEFCON WATER-3' : 'STABLE WATCH'}</strong></div>
    `;
  } else if (mod === 'groundwater') {
    container.innerHTML = `
      <div class="rai-title">GROUNDWATER DEEP SCAN</div>
      <div class="rai-row"><span>Dynamic Water Table</span><strong>${intel.groundwaterDepth.toFixed(1)} m BGL</strong></div>
      <div class="rai-row"><span>Recharge Trend</span><strong>${(intel.rechargeRate * 100).toFixed(0)}% · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>Extraction Pressure</span><strong>${(intel.moduleRiskScore * 0.9).toFixed(0)} / 100</strong></div>
      <div class="rai-row"><span>AI Forecast</span><strong>${(intel.groundwaterDepth + 3.2).toFixed(1)} m (30d)</strong></div>
      
      <div style="margin-top:10px; border-top:1px solid var(--border); padding-top:8px;">
        <div class="rai-title" style="color:var(--accent);">LSTM PREDICTIVE ENRICHMENT</div>
        <img id="gw-right-forecast-img" src="" style="width:100%; border-radius:2px; margin-top:5px; border:1px solid rgba(0,229,255,0.1);" />
      </div>
    `;

  } else if (mod === 'borewell') {
    container.innerHTML = `
      <div class="rai-title">BOREWELL AI TACTICAL CONTEXT</div>
      <div class="rai-row"><span>Recommended Strike Depth</span><strong>${Math.round(intel.groundwaterDepth * 2.8)} m</strong></div>
      <div class="rai-row"><span>Recharge Probability</span><strong>${(intel.rechargeRate * 100).toFixed(0)}%</strong></div>
      <div class="rai-row"><span>Lithology Confidence</span><strong>${(74 + (intel.terrain * 18)).toFixed(0)}% · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>Drill Readiness</span><strong>${intel.moduleRiskScore > 65 ? 'CAUTION' : 'GO'}</strong></div>
    `;
  } else if (mod === 'city_drainage') {
    container.innerHTML = `
      <div class="rai-title">CITY DRAINAGE NETWORK INTELLIGENCE</div>
      <div class="rai-row"><span>Overflow Probability</span><strong>${(intel.floodProbability * 100).toFixed(0)}%</strong></div>
      <div class="rai-row"><span>Urban Congestion Stress</span><strong>${intel.urbanDensity.toFixed(0)} / 100</strong></div>
      <div class="rai-row"><span>Network Criticality</span><strong>${intel.moduleRiskScore.toFixed(0)} / 100 · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>Preparedness Score</span><strong>${(100 - intel.moduleRiskScore).toFixed(0)} / 100</strong></div>
      <button class="rai-action-btn" onclick="generateOptimalDrainageSystem()">GENERATE OPTIMAL ROUTE TO STP</button>
    `;

  } else if (mod === 'irrigation') {
    container.innerHTML = `
      <div class="rai-title">AGRI-HYDROLOGY INTELLIGENCE</div>
      <div class="rai-row"><span>Crop Health (NDVI)</span><strong>${(0.7 + intel.rechargeRate * 0.25).toFixed(2)}</strong></div>
      <div class="rai-row"><span>Soil Moisture Index</span><strong>${(intel.rechargeRate * 100).toFixed(0)}% · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>Irrigation Demand</span><strong>${(3.1 + intel.urbanDensity / 40).toFixed(1)} mm/d</strong></div>
      <div class="rai-row"><span>Sustainability ROI</span><strong>${(80 + (1-intel.floodProbability)*20).toFixed(0)}%</strong></div>
    `;
  } else if (mod === 'aquifer') {
    container.innerHTML = `
      <div class="rai-title">AQUIFER SCANNER DIAGNOSTICS</div>
      <div class="rai-row"><span>Permeability Class</span><strong>${intel.terrain > 0.6 ? 'HIGH' : 'MODERATE'}</strong></div>
      <div class="rai-row"><span>Channel Connectivity</span><strong>${(55 + intel.rechargeRate * 35).toFixed(0)}% · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>Recharge Potential</span><strong>${(intel.rechargeRate * 100).toFixed(0)}%</strong></div>
      <div class="rai-row"><span>Scanner Confidence</span><strong>0.92</strong></div>
    `;
  } else if (mod === 'flood') {
    container.innerHTML = `
      <div class="rai-title">FLOOD RISK ANALYTICS</div>
      <div class="rai-row"><span>Inundation Probability</span><strong>${(intel.floodProbability * 100).toFixed(0)}%</strong></div>
      <div class="rai-row"><span>Critical Infrastructure At Risk</span><strong>${Math.round(intel.urbanDensity / 8)} UNITS</strong></div>
      <div class="rai-row"><span>River Buffer Stress</span><strong>${(intel.floodProbability * 8.5).toFixed(1)}/10 · ${phaseLabel}</strong></div>
      <div class="rai-row"><span>Evacuation Readiness</span><strong>${(100 - intel.floodProbability*40).toFixed(0)}%</strong></div>
    `;
  } else if (mod === 'crisis') {
    const h = intel.hazards;
    const active = [];
    if (h.tsunami > 0.5) active.push(`TSUNAMI (${(h.tsunami*100).toFixed(0)}%)`);
    if (h.cyclone > 0.5) active.push(`CYCLONE (${(h.cyclone*100).toFixed(0)}%)`);
    if (h.flood > 0.5)   active.push(`FLOOD (${(h.flood*100).toFixed(0)}%)`);
    if (h.drought > 0.5) active.push(`DROUGHT (${(h.drought*100).toFixed(0)}%)`);
    
    container.innerHTML = `
      <div class="rai-title">MULTI-HAZARD CRISIS MATRIX</div>
      <div class="rai-row"><span>Combined Risk Index</span><strong>${intel.moduleRiskScore.toFixed(0)} / 100</strong></div>
      <div class="rai-row"><span>Active Threats</span><strong style="color:var(--danger);">${active.join(' · ') || 'NONE'}</strong></div>
      <div class="rai-row"><span>Forecast Timeline</span><strong>${phaseLabel}</strong></div>
      <div class="rai-row"><span>Stability Forecast</span><strong>${intel.moduleRiskScore > 75 ? 'UNSTABLE' : 'WATCH'}</strong></div>
    `;
  } else {

    container.innerHTML = `
      <div class="rai-title">MODULE INTELLIGENCE</div>
      <div class="rai-row"><span>Temporal Risk</span><strong>${intel.moduleRiskScore.toFixed(0)} / 100</strong></div>
      <div class="rai-row"><span>Water Security</span><strong>${intel.waterSecurityScore.toFixed(0)} / 100</strong></div>
    `;
  }

}

function renderModuleHoverCard(mod, intel) {
  const card = document.getElementById('map-hover-status-card');
  if (!card) return;
  if (mod === 'reservoir') return; // managed by reservoir hover updater
  if (mod === 'groundwater') {
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">GROUNDWATER LIVE FIELD CARD</div>
      <div>DEPTH: <span style="color:var(--primary);">${intel.groundwaterDepth.toFixed(1)} m</span></div>
      <div>RECHARGE: ${(intel.rechargeRate * 100).toFixed(0)}%</div>
      <div>EXTRACTION RISK: ${intel.moduleRiskScore.toFixed(0)} / 100</div>`;
  } else if (mod === 'irrigation') {
    const soil = intel.terrain > 0.7 ? 'ALLUVIAL LOAM' : intel.terrain > 0.45 ? 'RED CLAY LOAM' : 'SANDY LOAM';
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">AGRI-HYDROLOGY CARD</div>
      <div>SOIL TYPE: <span style="color:var(--primary);">${soil}</span></div>
      <div>MOISTURE RETENTION: ${(52 + intel.rechargeRate * 35).toFixed(0)}%</div>
      <div>IRRIGATION DEMAND: ${(3.1 + intel.urbanDensity / 40).toFixed(1)} mm/day</div>`;
  } else if (mod === 'borewell') {
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">BOREWELL AI HOVER</div>
      <div>TARGET DEPTH: <span style="color:var(--primary);">${Math.round(intel.groundwaterDepth * 2.8)} m</span></div>
      <div>RECHARGE PROB: ${(intel.rechargeRate * 100).toFixed(0)}%</div>
      <div>SITE RISK: ${intel.moduleRiskScore.toFixed(0)} / 100</div>`;
  } else if (mod === 'drainage' || mod === 'city_drainage') {
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">DRAINAGE NETWORK CARD</div>
      <div>NODES AT RISK: ${Math.round(10 + intel.moduleRiskScore / 4)}</div>
      <div>OVERFLOW PROB: ${(intel.floodProbability * 100).toFixed(0)}%</div>
      <div>CAPACITY STRESS: ${intel.moduleRiskScore.toFixed(0)} / 100</div>`;
  } else if (mod === 'flood') {
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">FLOOD EARLY WARNING</div>
      <div>RIVER-ZONE RISK: <span style="color:var(--warning);">${(intel.floodProbability * 100).toFixed(0)}%</span></div>
      <div>INUNDATION INDEX: ${(intel.floodProbability * 3.2).toFixed(1)} m</div>
      <div>URBAN SPREAD: ${(42 + intel.urbanDensity * 0.38).toFixed(0)}%</div>`;
  } else if (mod === 'aquifer') {
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">AQUIFER SCANNER CARD</div>
      <div>PERMEABILITY SCORE: ${(48 + intel.terrain * 40).toFixed(0)}</div>
      <div>RECHARGE ZONES: ${Math.round(3 + intel.rechargeRate * 9)}</div>
      <div>CHANNEL CONFIDENCE: ${(55 + intel.rechargeRate * 35).toFixed(0)}%</div>`;
  } else if (mod === 'crisis') {
    const tsunami = (intel.coastal * 100);
    const flood = (intel.floodProbability * 100);
    const drought = (intel.droughtProbability * 100);
    card.innerHTML = `<div style="color:var(--accent);font-size:8px;letter-spacing:1.5px;margin-bottom:4px;">CRISIS FORECAST CARD</div>
      <div>TSUNAMI: ${tsunami.toFixed(0)}%</div>
      <div>FLOOD: ${flood.toFixed(0)}%</div>
      <div>DROUGHT: ${drought.toFixed(0)}%</div>`;
  } else {
    card.innerHTML = '';
  }
}

function refreshGeoIntelligence(mod, lat, lon, locationName, forceSim) {
  const intel = generateGeoIntelligence(mod, lat, lon, forceSim);
  lastGeoIntelligence = { ...intel, _module: mod, _lat: lat, _lon: lon, _locationName: locationName || 'Active Region' };
  applyGeoIntelligenceToModule(mod, intel);
  renderMapIntelligenceCard(mod, intel, locationName);
  renderPhase2Overlays(mod, lat, lon, intel, phase2TemporalTick);
  renderRightPanelEnrichment(mod, intel);
  renderModuleHoverCard(mod, intel);
  const tg = document.getElementById('target-grace');
  if (tg) {
    tg.innerHTML = `RISK: <span style="color:${intel.moduleRiskScore > 70 ? 'var(--danger)' : 'var(--warning)'};">${intel.moduleRiskScore.toFixed(0)}</span> | RAIN: ${intel.rainfall.toFixed(0)}mm`;
  }
}

function startPhase2TemporalLoop() {
  if (phase2TemporalTimer) {
    clearInterval(phase2TemporalTimer);
    phase2TemporalTimer = null;
  }
  const profile = getScenarioTemporalProfile();
  phase2TemporalTimer = setInterval(() => {
    if (!lastGeoIntelligence) return;
    // Allow simulation updates for all modules

    phase2TemporalTick += 1;
    const intelNow = getTemporalIntel(lastGeoIntelligence, phase2TemporalTick);
    renderPhase2Overlays(currentModule, lastGeoIntelligence._lat, lastGeoIntelligence._lon, intelNow, phase2TemporalTick);
    renderMapIntelligenceCard(currentModule, intelNow, lastGeoIntelligence._locationName);
    renderRightPanelEnrichment(currentModule, intelNow);
    renderModuleHoverCard(currentModule, intelNow);
  }, profile.intervalMs);
}

function loadSimulationData() {
  const lat = parseFloat(document.getElementById('loc-lat').value);
  const lon = parseFloat(document.getElementById('loc-lon').value);
  const name = document.getElementById('loc-name').value;
  if (isNaN(lat) || isNaN(lon)) return;

  // 1. Visual feedback
  setStatus('SCANNING SYSTEM CAPABILITIES...', 'busy');
  document.body.classList.add('scanning-active');
  
  // 2. Randomize scenario for demo
  const scens = ['normal', 'overuse', 'leak', 'contamination'];
  const nextScen = scens[Math.floor(Math.random() * scens.length)];
  setScenario(nextScen);

  // 3. Force procedural refresh
  refreshGeoIntelligence(currentModule, lat, lon, name, true);
  
  // 4. Trigger module-specific 'deep' capabilities
  if (currentModule === 'city_drainage') {
    generateOptimalDrainageSystem();
  }
  
  // 5. Update 3D if visible
  if (threeScene) {
    updateThreeModel(currentModule);
  }

  setTimeout(() => {
    document.body.classList.remove('scanning-active');
    setStatus('SIMULATION LOADED · ' + nextScen.toUpperCase(), 'active');
    setTimeout(() => setStatus('OPERATIONAL', ''), 2000);
  }, 1200);
}

window.loadSimulationData = loadSimulationData;

function generateOptimalDrainageSystem() {
  if (currentModule !== 'city_drainage') return;
  const lat = lastGeoIntelligence ? lastGeoIntelligence._lat : parseFloat(document.getElementById('loc-lat').value);
  const lon = lastGeoIntelligence ? lastGeoIntelligence._lon : parseFloat(document.getElementById('loc-lon').value);
  
  setStatus('GENERATING OPTIMAL PATH...', 'busy');
  
  // Simulated STP location (usually downstream/lower elevation)
  const stpLat = lat + (Math.random() > 0.5 ? 0.04 : -0.04);
  const stpLon = lon + (Math.random() > 0.5 ? 0.05 : -0.05);
  
  // Generate a multi-point path to STP
  const path = [[lat, lon]];
  const segments = 6;
  for(let i=1; i<=segments; i++) {
    const t = i/segments;
    const pLat = lat + (stpLat - lat) * t + (Math.sin(i)*0.005);
    const pLon = lon + (stpLon - lon) * t + (Math.cos(i)*0.005);
    path.push([pLat, pLon]);
  }
  
  const dist = centerMap ? centerMap.distance([lat, lon], [stpLat, stpLon]) : 5000;
  
  drainageOptimalRoute = {
    start: [lat, lon],
    end: [stpLat, stpLon],
    path: path,
    lengthKm: dist / 1000,
    efficiency: 85 + Math.random() * 10
  };
  
  // Refresh view
  if (lastGeoIntelligence) {
    refreshGeoIntelligence('city_drainage', lat, lon, lastGeoIntelligence._locationName, false);
  }
  
  setTimeout(() => {
    setStatus('OPTIMAL ROUTE GENERATED', 'active');
    setTimeout(() => setStatus('OPERATIONAL', ''), 2000);
  }, 1000);
}
window.generateOptimalDrainageSystem = generateOptimalDrainageSystem;

// ──────────────────────────────────────────────────────────
// LOCATION SEARCH AUTOCOMPLETE
// ──────────────────────────────────────────────────────────
let searchDebounce = null;
function onLocationInput() {
  const q = document.getElementById('loc-name').value;
  const resBox = document.getElementById('loc-search-results');
  
  if (q.length < 2) {
    resBox.classList.remove('visible');
    return;
  }

  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(async () => {
    try {
      // #region agent log
      sendDebugLog('H8', 'frontend/app.js:onLocationInput:request', 'Location search request', { query: q });
      // #endregion
      const r = await fetch(`${API_BASE}/search/locations?q=${encodeURIComponent(q)}`);
      const matches = await r.json();
      // #region agent log
      sendDebugLog('H8', 'frontend/app.js:onLocationInput:response', 'Location search response', {
        query: q,
        status: r.status,
        count: Array.isArray(matches) ? matches.length : -1,
        firstHasCoords: !!(Array.isArray(matches) && matches[0] && matches[0].lat !== undefined && matches[0].lon !== undefined),
        firstName: Array.isArray(matches) && matches[0] ? matches[0].name : null
      });
      // #endregion
      
      if (matches.length > 0) {
        resBox.innerHTML = matches.map(m => `
          <div class="loc-search-item" onclick="selectLocation('${m.name}', ${m.lat||'null'}, ${m.lon||'null'})">
            ${m.name} <span class="item-type">${m.type||'city'}</span>
          </div>
        `).join('');
        resBox.classList.add('visible');
      } else {
        resBox.classList.remove('visible');
      }
    } catch(e) {
      // #region agent log
      sendDebugLog('H8', 'frontend/app.js:onLocationInput:error', 'Location search failed', { query: q, error: String(e) });
      // #endregion
      console.error(e);
    }
  }, 300);
}

function selectLocation(name, lat, lon) {
  document.getElementById('loc-name').value = name;
  document.getElementById('loc-search-results').classList.remove('visible');
  
  if (lat && lon) {
    document.getElementById('loc-lat').value = lat;
    document.getElementById('loc-lon').value = lon;
    analyzeLocation();
  } else {
    // If we only have name, we could geocode it, but here we expect lat/lon
    analyzeLocation();
  }
}

// Close search when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.loc-field-wide')) {
    document.getElementById('loc-search-results').classList.remove('visible');
  }
});

async function reverseGeocode(lat, lon) {
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    const name = data.display_name?.split(',').slice(0,3).join(',') || `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;
    document.getElementById('loc-name').value = name;
    flyToLatLon(lat, lon, name);
  } catch(e) {
    // silently fail — keep existing name
  }
}

// ──────────────────────────────────────────────────────────
// HUD & RIGHT PANEL UPDATES
// ──────────────────────────────────────────────────────────
function updateHUD(lat, lon, name, color) {
  const shortName = name.toUpperCase().split(',').slice(0,2).join(',').trim();
  document.getElementById('hud-coords').textContent      = `${lat.toFixed(3)}°N / ${lon.toFixed(3)}°E`;
  document.getElementById('loc-badge-name').textContent   = shortName;
  document.getElementById('loc-badge-coords').textContent = `${lat.toFixed(3)}°N · ${lon.toFixed(3)}°E`;
  document.getElementById('hud-coverage').textContent     = 'COVERAGE: 847 ZONES';
}

function updateRightPanel(lat, lon, name) {
  const short = name.split(',').slice(0,2).join(',').trim().toUpperCase();
  document.getElementById('target-region').textContent = short || 'UNKNOWN REGION';
  document.getElementById('rp-lat').textContent = `LAT ${lat.toFixed(3)}°N`;
  document.getElementById('rp-lon').textContent = `LON ${lon.toFixed(3)}°E`;
}

// (moved to top)

// ──────────────────────────────────────────────────────────
// METRICS STRIP
// ──────────────────────────────────────────────────────────
function populateMetrics(metrics) {
  if (!metrics) return;
  metrics.forEach((m, i) => {
    const lbl  = document.getElementById('ml-' + i);
    const val  = document.getElementById('mv-' + i);
    const unit = document.getElementById('mu-' + i);
    if (!lbl) return;
    lbl.textContent  = m.l;
    val.textContent  = m.v;
    unit.textContent = m.u;
    val.className    = 'metric-val' + (m.cls ? ' ' + m.cls : '');

    const card = val.closest('.metric-card');
    if (card) {
      card.classList.toggle('risk-card', !!m.risk);
    }
  });
}

// ──────────────────────────────────────────────────────────
// CHARTS
// ──────────────────────────────────────────────────────────
const drawnCharts = {};

function drawCharts(chartCfgs, color) {
  const key = chartCfgs[0]?.type;

  chartCfgs.forEach((cfg, idx) => {
    const n   = idx + 1;
    document.getElementById('ct-' + n).textContent = cfg.t;
    document.getElementById('cs-' + n).textContent = cfg.s;
    const canvas = document.getElementById('chart-' + n);
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth * 2;
    canvas.height = 74 * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    renderChart(ctx, canvas.offsetWidth, 74, cfg.type, color);
  });
}

function rnd() { return Math.random(); }
function gpts(W, H, n, y0, slope, noise) {
  return Array.from({ length: n+1 }, (_, i) => ({
    x: (i/n)*W,
    y: Math.max(4, Math.min(H-4, y0 + slope*i + (rnd()-.5)*noise)),
  }));
}
function stroke(ctx, pts, col, dash) {
  if (dash) ctx.setLineDash([4,6]);
  ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
  ctx.setLineDash([]);
}
function fill(ctx, W, H, pts, col) {
  ctx.fillStyle = col + '18';
  ctx.beginPath(); ctx.moveTo(0,H);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
}
function hline(ctx, W, y, col) {
  ctx.strokeStyle=col; ctx.lineWidth=.6; ctx.setLineDash([3,5]);
  ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); ctx.setLineDash([]);
}
function lbl(ctx, txt, x, y, col) {
  ctx.fillStyle=col; ctx.font='7px "Share Tech Mono",monospace'; ctx.fillText(txt,x,y);
}

function renderChart(ctx, W, H, type, color) {
  ctx.clearRect(0,0,W,H);
  const p2 = color;
  switch(type) {
    case 'depth_forecast': {
      const p = gpts(W,H,90,10,0.68,5);
      hline(ctx,W,H*.28,'rgba(255,107,0,.4)'); lbl(ctx,'CRITICAL THRESHOLD',4,H*.26,'rgba(255,107,0,.6)');
      fill(ctx,W,H,p,p2); stroke(ctx,p,p2);
      break; }
    case 'soil_moisture': {
      const p = gpts(W,H,30,H*.25,0,18);
      fill(ctx,W,H,p,'#39ff14'); stroke(ctx,p,'#39ff14'); break; }
    case 'reservoir_storage': {
      const p = gpts(W,H,90,H*.3,-.06,8);
      fill(ctx,W,H,p,p2); stroke(ctx,p,p2); break; }
    case 'flow_trend': {
      const p1=gpts(W,H,30,H*.35,0,10), p2b=gpts(W,H,30,H*.52,.04,6);
      fill(ctx,W,H,p1,p2); stroke(ctx,p1,p2); stroke(ctx,p2b,'#ff6b00',true);
      lbl(ctx,'INFLOW',4,10,p2+'cc'); lbl(ctx,'OUTFLOW',56,10,'#ff6b00cc'); break; }
    case 'et_demand': {
      const p1=gpts(W,H,30,H*.38,0,12), p2b=gpts(W,H,30,H*.5,0,9);
      fill(ctx,W,H,p1,p2); stroke(ctx,p1,p2); stroke(ctx,p2b,'#39ff14',true);
      lbl(ctx,'ET₀',4,10,p2+'cc'); lbl(ctx,'CROP ET',36,10,'#39ff14cc'); break; }
    case 'ndvi_trend': {
      const p=gpts(W,H,30,H*.3,.08,7);
      fill(ctx,W,H,p,'#39ff14'); stroke(ctx,p,'#39ff14'); break; }
    case 'borewell_depth': {
      const p=Array.from({length:31},(_,i)=>({x:(i/30)*W,y:H-(H*.65*Math.exp(-.5*Math.pow((i-18)/5,2))+H*.07)}));
      fill(ctx,W,H,p,'#ff6b00'); stroke(ctx,p,'#ff6b00');
      const px=(18/30)*W; hline(ctx,W,p[18].y,'rgba(57,255,20,.4)'); lbl(ctx,'OPTIMAL 210FT',px+4,p[18].y-3,'rgba(57,255,20,.7)');
      break; }
    case 'borewell_cluster': {
      [{x:.25,y:.42,r:16,v:72,c:'#39ff14'},{x:.56,y:.6,r:11,v:58,c:'#ff6b00'},
       {x:.78,y:.3,r:20,v:81,c:'#39ff14'},{x:.4,y:.74,r:7,v:43,c:'#ff1744'},
       {x:.14,y:.65,r:13,v:65,c:'#00e5ff'}].forEach(cl=>{
        ctx.beginPath(); ctx.arc(cl.x*W,cl.y*H,cl.r,0,Math.PI*2);
        ctx.fillStyle=cl.c+'2a'; ctx.fill();
        ctx.strokeStyle=cl.c; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=cl.c; ctx.font='9px Orbitron,monospace';
        ctx.fillText(cl.v+'%',cl.x*W-8,cl.y*H+4);
      }); break; }
    case 'drainage_flow': {
      const p=gpts(W,H,24,H*.65,-1.2,8); p[12]={x:p[12].x,y:H*.14};
      hline(ctx,W,H*.36,'rgba(255,23,68,.4)'); lbl(ctx,'CAPACITY LIMIT',4,H*.34,'rgba(255,23,68,.6)');
      fill(ctx,W,H,p,'#ff6b00'); stroke(ctx,p,'#ff6b00'); break; }
    case 'runoff': {
      const p=gpts(W,H,7,H*.72,-5,7);
      fill(ctx,W,H,p,p2); stroke(ctx,p,p2); break; }
    case 'river_level': {
      const p=gpts(W,H,72,H*.62,-.48,5);
      hline(ctx,W,H*.22,'rgba(255,23,68,.4)'); lbl(ctx,'DANGER 6M',4,H*.2,'rgba(255,23,68,.6)');
      fill(ctx,W,H,p,'#ff1744'); stroke(ctx,p,'#ff1744'); break; }
    case 'rainfall_bars': {
      for(let i=0;i<72;i++){const bw=W/72-1,bh=Math.max(3,(rnd()*.7+(i>36?.8:.3))*H*.78);ctx.fillStyle=bh>H*.5?'rgba(255,23,68,.75)':'rgba(0,229,255,.55)';ctx.fillRect((i/72)*W,H-bh,bw,bh);}
      break; }
    case 'grace_anomaly': {
      const p=gpts(W,H,12,H*.28,2.6,6);
      hline(ctx,W,H*.5,'rgba(0,229,255,.25)');
      fill(ctx,W,H,p,'#9c27b0'); stroke(ctx,p,'#9c27b0'); break; }
    case 'recharge_balance': {
      const p1=gpts(W,H,12,H*.65,0,7), p2b=gpts(W,H,12,H*.22,.3,5);
      fill(ctx,W,H,p1,'#39ff14'); stroke(ctx,p1,'#39ff14'); stroke(ctx,p2b,'#ff1744');
      lbl(ctx,'RECHARGE',4,10,'rgba(57,255,20,.8)'); lbl(ctx,'EXTRACTION',68,10,'rgba(255,23,68,.8)'); break; }
    case 'crisis_prob': {
      const p=gpts(W,H,90,H*.7,-.5,5);
      ctx.fillStyle='rgba(255,23,68,.05)'; ctx.fillRect(0,0,W,H*.36);
      hline(ctx,W,H*.36,'rgba(255,23,68,.4)'); lbl(ctx,'CRISIS THRESHOLD 70%',4,H*.34,'rgba(255,23,68,.6)');
      fill(ctx,W,H,p,'#ff1744'); stroke(ctx,p,'#ff1744'); break; }
    case 'stress_index': {
      ['GW','RAIN','DEMAND','TEMP','POLICY'].forEach((f,i)=>{
        const v=.4+rnd()*.55, bw=(W/5)-8, x=i*(W/5)+4, h=v*(H-16), col=v>.75?'#ff1744':v>.55?'#ff6b00':'#00e5ff';
        ctx.fillStyle=col+'33'; ctx.fillRect(x,H-16-h,bw,h);
        ctx.strokeStyle=col; ctx.lineWidth=1; ctx.strokeRect(x,H-16-h,bw,h);
        ctx.fillStyle=col; ctx.font='6px "Share Tech Mono",monospace'; ctx.fillText(f.substring(0,6),x,H-2);
      }); break; }
  }
}

// ──────────────────────────────────────────────────────────
// LIVE API FETCH
// ──────────────────────────────────────────────────────────
async function fetchModuleData(mod, lat, lon) {
  if (mod === 'groundwater') {
    try {
      const r = await fetch(`${API_BASE}/groundwater/status?lat=${lat}&lon=${lon}&district=Visakhapatnam&state=Andhra%20Pradesh`);
      const d = await r.json();
      if (d.satellite_data) {
        const g = d.satellite_data.grace_anomaly_m;
        const s = d.satellite_data.soil_moisture_pct;
        document.getElementById('mv-0').textContent = g?.toFixed(2) || '-2.66';
        document.getElementById('mv-2').textContent = `${s?.toFixed(1)}%` || '28.6%';
        document.getElementById('target-grace').innerHTML =
          `GRACE: <span style="color:${g<-5?'var(--danger)':'var(--warning)'};">${g}m</span> | SM: ${s}%`;
        
        // Update 3D Model dynamically with real-world data
        updateThreeModel('groundwater', d);
      }
    } catch(e) { 
      setStatus('FEED OFFLINE', 'error'); 
      // Mark specific values as stale
      ['mv-0','mv-2'].forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.textContent = 'OFFLINE'; el.style.opacity = '0.4'; }
      });
    }
  } else if (mod === 'city_drainage') {
    try {
      const netRes = await fetch(`${API_BASE}/drainage/network/status`);
      const eqRes  = await fetch(`${API_BASE}/drainage/equity/scores`);
      const netData = await netRes.json();
      const eqData  = await eqRes.json();
      document.getElementById('mv-0') && (document.getElementById('mv-0').textContent = netData.overloaded_wards_count || '23');
      document.getElementById('mv-2') && (document.getElementById('mv-2').textContent = (eqData.city_average || '68') + '/100');
      document.getElementById('mv-5') && (document.getElementById('mv-5').textContent = netData.flood_eta_hours ? netData.flood_eta_hours + ' HR' : '18 HR');
      document.getElementById('mv-6') && (document.getElementById('mv-6').textContent = (netData.pump_stations_active || '7') + ' STN');
    } catch(e) { /* backend offline – mock data handles display */ }
    addVizagDrainageOverlays(lat, lon);
  }
}

// ──────────────────────────────────────────────────────────
// VIZAG DRAINAGE GOD MODE ENGINE
// ──────────────────────────────────────────────────────────
let drainageLayerGroup = null;
let satelliteLayer      = null;
let blueprintActive     = false;
let flowAnimActive      = true;
let heatmapActive      = false;
let blueprintCanvas    = null;
let bctx               = null;
let v360Scene          = null;
let v360Camera         = null;
let v360Renderer       = null;
let v360Sphere         = null;

// Mock Data for Vizag Drainage Grid
const VIZAG_WARDS = Array.from({length: 58}, (_, i) => ({
  id: i + 1,
  name: `Ward ${i + 1}`,
  lat: 17.68 + (Math.random() - 0.5) * 0.15,
  lon: 83.21 + (Math.random() - 0.5) * 0.15,
  capacity: 40 + Math.random() * 55,
  risk: Math.random() > 0.8 ? 'CRITICAL' : (Math.random() > 0.6 ? 'WARN' : 'GOOD'),
  slum_pct: Math.floor(Math.random() * 40)
}));

const VIZAG_FACILITIES = {
  pumps: [
    {lat: 17.689, lon: 83.218, name: 'Gajuwaka Main PS', cap: '1.8 MLD', status: 'operational'},
    {lat: 17.721, lon: 83.305, name: 'MVP Colony PS', cap: '1.2 MLD', status: 'operational'},
    {lat: 17.701, lon: 83.295, name: 'Maddilapalem PS', cap: '2.2 MLD', status: 'maintenance'},
    {lat: 17.685, lon: 83.285, name: 'Harbor PS', cap: '3.5 MLD', status: 'operational'},
    {lat: 17.712, lon: 83.321, name: 'Waltair PS', cap: '1.5 MLD', status: 'operational'},
    {lat: 17.675, lon: 83.275, name: 'Old Town PS', cap: '1.0 MLD', status: 'planned'},
    {lat: 17.785, lon: 83.385, name: 'Rushikonda PS', cap: '1.2 MLD', status: 'operational'}
  ],
  stps: [
    {lat: 17.665, lon: 83.205, name: 'Gajuwaka STP', cap: '40 MLD', status: 'operational'},
    {lat: 17.885, lon: 83.445, name: 'Bheemili STP', cap: '20 MLD', status: 'planned'},
    {lat: 17.695, lon: 83.255, name: 'Harbor STP', cap: '60 MLD', status: 'operational'},
    {lat: 17.735, lon: 83.315, name: 'MVP STP', cap: '30 MLD', status: 'construction'}
  ]
};

// Generates a mock pipe network based on wards and facilities
const VIZAG_PIPES = [];
VIZAG_WARDS.forEach((w, i) => {
  if (i % 3 === 0) {
    const target = VIZAG_FACILITIES.pumps[Math.floor(Math.random() * VIZAG_FACILITIES.pumps.length)];
    VIZAG_PIPES.push({
      pts: [[w.lat, w.lon], [target.lat, target.lon]],
      type: 'SECONDARY', dia: '600mm', depth: 2.4, status: w.risk
    });
  }
});

function addVizagDrainageOverlays(lat, lon) {
  if (!centerMap) return;
  if (drainageLayerGroup) centerMap.removeLayer(drainageLayerGroup);
  drainageLayerGroup = L.layerGroup().addTo(centerMap);

  document.getElementById('drain-ctrl-bar').classList.add('visible');
  document.getElementById('drain-stats-panel').classList.add('visible');
  document.getElementById('pipe-depth-legend').classList.add('visible');

  // 1. Draw Wards (Heatmap/Risk)
  VIZAG_WARDS.forEach(w => {
    const col = w.risk === 'CRITICAL' ? varColor('--danger') : (w.risk === 'WARN' ? varColor('--warning') : varColor('--accent'));
    L.circle([w.lat, w.lon], {
      radius: 800, color: 'transparent', fillColor: col, fillOpacity: 0.15
    }).bindTooltip(`<div class="drain-ward-tooltip">
        <div class="dwt-name">${w.name}</div>
        <div class="dwt-row"><span class="dwt-key">CAPACITY</span><span class="dwt-val ${w.risk.toLowerCase()}">${w.capacity.toFixed(0)}%</span></div>
        <div class="dwt-row"><span class="dwt-key">SLUM PCT</span><span class="dwt-val">${w.slum_pct}%</span></div>
      </div>`, {sticky: true}).addTo(drainageLayerGroup);
  });

  // 2. Draw Pipes
  VIZAG_PIPES.forEach(p => {
    const col = p.status === 'CRITICAL' ? varColor('--danger') : varColor('--primary');
    L.polyline(p.pts, {
      color: col, weight: p.type === 'MAIN' ? 4 : 2, opacity: 0.6, dashArray: '8, 8'
    }).addTo(drainageLayerGroup);
  });

  // 3. Draw Facilities
  VIZAG_FACILITIES.pumps.forEach(f => {
    const html = `<div class="map-pulse-marker" style="color:#e040fb">
      <div class="ring"></div><div class="core" style="background:#e040fb"></div>
    </div>`;
    L.marker([f.lat, f.lon], {icon: L.divIcon({html, className: '', iconSize: [12, 12]})})
      .bindPopup(`<div style="font-family:'Share Tech Mono';">
        <div style="color:#e040fb;font-weight:bold;margin-bottom:4px;">PUMP STATION: ${f.name}</div>
        <div>CAP: ${f.cap}</div>
        <div>STATUS: ${f.status.toUpperCase()}</div>
        <button class="loc-analyze-btn" style="margin-top:8px;width:100%;padding:4px;" onclick="open360View()">VIEW 360° ACCESS</button>
      </div>`)
      .addTo(drainageLayerGroup);
  });

  VIZAG_FACILITIES.stps.forEach(f => {
    L.circleMarker([f.lat, f.lon], {radius: 7, color: '#ff5722', weight: 2, fillColor: '#ff5722', fillOpacity: 0.8})
      .bindPopup(`<div style="font-family:'Share Tech Mono';">
        <div style="color:#ff5722;font-weight:bold;margin-bottom:4px;">STP PLANT: ${f.name}</div>
        <div>STATUS: ${f.status.toUpperCase()}</div>
        <button class="loc-analyze-btn" style="margin-top:8px;width:100%;padding:4px;border-color:#ff5722;color:#ff5722;background:rgba(255,87,34,0.1);" onclick="open360View()">VIEW 360° FACILITY</button>
      </div>`)
      .addTo(drainageLayerGroup);
  });

  centerMap.flyTo([17.7, 83.3], 12);
  initBlueprintCanvas();
}

function varColor(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#00e5ff'; }

function setDrainView(type) {
  if (!mapController) return;
  const btnMap = document.getElementById('dcb-map');
  const btnSat = document.getElementById('dcb-satellite');

  if (type === 'satellite') {
    mapController.setBaseLayer('satellite');
    btnSat.classList.add('active');
    btnMap.classList.remove('active');
  } else {
    mapController.setBaseLayer('dark');
    btnMap.classList.add('active');
    btnSat.classList.remove('active');
  }
}

function toggleSatelliteGlobal() {
  const btn = document.getElementById('btn-satellite');
  const isSat = btn.classList.toggle('active');
  setDrainView(isSat ? 'satellite' : 'map');
}

function toggleBlueprintOverlay() {
  blueprintActive = !blueprintActive;
  document.getElementById('dcb-blueprint').classList.toggle('active', blueprintActive);
  document.getElementById('drain-blueprint-canvas').classList.toggle('visible', blueprintActive);
  if (blueprintActive) animateBlueprint();
}

function initBlueprintCanvas() {
  blueprintCanvas = document.getElementById('drain-blueprint-canvas');
  bctx = blueprintCanvas.getContext('2d');
  window.addEventListener('resize', () => {
    blueprintCanvas.width = blueprintCanvas.clientWidth;
    blueprintCanvas.height = blueprintCanvas.clientHeight;
  });
  blueprintCanvas.width = blueprintCanvas.clientWidth;
  blueprintCanvas.height = blueprintCanvas.clientHeight;
}

let afBlueprint = 0;
function animateBlueprint() {
  if (!blueprintActive) return;
  afBlueprint++;
  bctx.clearRect(0, 0, blueprintCanvas.width, blueprintCanvas.height);
  
  // Draw blueprint scan lines
  bctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
  bctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < blueprintCanvas.width; x += step) {
    bctx.beginPath(); bctx.moveTo(x, 0); bctx.lineTo(x, blueprintCanvas.height); bctx.stroke();
  }
  for (let y = 0; y < blueprintCanvas.height; y += step) {
    bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(blueprintCanvas.width, y); bctx.stroke();
  }

  // Draw animated flow on polylines
  if (flowAnimActive) {
    VIZAG_PIPES.forEach(p => {
      const p1 = centerMap.latLngToContainerPoint(p.pts[0]);
      const p2 = centerMap.latLngToContainerPoint(p.pts[1]);
      
      bctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      bctx.lineWidth = 2;
      bctx.beginPath(); bctx.moveTo(p1.x, p1.y); bctx.lineTo(p2.x, p2.y); bctx.stroke();

      const t = (afBlueprint / 60) % 1;
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      bctx.fillStyle = '#00e5ff';
      bctx.beginPath(); bctx.arc(p1.x + dx * t, p1.y + dy * t, 3, 0, Math.PI * 2); bctx.fill();
    });
  }

  requestAnimationFrame(animateBlueprint);
}

let v360State = {
  lon: 0, lat: 0, phi: 0, theta: 0,
  isUserInteracting: false,
  onPointerDownPointerX: 0, onPointerDownPointerY: 0,
  onPointerDownLon: 0, onPointerDownLat: 0,
  currentSiteIdx: 0,
  sites: [
    {
      name: 'MVPS COLONY MAIN DRAIN, WARD 12 — VISAKHAPATNAM',
      texture: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000',
      pipe: { type: 'SECONDARY', depth: '2.4', dia: '600mm', cap: '74%', mat: 'RCC', year: '1998', status: 'OPERATIONAL', flow: '1.2 M/S' }
    },
    {
      name: 'GAJUWAKA INDUSTRIAL TRUNK, WARD 45 — VISAKHAPATNAM',
      texture: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=2000',
      pipe: { type: 'MAIN TRUNK', depth: '4.8', dia: '1200mm', cap: '92%', mat: 'RCC', year: '1985', status: 'CRITICAL', flow: '3.8 M/S' }
    },
    {
      name: 'RUSHIKONDA COASTAL OUTFALL, WARD 02 — VISAKHAPATNAM',
      texture: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?auto=format&fit=crop&q=80&w=2000',
      pipe: { type: 'SECONDARY', depth: '1.9', dia: '450mm', cap: '45%', mat: 'PVC', year: '2012', status: 'GOOD', flow: '0.9 M/S' }
    }
  ]
};

function open360View() {
  document.getElementById('view360-overlay').classList.add('visible');
  setTimeout(() => {
    init360Scene();
    if (v360Renderer) {
      const container = document.getElementById('view360-canvas').parentElement;
      v360Renderer.setSize(container.clientWidth, container.clientHeight);
      v360Camera.aspect = container.clientWidth / container.clientHeight;
      v360Camera.updateProjectionMatrix();
    }
    update360UI();
  }, 100);
}

function close360View() {
  document.getElementById('view360-overlay').classList.remove('visible');
}

function init360Scene() {
  if (v360Renderer) return;
  const container = document.getElementById('view360-canvas').parentElement;
  v360Scene = new THREE.Scene();
  v360Camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  v360Renderer = new THREE.WebGLRenderer({canvas: document.getElementById('view360-canvas'), antialias: true});
  v360Renderer.setSize(container.clientWidth, container.clientHeight);

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  
  const material = new THREE.MeshBasicMaterial({color: 0x001a2c});
  v360Sphere = new THREE.Mesh(geometry, material);
  v360Scene.add(v360Sphere);

  load360Texture(v360State.sites[v360State.currentSiteIdx].texture);

  v360Camera.position.set(0, 0, 0.1);

  container.addEventListener('pointerdown', e => {
    v360State.isUserInteracting = true;
    v360State.onPointerDownPointerX = e.clientX; v360State.onPointerDownPointerY = e.clientY;
    v360State.onPointerDownLon = v360State.lon; v360State.onPointerDownLat = v360State.lat;
  });
  window.addEventListener('pointermove', e => {
    if (v360State.isUserInteracting) {
      v360State.lon = (v360State.onPointerDownPointerX - e.clientX) * 0.1 + v360State.onPointerDownLon;
      v360State.lat = (e.clientY - v360State.onPointerDownPointerY) * 0.1 + v360State.onPointerDownLat;
    }
  });
  window.addEventListener('pointerup', () => { v360State.isUserInteracting = false; });

  function animate() {
    requestAnimationFrame(animate);
    v360State.lat = Math.max(-85, Math.min(85, v360State.lat));
    v360State.phi = THREE.MathUtils.degToRad(90 - v360State.lat);
    v360State.theta = THREE.MathUtils.degToRad(v360State.lon);
    
    v360Camera.target = new THREE.Vector3(
      500 * Math.sin(v360State.phi) * Math.cos(v360State.theta),
      500 * Math.cos(v360State.phi),
      500 * Math.sin(v360State.phi) * Math.sin(v360State.theta)
    );
    v360Camera.lookAt(v360Camera.target);
    v360Renderer.render(v360Scene, v360Camera);
    
    const bearingEl = document.getElementById('v360-bearing');
    if (bearingEl) {
      const site = v360State.sites[v360State.currentSiteIdx];
      bearingEl.innerHTML = `BEARING: ${Math.floor(v360State.lon % 360)}° &nbsp;|&nbsp; PIPE DEPTH: ${site.pipe.depth}M &nbsp;|&nbsp; DIA: ${site.pipe.dia}`;
    }
  }
  animate();
}

function load360Texture(url) {
  if (!v360Sphere) return;
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(url, (texture) => {
    v360Sphere.material.map = texture;
    v360Sphere.material.needsUpdate = true;
    console.log('360 Texture Loaded:', url);
  }, undefined, (err) => {
    console.error('360 Texture Load Failed', err);
  });
}

function update360UI() {
  const site = v360State.sites[v360State.currentSiteIdx];
  document.getElementById('v360-loc-name').textContent = site.name;
  document.getElementById('v360-pipe-type').textContent = site.pipe.type;
  document.getElementById('v360-pipe-depth').textContent = site.pipe.depth;
  document.getElementById('v360-pipe-dia').textContent = site.pipe.dia;
  
  const capEl = document.getElementById('v360-pipe-cap');
  capEl.textContent = site.pipe.cap;
  capEl.className = 'vps-val ' + (parseInt(site.pipe.cap) > 80 ? 'danger' : (parseInt(site.pipe.cap) > 60 ? 'warn' : 'good'));
  
  document.getElementById('v360-pipe-mat').textContent = site.pipe.mat;
  document.getElementById('v360-pipe-year').textContent = site.pipe.year;
  
  const statusEl = document.getElementById('v360-pipe-status');
  statusEl.textContent = site.pipe.status;
  statusEl.className = 'vps-val ' + (site.pipe.status === 'CRITICAL' ? 'danger' : (site.pipe.status === 'WARNING' ? 'warn' : 'good'));
  
  document.getElementById('v360-pipe-flow').textContent = site.pipe.flow;
}

function rotate360(deg) {
  v360State.lon += deg;
}

function reset360() {
  v360State.lon = 0;
  v360State.lat = 0;
}

function cycle360Site() {
  v360State.currentSiteIdx = (v360State.currentSiteIdx + 1) % v360State.sites.length;
  setStatus('SCANNING NEXT ACCESS POINT...', 'busy');
  load360Texture(v360State.sites[v360State.currentSiteIdx].texture);
  update360UI();
  setTimeout(() => setStatus('OPERATIONAL', ''), 1000);
}
function toggleDrainFlow() { 
  flowAnimActive = !flowAnimActive; 
  document.getElementById('dcb-flow').classList.toggle('active', flowAnimActive); 
  if (mapController) {
    const flowPaths = VIZAG_PIPES.map(p => p.pts);
    mapController.toggleFlow(flowAnimActive, flowPaths);
  }
}
function toggleDrainHeatmap() { 
  heatmapActive = !heatmapActive; 
  document.getElementById('dcb-heatmap').classList.toggle('active', heatmapActive); 
  if (mapController) {
    const heatData = VIZAG_WARDS.map(w => ({
      coords: [w.lat, w.lon],
      radius: 800,
      color: w.risk === 'CRITICAL' ? '#ff1744' : (w.risk === 'WARN' ? '#ff9100' : '#00e676')
    }));
    mapController.toggleHeatmap(heatmapActive, heatData);
  }
}

async function fetchAlerts() {
  try {
    const r = await fetch(`${API_BASE}/alerts/summary`);
    const d = await r.json();
    if (d.critical !== undefined) {
      document.getElementById('alert-count').textContent = d.critical;
      const hudCrisis = document.getElementById('hud-crisis');
      if (hudCrisis) hudCrisis.textContent  = d.critical;
      const pillCritical = document.getElementById('pill-critical');
      if (pillCritical) pillCritical.textContent = `${d.critical} CRITICAL`;
    }
  } catch(e) { 
    const ac = document.getElementById('alert-count');
    if (ac) ac.textContent = '!';
    setStatus('ALERTS ERR', 'error');
  }
}

fetchAlerts();

// ──────────────────────────────────────────────────────────
// ALERT FEED (left panel)
// ──────────────────────────────────────────────────────────
const ALERTS_DATA = [
  {sev:'critical', type:'AQUIFER COLLAPSE', title:'Krishna Basin Depletion',   desc:'GRACE-FO anomaly: -12.4M storage. 2,847 km² affected.', time:'14:00', evId:0, src:'GRACE-FO'},
  {sev:'critical', type:'SEVERE DROUGHT',   title:'Rajasthan Desert Advance',  desc:'GW -18.2M below norm. BW success <22%.',                time:'13:30', evId:1, src:'SENTINEL-1 / IMD'},
  {sev:'warning',  type:'OVER-EXTRACTION',  title:'Punjab Canal Overdraft',    desc:'Extraction 340% above yield. Soil desat confirmed.',     time:'12:45', evId:2, src:'CGWB / LANDSAT'},
  {sev:'info',     type:'BOREWELL SCAN',    title:'Hyderabad Cluster Scan',    desc:'47 sites. Avg success 68%. Depth: 190-230ft.',          time:'11:20', evId:3, src:'AQUAINTELLI v2'},
  {sev:'info',     type:'RECHARGE',         title:'Gujarat Aquifer Recovery',  desc:'Post-monsoon +4.2M anomaly. 980 km² zone.',            time:'10:55', evId:4, src:'GRACE-FO'},
  {sev:'warning',  type:'FLOOD RISK',       title:'Chennai Urban Drainage',    desc:'Drainage at 87%. Rain forecast 180mm.',                time:'09:30', evId:5, src:'IMD / SENTINEL-1'},
];

const TYPE_TO_MODULE = {
  'AQUIFER COLLAPSE': 'aquifer',
  'SEVERE DROUGHT':   'crisis',
  'OVER-EXTRACTION':  'groundwater',
  'BOREWELL SCAN':    'borewell',
  'RECHARGE':         'groundwater',
  'FLOOD RISK':       'flood'
};

function buildAlertFeed() {
  const feed = document.getElementById('alert-feed');
  if (!feed) return;
  feed.innerHTML = '';
  const smap = {critical:'badge-critical', warning:'badge-warning', info:'badge-info'};
  ALERTS_DATA.forEach(a => {
    const d = document.createElement('div'); d.className = 'alert-item';
    d.innerHTML = `
      <div class="alert-header">
        <span class="alert-badge ${smap[a.sev]}">${a.sev.toUpperCase()}</span>
        <span class="alert-type">${a.type}</span>
        <span class="alert-time">${a.time} UTC</span>
      </div>
      <div class="alert-title">${a.title}</div>
      <div class="alert-desc">${a.desc}</div>
      <div class="alert-src" style="font-family:'Share Tech Mono',monospace;font-size:7px;color:rgba(0,229,255,0.4);margin-top:4px;">PROVENANCE: ${a.src}</div>`;
    
    d.onclick = () => {
      // 1. Navigate to relevant module
      const targetMod = TYPE_TO_MODULE[a.type];
      if (targetMod) {
        switchModule(targetMod);
      }

      // 2. Fly to event location and show popup
      const ev = WATER_EVENTS.find(e => e.id === a.evId);
      if (ev) { 
        flyToLatLon(ev.lat, ev.lon, ev.loc, 10); 
        showEventPopup(ev); 
      }
    };
    feed.appendChild(d);
  });
}
buildAlertFeed();

// ──────────────────────────────────────────────────────────
// EVENT POPUP
// ──────────────────────────────────────────────────────────
function showEventPopup(ev) {
  activePopupEvent = ev;
  const col = SEV_COLORS[ev.sev];
  document.getElementById('popup-badge').textContent  = ev.sev.toUpperCase();
  document.getElementById('popup-badge').className    = 'alert-badge badge-' + ev.sev;
  document.getElementById('popup-type').textContent   = ev.type;
  document.getElementById('popup-title').textContent  = ev.name;
  document.getElementById('popup-time').textContent   = '— UTC';
  document.getElementById('popup-detail').innerHTML   =
    `LOC: ${ev.loc}<br>DEPTH: ${ev.depth}<br>AREA: ${ev.area}<br>SOURCE: GRACE-FO / SENTINEL`;
  const p = document.getElementById('event-popup');
  p.style.right  = '290px';
  p.style.bottom = '60px';
  p.classList.add('show');
}
function closePopup()  { document.getElementById('event-popup').classList.remove('show'); activePopupEvent=null; }
function flyToEvent()  { if (activePopupEvent) { flyToLatLon(activePopupEvent.lat, activePopupEvent.lon, activePopupEvent.loc, 10); closePopup(); } }

// ──────────────────────────────────────────────────────────
// MINI CHART (left panel)
// ──────────────────────────────────────────────────────────
function buildMiniChart() {
  const data = [72,68,65,63,60,58,61,59,57,55,53,56,54,52,49,47,50,48,45,43,41,44,42,40,38,36,39,37,35,33];
  const el = document.getElementById('mini-chart'); if (!el) return;
  el.innerHTML = '';
  const mx = Math.max(...data), mn = Math.min(...data);
  data.forEach(v => {
    const bar = document.createElement('div'); bar.className = 'bar';
    bar.style.height     = ((v-mn)/(mx-mn))*28+4 + 'px';
    bar.style.background = v<45?'var(--danger)':v<55?'var(--warning)':'var(--primary)';
    bar.style.opacity    = '0.7';
    el.appendChild(bar);
  });
}
buildMiniChart();

// ──────────────────────────────────────────────────────────
// PRED CHART (right panel)
// ──────────────────────────────────────────────────────────
function buildPredChart() {
  const c = document.getElementById('pred-chart'); if (!c) return;
  const cx = c.getContext('2d');
  c.width = c.offsetWidth * 2; c.height = 120; cx.scale(2,1);
  const W=c.offsetWidth, H=60, pts=[];
  for(let i=0;i<=30;i++) pts.push({x:(i/30)*W, y:10+rnd()*10+i*1.1});
  cx.strokeStyle='rgba(0,229,255,.6)'; cx.lineWidth=1; cx.beginPath();
  pts.forEach((p,i)=>i===0?cx.moveTo(p.x,p.y):cx.lineTo(p.x,p.y)); cx.stroke();
  cx.strokeStyle='rgba(255,107,0,.8)'; cx.setLineDash([3,3]); cx.beginPath();
  const ext=[];
  for(let i=0;i<=10;i++) ext.push({x:((30+i)/40)*W,y:pts[29].y+i*1.4+rnd()*4});
  ext.forEach((p,i)=>i===0?cx.moveTo(p.x,p.y):cx.lineTo(p.x,p.y)); cx.stroke(); cx.setLineDash([]);
  cx.fillStyle='rgba(0,229,255,.07)'; cx.beginPath(); cx.moveTo(0,H);
  pts.forEach(p=>cx.lineTo(p.x,p.y)); cx.lineTo(W,H); cx.closePath(); cx.fill();
}
setTimeout(buildPredChart, 100);

// ──────────────────────────────────────────────────────────
// TOOLBAR CONTROLS
// ──────────────────────────────────────────────────────────
function toggleLayer(btn, layer) {
    btn.classList.toggle('active');
    // Point #9: Navigate/Switch to module if active
    if (btn.classList.contains('active')) {
        if (MODULES[layer]) {
            switchModule(layer);
            return;
        }
    }
    // Implement layer visibility on Leaflet
    console.log("Toggle layer:", layer);
}
function setMapMode(mode) {
  document.querySelectorAll('.layer-btn').forEach(b=>{if(['2D','3D','TIME SERIES'].includes(b.textContent))b.classList.remove('active');});
  document.querySelectorAll('.layer-btn').forEach(b=>{
      if(b.textContent===mode || (mode==='4D' && b.textContent==='TIME SERIES')) {
          b.classList.add('active');
      }
  });
  
  const threeEl = document.getElementById('three-container');
  const timeEl  = document.getElementById('timeline-container');
  
  if (mode === '3D' || mode === '4D') {
    threeEl.classList.add('visible');
    initThreeScene();
    updateThreeModel(currentModule);
    const liveBorewell = window.borewellTelemetry || borewellTelemetry;
    if (currentModule === 'borewell' && liveBorewell) {
      // #region agent log
      sendDebugLog('H9', 'frontend/app.js:setMapMode', 'Applying live borewell telemetry on 3D open', {
        mode,
        rpm: liveBorewell.rpm,
        dynamic_level_m: liveBorewell.dynamic_level_m
      });
      // #endregion
      updateBorewellDiggingModel(liveBorewell);
    }
    if (mode === '4D') timeEl.classList.add('visible');
    else timeEl.classList.remove('visible');
  } else {
    threeEl.classList.remove('visible');
    timeEl.classList.remove('visible');
  }
}

function onTimeScroll() {
    const val = parseInt(document.getElementById('time-slider').value); // 0 to 10
    
    // Update time label in HUD to show 4D mode and simulated date
    const timeHud = document.getElementById('hud-time');
    if (timeHud) {
      const year = 2023 + Math.floor(val / 12);
      const month = String((val % 12) + 1).padStart(2, '0');
      timeHud.textContent = `${year}-${month}-01 / 4D SIMULATION MODE`;
      timeHud.style.color = '#ff6b00'; // Make it stand out as simulation
    }

    // ── Update Data Metrics Dynamically ──
    // Simulate data changes over time
    const simulatedGrace = (1.50 - (val / 10) * 4.16).toFixed(2); // From +1.50 to -2.66
    const simulatedMoisture = (45.0 - (val / 10) * 16.4).toFixed(1); // 45% -> 28.6%
    const simulatedDepth = (42.0 + (val / 10) * 31.3).toFixed(1); // 42m to 73.3m BGL
    const simulatedRisk = val < 4 ? "STABLE" : (val < 8 ? "WARNING" : "CRITICAL");
    
    // Apply simulated data to DOM metrics if they exist
    const mv0 = document.getElementById('mv-0');
    if (mv0) {
        mv0.textContent = simulatedGrace;
        mv0.className = 'metric-val ' + (parseFloat(simulatedGrace) < 0 ? 'danger' : 'good');
    }
    const mv1 = document.getElementById('mv-1');
    if (mv1) mv1.textContent = simulatedDepth;
    const mv2 = document.getElementById('mv-2');
    if (mv2) {
        mv2.textContent = simulatedMoisture + '%';
        mv2.className = 'metric-val ' + (parseFloat(simulatedMoisture) < 35 ? 'warning' : 'good');
    }
    const mv7 = document.getElementById('mv-7');
    if (mv7) {
        mv7.textContent = simulatedRisk;
        mv7.className = 'metric-val ' + (simulatedRisk === 'CRITICAL' ? 'danger' : simulatedRisk === 'WARNING' ? 'warn' : 'good');
        const card = mv7.closest('.metric-card');
        if (card) card.classList.toggle('risk-card', simulatedRisk !== 'STABLE');
    }
    
    // Update target block
    const tg = document.getElementById('target-grace');
    if (tg) tg.innerHTML = `GRACE: <span style="color:${parseFloat(simulatedGrace) < -2 ? 'var(--danger)' : 'var(--good)'};">${simulatedGrace}m</span> | SM: ${simulatedMoisture}%`;

    // ── Update 3D Models Dynamically ──
    if (!threeScene || !threeScene.currentModel) return;

    // 1. Groundwater/Aquifer 4D logic
    const aquifer = threeScene.currentModel.getObjectByName('aquifer');
    if (aquifer) {
        // Assume val=0 is historical (more water), val=10 is present (depleted)
        // 0 to 10 depletion scale. depletionFactor will be 2.0 at 0, 1.0 at 10.
        const depletionFactor = 1 + ((10 - val) * 0.1); 
        aquifer.scale.y = depletionFactor;
        
        // Correct position so the bottom of the aquifer stays anchored, only top level drops
        const baseHeight = aquifer.userData.baseHeight;
        const newHeight = baseHeight * depletionFactor;
        aquifer.position.y = aquifer.userData.baseY + (newHeight - baseHeight) / 2;
        
        // Color transition: Healthy blue at val=0 to Warning Red/Orange at val=10
        const r = Math.min(255, Math.floor((val / 10) * 255));
        const g = Math.min(255, Math.floor(((10 - val) / 10) * 229));
        const b = Math.min(255, Math.floor(((10 - val) / 10) * 255));
        aquifer.material.color.setRGB(r/255, g/255, b/255);
    }
    
    // Decrease flow particles in depleted state
    const particles = threeScene.currentModel.getObjectByName('particles');
    if (particles) {
        particles.material.opacity = val > 8 ? 0.2 : 1.0;
        particles.material.size = val > 8 ? 0.8 : 1.5;
    }
    
    // 2. Borewell 4D logic
    const well = threeScene.currentModel.getObjectByName('borewell');
    if (well) {
        // As time progresses, borewell has to be drilled deeper
        const drillFactor = 1 + (val * 0.05); // 1.0 at 0, 1.5 at 10
        well.scale.y = drillFactor;
        well.position.y = well.userData.baseY - (150 * (drillFactor - 1)) / 2; // Drill downwards
        
        // Make the well turn red indicating stress as it goes deeper
        if (val > 7) {
            well.material.color.setHex(0xff1744);
        } else {
            well.material.color.setHex(0xff6b00);
        }
    }
}

// ──────────────────────────────────────────────────────────
// THREE.JS 3D ENGINE
// ──────────────────────────────────────────────────────────
function initThreeScene() {
  if (threeScene) return;
  const container = document.getElementById('three-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0x00e5ff, 2);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  camera.position.set(0, 100, 200);
  camera.lookAt(0, 0, 0);

  threeScene = { scene, camera, renderer, models: {}, rotationSpeed: 0.005 };
  
  function animate() {
    requestAnimationFrame(animate);
    if (threeScene.currentModel) {
      threeScene.currentModel.rotation.y += (threeScene.rotationSpeed || 0.005);
    }
    // Borewell-specific visible digging animation (non-symmetric motion)
    if (currentModule === 'borewell' && threeScene.currentModel) {
      const bit = threeScene.currentModel.getObjectByName('drillBit');
      const marker = threeScene.currentModel.getObjectByName('drillMarker');
      if (bit) {
        borewellAnimState.phase += 0.08 + (Math.max(0, borewellAnimState.rpm) / 60000);
        const bob = Math.sin(borewellAnimState.phase) * 5.5;
        bit.rotation.z += 0.16 + (Math.max(0, borewellAnimState.rpm) / 12000);
        bit.position.y = (bit.userData.baseY || bit.position.y) + bob;
      }
      if (marker) {
        marker.rotation.x += 0.05 + (Math.max(0, borewellAnimState.rpm) / 20000);
      }
    }
    // Flowing groundwater animation based on real physics
    if (threeScene.gwParticles) {
      const positions = threeScene.gwParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i+2] += 0.1; // flow speed
        if (positions[i+2] > 40) {
          positions[i+2] = -40; // reset
        }
      }
      threeScene.gwParticles.geometry.attributes.position.needsUpdate = true;
    }
    // Drainage particles flow
    if (threeScene.drainageParticles) {
        threeScene.drainageParticles.forEach(p => {
            p.userData.t = (p.userData.t + 0.005) % 1;
            const pos = p.userData.curve.getPoint(p.userData.t);
            p.position.copy(pos);
        });
    }
    renderer.render(scene, camera);

  }
  animate();
}

function updateThreeModel(mod, data = null) {
  if (!threeScene) return;
  const { scene } = threeScene;
  
  // Clear previous models
  if (threeScene.currentModel) scene.remove(threeScene.currentModel);

  const group = new THREE.Group();
  // #region agent log
  sendDebugLog('H7', 'frontend/app.js:updateThreeModel:start', 'updateThreeModel start', { mod, hasData: !!data });
  // #endregion
  
  if (mod === 'groundwater' || mod === 'aquifer') {
    // 3D Subsurface Profile (Point #3) - Dynamic based on real world data
    let anomalyHeight = 30; // base height of saturated aquifer
    let moisterZoneHeight = 20;
    let waterColor = 0x00e5ff;
    
    if (data && data.satellite_data) {
        // e.g. grace anomaly -2 means less aquifer.
        anomalyHeight = Math.max(5, 30 + (data.satellite_data.grace_anomaly_m * 5));
        // Soil moisture affects the med level zone height
        moisterZoneHeight = Math.max(5, (data.satellite_data.soil_moisture_pct / 100) * 40);
        // Crisis check
        if (data.satellite_data.grace_anomaly_m < -4) {
            waterColor = 0xff1744; // Warning red for critical depletion
        }
    }

    // 1. Surface Layer (Agriculture/Soil)
    const sGeo = new THREE.BoxGeometry(100, 5, 100);
    const sMat = new THREE.MeshPhongMaterial({ color: 0x8d6e63 });
    const surface = new THREE.Mesh(sGeo, sMat);
    surface.position.y = 30;
    group.add(surface);

    // 2. Unsaturated Zone (Med Level - Dynamic)
    const mGeo = new THREE.BoxGeometry(100, moisterZoneHeight, 100);
    const mMat = new THREE.MeshPhongMaterial({ color: 0x5d4037, transparent:true, opacity:0.6 });
    const med = new THREE.Mesh(mGeo, mMat);
    med.position.y = 30 - 2.5 - (moisterZoneHeight / 2);
    group.add(med);

    // 3. Saturated Aquifer (High Level Data - Dynamic)
    const aGeo = new THREE.BoxGeometry(100, anomalyHeight, 100);
    const aMat = new THREE.MeshPhongMaterial({ color: waterColor, transparent:true, opacity:0.6, wireframe:true });
    const aquifer = new THREE.Mesh(aGeo, aMat);
    aquifer.position.y = med.position.y - (moisterZoneHeight / 2) - (anomalyHeight / 2);
    aquifer.name = 'aquifer';
    aquifer.userData.baseY = aquifer.position.y;
    aquifer.userData.baseHeight = anomalyHeight;
    group.add(aquifer);

    // 4. Feature: Simulation Observation Pipe (Borewell crossover)
    const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, 80, 16);
    const pipeMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.y = surface.position.y - 40;
    group.add(pipe);

    // 5. Feature: Flow Particles in the saturated zone
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 150;
    const pos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i+=3) {
      pos[i] = (Math.random() - 0.5) * 80;
      pos[i+1] = aquifer.position.y + (Math.random() - 0.5) * anomalyHeight;
      pos[i+2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.name = 'particles';
    group.add(particles);
    threeScene.gwParticles = particles; // For animation

    // 6. Bedrock (Base)
    const bGeo = new THREE.BoxGeometry(105, 5, 105);
    const bMat = new THREE.MeshPhongMaterial({ color: 0x212121 });
    const bedrock = new THREE.Mesh(bGeo, bMat);
    bedrock.position.y = -30;
    group.add(bedrock);

    threeScene.currentModel = group;
    scene.add(group);
    // #region agent log
    sendDebugLog('H7', 'frontend/app.js:updateThreeModel:groundwater_inner', 'Groundwater branch rendered', { children: group.children.length });
    // #endregion
  } 
  else if (mod === 'drainage') {
    // 3D Drainage System Clone (Point #5)
    // Main Artery
    const pipeGeo = new THREE.CylinderGeometry(2, 2, 120, 16);
    const pipeMat = new THREE.MeshPhongMaterial({ color: 0x757575 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI/2;
    group.add(pipe);

    // Branching networks
    for (let i=0; i<6; i++) {
        const branch = pipe.clone();
        branch.scale.set(0.5, 0.4, 0.5);
        branch.rotation.y = (Math.PI/3) * i;
        branch.position.x = Math.sin(i) * 20;
        group.add(branch);
    }
    
    threeScene.currentModel = group;
    scene.add(group);
  }
  else if (mod === 'city_drainage') {
    // Base city plane
    const planeGeo = new THREE.PlaneGeometry(200, 200);
    const planeMat = new THREE.MeshPhongMaterial({ color: 0x111111, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI/2;
    group.add(plane);

    if (drainageOptimalRoute) {
        // Render 3D Path
        const pts = drainageOptimalRoute.path.map((p, i) => {
            const dx = (p[1] - lon) * 1000;
            const dy = (p[0] - lat) * 1000;
            return new THREE.Vector3(dx, -5, dy);
        });
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 1.5, 8, false);
        const tubeMat = new THREE.MeshPhongMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        group.add(tube);

        // Add particles flowing through the tube
        const pCount = 50;
        const pGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
        for(let i=0; i<pCount; i++) {
            const p = new THREE.Mesh(pGeo, pMat);
            p.userData.t = Math.random();
            p.userData.curve = curve;
            group.add(p);
        }
        threeScene.drainageParticles = group.children.filter(c => c.userData.curve);

        // Render STP Marker in 3D
        const stpGeo = new THREE.BoxGeometry(10, 15, 10);
        const stpMat = new THREE.MeshPhongMaterial({ color: 0xff1744 });
        const stp = new THREE.Mesh(stpGeo, stpMat);
        const lastPt = pts[pts.length - 1];
        stp.position.set(lastPt.x, 0, lastPt.z);
        group.add(stp);
    }


    threeScene.currentModel = group;
    scene.add(group);
  }
  else if (mod === 'borewell') {

    // 3D Well model anchored beneath land surface
    const groundY = 35;
    const wellHeight = 150;

    const groundGeo = new THREE.BoxGeometry(170, 10, 170);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x6d4c41, transparent: true, opacity: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = groundY;
    group.add(ground);

    const cylinderGeo = new THREE.CylinderGeometry(5, 5, wellHeight, 32);
    const cylinderMat = new THREE.MeshPhongMaterial({ color: 0xff6b00, wireframe: true, transparent:true });
    const well = new THREE.Mesh(cylinderGeo, cylinderMat);
    well.position.y = groundY - (wellHeight / 2) - 4;
    well.name = 'borewell';
    well.userData.baseY = well.position.y;
    well.userData.baseHeight = wellHeight;
    group.add(well);

    // Drill head for live digging simulation
    const bitGeo = new THREE.ConeGeometry(6, 18, 16);
    const bitMat = new THREE.MeshPhongMaterial({ color: 0xff8f00 });
    const drillBit = new THREE.Mesh(bitGeo, bitMat);
    drillBit.name = 'drillBit';
    drillBit.position.y = well.position.y - (wellHeight / 2) - 9;
    drillBit.userData.baseY = drillBit.position.y;
    group.add(drillBit);

    // Asymmetric marker so rotation/drilling is visually obvious
    const markerGeo = new THREE.BoxGeometry(3, 16, 8);
    const markerMat = new THREE.MeshPhongMaterial({ color: 0x00e5ff });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.name = 'drillMarker';
    marker.position.set(10, well.position.y + 28, 0);
    group.add(marker);
    
    // Rock layers
    const layerGeo = new THREE.BoxGeometry(150, 10, 150);
    const layerMat = new THREE.MeshPhongMaterial({ color: 0x555555, opacity: 0.3, transparent: true });
    for(let i=0; i<3; i++) {
        const l = new THREE.Mesh(layerGeo, layerMat);
        l.position.y = groundY - 16 - (20 * i);
        l.name = 'rockLayer_' + i;
        group.add(l);
    }
  }
  
  scene.add(group);
  threeScene.currentModel = group;
  // #region agent log
  sendDebugLog('H7', 'frontend/app.js:updateThreeModel:end', 'updateThreeModel end', { mod, outerChildren: group.children.length });
  // #endregion
}

function updateBorewellDiggingModel(reading) {
  if (!threeScene || !threeScene.currentModel) return;
  const well = threeScene.currentModel.getObjectByName('borewell');
  const drillBit = threeScene.currentModel.getObjectByName('drillBit');
  if (!well || !reading) return;
  borewellTelemetry = reading;
  window.borewellTelemetry = reading;

  const dynLevel = Number(reading.dynamic_level_m || 0);
  const rpm = Number(reading.rpm || 0);
  // Amplify depth response so real telemetry deltas are visible in UI
  const depthFactor = Math.max(1, Math.min(1.85, 1 + ((dynLevel - 60) / 35)));
  well.scale.y = depthFactor;
  well.position.y = well.userData.baseY - ((well.userData.baseHeight || 150) * (depthFactor - 1)) / 2;

  if (drillBit) {
    drillBit.userData.baseY = well.position.y - ((well.userData.baseHeight || 150) * depthFactor / 2) - 9;
    drillBit.position.y = drillBit.userData.baseY;
  }

  const heat = Math.max(0, Math.min(1, rpm / 3200));
  well.material.color.setRGB(1, 0.42 + (0.35 * (1 - heat)), 0);

  if (threeScene) {
    // tie model spin to live drilling RPM
    threeScene.rotationSpeed = 0.002 + (Math.max(0, Math.min(3200, rpm)) / 3200) * 0.03;
  }
  borewellAnimState.rpm = rpm;
  borewellAnimState.depthFactor = depthFactor;

  // #region agent log
  sendDebugLog('H9', 'frontend/app.js:updateBorewellDiggingModel', 'Borewell digging model updated', {
    rpm,
    dynamic_level_m: dynLevel,
    depthFactor
  });
  // #endregion
}
window.updateBorewellDiggingModel = updateBorewellDiggingModel;
let isLive = true;
function togglePlayback() {
  isLive = !isLive;
  const b = document.getElementById('btn-playback');
  b.textContent = isLive ? '▶ LIVE' : '⏸ PAUSED';
  b.classList.toggle('active', isLive);
  if (!isLive) setStatus('TELEMETRY PAUSED', 'warn');
  else setStatus('OPERATIONAL', '');
}

// ──────────────────────────────────────────────────────────
// RAG
// ──────────────────────────────────────────────────────────
async function triggerRAG() {
  const q  = document.getElementById('rag-input').value;
  const el = document.getElementById('rag-response');
  el.style.display = 'block'; el.style.color = 'var(--text-dim)';
  el.innerHTML = '> QUERYING RAG SYSTEM...';
  try {
    const r = await fetch(`${API_BASE}/genai/rag/query`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:q}),
    });
    const d = await r.json();
    el.style.color  = 'var(--primary)';
    el.innerHTML    = `→ ${d.answer||'No response'}<br><span style="color:var(--text-dim);font-size:8px;">MODE: ${d.mode||'rag'} | SOURCES: ${(d.sources||[]).length}</span>`;
  } catch(e) {
    el.style.color = 'var(--warning)';
    el.innerHTML   = `> ERROR: ${e.message}. Backend running?`;
  }
}
document.getElementById('rag-input').addEventListener('keydown', e=>{ if(e.key==='Enter') triggerRAG(); });

// ──────────────────────────────────────────────────────────
// ENTERPRISE HEARTBEAT (12s Cycle)
// ──────────────────────────────────────────────────────────
let currentScenario = 'normal';
let waterCredits    = 1250;

function setScenario(scen) {
  currentScenario = scen;
  document.querySelectorAll('.admin-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`scen-${scen}`);
  if (btn) btn.classList.add('active');
  
  setStatus(`SCENARIO: ${scen.toUpperCase()}`, scen === 'normal' ? 'active' : 'warn');
  
  if (scen === 'contamination') {
    addAlert('CRITICAL', 'SPIKE DETECTED', 'Turbidity and TDS levels rising rapidly in Sector 7.');
  } else if (scen === 'leak') {
    addAlert('WARNING', 'PRESSURE DROP', 'Abnormal flow mismatch detected between Nodes 44 and 52.');
  }
  startPhase2TemporalLoop();
  if (lastGeoIntelligence) {
    const intelNow = getTemporalIntel(lastGeoIntelligence, phase2TemporalTick + 1);
    renderMapIntelligenceCard(currentModule, intelNow, lastGeoIntelligence._locationName);
    renderRightPanelEnrichment(currentModule, intelNow);
  }
}

function addAlert(badge, type, title) {
  const feed = document.querySelector('.alert-feed');
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'alert-item';
  item.innerHTML = `
    <div class="alert-header">
      <span class="alert-badge badge-${badge.toLowerCase()}">${badge}</span>
      <span class="alert-type">${type}</span>
      <span class="alert-time">JUST NOW</span>
    </div>
    <div class="alert-title">${title}</div>
  `;
  feed.prepend(item);
}

const GLOBAL_WATER_NODES = Array.from({length: 120}, (_, i) => ({
  id: `node-${i}`,
  lat: 10 + Math.random() * 20,
  lon: 70 + Math.random() * 20,
  type: i % 3 === 0 ? 'borewell' : (i % 3 === 1 ? 'reservoir' : 'pipeline'),
  status: Math.random() > 0.9 ? 'warning' : 'active'
}));

function enterpriseHeartbeat() {
  if(!isLive) {
    document.getElementById('telemetry-status').textContent = '● TELEMETRY PAUSED';
    document.getElementById('telemetry-dot').classList.remove('active');
    return;
  }
  
  // 1. Sync Alerts
  fetchAlerts();
  
  // 2. Simulate Node Telemetry
  const activeNodes = Math.floor(100 + Math.random() * 20);
  const throughput = (2.1 + Math.random() * 0.8).toFixed(1);
  document.getElementById('telemetry-status').textContent = '● LIVE SYNCHRONIZATION';
  document.getElementById('telemetry-dot').classList.add('active');
  document.getElementById('telemetry-meta').textContent = `POLLING ${activeNodes} NODES • ${throughput} MBPS`;
  
  // 3. Update Global Metrics
  const n = 3 + Math.floor(Math.random()*2);
  ['alert-count','hud-crisis'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=n; });
  
  // 4. Update Random Metric Drift (SaaS Simulation)
  if (currentModule !== 'godseyeview') {
    const valEl = document.getElementById('mv-1'); // Assume primary metric
    if (valEl) {
      let cur = parseFloat(valEl.textContent);
      if (!isNaN(cur)) {
        let drift = (Math.random() - 0.5) * 0.1;
        if (currentScenario === 'overuse') drift -= 0.4; // rapid drop
        if (currentScenario === 'contamination') drift += 0.8; // spike
        valEl.textContent = (cur + drift).toFixed(2);
      }
    }
  }
  
  // 5. ROI / Water Credit Engine
  if (isLive && currentScenario === 'normal') {
    waterCredits += Math.floor(Math.random() * 5);
    const crEl = document.getElementById('tenant-plan');
    if (crEl) crEl.textContent = `ENTERPRISE PLAN • ${waterCredits.toLocaleString()} WATER CREDITS (ROI: +${(waterCredits/1000).toFixed(1)}%)`;
  }

  // 6. Drift Global Status
  const gsZones = document.getElementById('gs-zones');
  if (gsZones) {
    const base = 847 + Math.floor(Math.sin(Date.now() / 50000) * 12);
    gsZones.textContent = base;
    const delta = document.getElementById('gs-zones-delta');
    if (delta) delta.textContent = `${Math.random() > 0.5 ? '↓' : '↑'} ${(Math.random() * 5).toFixed(1)}% THIS MONTH`;
  }
  const gsBore = document.getElementById('gs-borewells');
  if (gsBore) gsBore.textContent = (1247 + Math.floor(Math.random() * 50)).toLocaleString();

  console.log(`[HEARTBEAT] ${new Date().toISOString()} | Nodes: ${activeNodes} | TP: ${throughput}Mbps`);
}


// Global Keyboard Control for Demo
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'h') {
    const admin = document.getElementById('admin-controls');
    if (admin) admin.style.display = admin.style.display === 'none' ? 'flex' : 'none';
  }
});

setInterval(enterpriseHeartbeat, 12000);

// Frame counter (visual only)
setInterval(()=>{
  if(!isLive) return;
  const el = document.getElementById('frame-count');
  if (el) el.textContent = (1779 + Math.floor(Math.random()*50)).toLocaleString();
}, 3000);

// (moved to top for early access)

// ──────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  initCenterMap();
  setStatus('OPERATIONAL', '');
  enterpriseHeartbeat(); // initial pulse
  startPhase2TemporalLoop();
  const lat = parseFloat(document.getElementById('loc-lat').value);
  const lon = parseFloat(document.getElementById('loc-lon').value);
  const name = document.getElementById('loc-name').value;
  if (!isNaN(lat) && !isNaN(lon)) {
    refreshGeoIntelligence(currentModule, lat, lon, name, false);
  }
});
