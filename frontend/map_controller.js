// AquaIntelli — MapController (Leaflet)
// Keeps Leaflet concerns out of the giant app.js and makes the basemap legible.

(() => {
  if (!window.L) {
    console.error('[AquaMap] Leaflet not found (window.L missing).');
    return;
  }

  class MapController {
    /**
     * @param {string} mapElementId
     * @param {(hypothesisId:string, location:string, message:string, data?:any)=>void} debugLog
     */
    constructor(mapElementId, debugLog) {
      this.mapElementId = mapElementId;
      this.debugLog = typeof debugLog === 'function' ? debugLog : null;

      /** @type {import('leaflet').Map|null} */
      this.map = null;
      this.mainMarker = null;
      this.scanCircle = null;
      this.outerRing = null;
      this.eventMarkers = [];

      this.baseLayers = {};
      this.activeBaseKey = null;
      this.fallbackGrid = null;
      this._tileErrorCount = 0;
    }

    _log(hypothesisId, location, message, data) {
      try {
        if (this.debugLog) this.debugLog(hypothesisId, location, message, data || {});
      } catch (_) {}
    }

    init({ lat, lon, zoom, color, name, events = [] }) {
      if (this.map) return this.map;

      this.map = L.map(this.mapElementId, {
        center: [lat, lon],
        zoom,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true
      });

      this._installBaseLayers();
      this.setBaseLayer('dark');

      this.mainMarker = this._createPulseMarker(lat, lon, color, name);
      this.mainMarker.addTo(this.map);

      this.scanCircle = L.circle([lat, lon], {
        color,
        fillColor: color,
        fillOpacity: 0.05,
        opacity: 0.3,
        weight: 1,
        radius: 18000
      }).addTo(this.map);

      this.outerRing = L.circle([lat, lon], {
        color,
        fillColor: 'transparent',
        opacity: 0.15,
        weight: 0.5,
        radius: 40000,
        dashArray: '5 10'
      }).addTo(this.map);

      this.setEvents(events);

      // Make sure Leaflet sizes correctly in a fixed/flex dashboard
      this.map.whenReady(() => setTimeout(() => this.invalidateSize(), 200));

      return this.map;
    }

    invalidateSize() {
      if (!this.map) return;
      try { this.map.invalidateSize(true); } catch (_) {}
    }

    onClick(cb) {
      if (!this.map) return;
      this.map.on('click', cb);
    }

    flyTo(lat, lon, zoom) {
      if (!this.map) return;
      this.map.flyTo([lat, lon], zoom, { duration: 1.2, easeLinearity: 0.25 });
    }

    setMainTarget({ lat, lon, zoom, color, name, popupHtml }) {
      if (!this.map) return;
      const z = zoom ?? this.map.getZoom();
      this.flyTo(lat, lon, z);

      if (this.mainMarker) {
        this.mainMarker.setLatLng([lat, lon]);
        if (popupHtml) this.mainMarker.setPopupContent(popupHtml);
      }
      if (this.scanCircle) this.scanCircle.setLatLng([lat, lon]).setStyle({ color, fillColor: color });
      if (this.outerRing) this.outerRing.setLatLng([lat, lon]).setStyle({ color });
    }

    setBaseLayer(key) {
      if (!this.map) return;
      if (!this.baseLayers[key]) return;
      if (this.activeBaseKey === key) return;

      // Remove existing base
      if (this.activeBaseKey && this.baseLayers[this.activeBaseKey]) {
        this.map.removeLayer(this.baseLayers[this.activeBaseKey]);
      }

      this.baseLayers[key].addTo(this.map);
      this.activeBaseKey = key;

      // Toggle satellite-mode class for any additional CSS behavior
      const mapEl = document.getElementById(this.mapElementId);
      if (mapEl) mapEl.classList.toggle('satellite-mode', key === 'satellite');
    }

    _installBaseLayers() {
      const attachTileErrorFallback = (layer, layerName) => {
        layer.on('tileerror', () => {
          this._tileErrorCount += 1;
          if (this._tileErrorCount === 1) {
            this._enableFallbackGrid();
            this._log('H_MAP_TILES', 'frontend/map_controller.js', `Tile error on ${layerName} — enabling fallback grid`, {});
          }
        });
      };

      this.baseLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        crossOrigin: true
      });
      attachTileErrorFallback(this.baseLayers.dark, 'dark');

      this.baseLayers.light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        crossOrigin: true
      });
      attachTileErrorFallback(this.baseLayers.light, 'light');

      this.baseLayers.satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, crossOrigin: true }
      );
      attachTileErrorFallback(this.baseLayers.satellite, 'satellite');

      // Simple basemap switcher (top-left under zoom)
      const BasemapControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: () => {
          const div = L.DomUtil.create('div', 'aqua-basemap-control');
          div.innerHTML = `
            <button data-k="dark" class="abc-btn">DARK</button>
            <button data-k="light" class="abc-btn">LIGHT</button>
            <button data-k="satellite" class="abc-btn">SAT</button>
          `;
          L.DomEvent.disableClickPropagation(div);
          div.addEventListener('click', (e) => {
            const btn = e.target?.closest?.('button[data-k]');
            if (!btn) return;
            const k = btn.getAttribute('data-k');
            this.setBaseLayer(k);
            Array.from(div.querySelectorAll('button')).forEach(b => b.classList.toggle('active', b === btn));
          });
          // default active
          const first = div.querySelector('button[data-k="dark"]');
          if (first) first.classList.add('active');
          return div;
        }
      });
      this.map.addControl(new BasemapControl());
    }

    _enableFallbackGrid() {
      if (!this.map) return;
      if (this.fallbackGrid) return;

      this.fallbackGrid = L.gridLayer({ tileSize: 256, opacity: 1, zIndex: 0 });
      this.fallbackGrid.createTile = function (coords) {
        const tile = document.createElement('canvas');
        tile.width = 256; tile.height = 256;
        const ctx = tile.getContext('2d');
        ctx.fillStyle = '#050c16';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'rgba(0,229,255,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, 255, 255);
        ctx.fillStyle = 'rgba(200,244,255,0.55)';
        ctx.font = "12px 'Share Tech Mono', monospace";
        ctx.fillText(`z:${coords.z} x:${coords.x} y:${coords.y}`, 10, 22);
        ctx.fillStyle = 'rgba(200,244,255,0.25)';
        ctx.font = "10px 'Share Tech Mono', monospace";
        ctx.fillText('Tiles unavailable (offline/blocked)', 10, 42);
        return tile;
      };

      this.fallbackGrid.addTo(this.map);
    }

    setEvents(events) {
      if (!this.map) return;
      // Clear existing
      this.eventMarkers.forEach(m => { try { this.map.removeLayer(m); } catch (_) {} });
      this.eventMarkers = [];

      if (!Array.isArray(events)) return;
      events.forEach(ev => {
        if (typeof ev?.lat !== 'number' || typeof ev?.lon !== 'number') return;
        const col = ev?.color || '#ff6b00';
        const icon = L.divIcon({
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
          html: `
            <div style="position:relative;width:12px;height:12px;">
              <div style="width:12px;height:12px;border-radius:50%;background:${col};box-shadow:0 0 6px ${col};position:absolute;"></div>
              <div style="position:absolute;top:-1px;left:-1px;width:14px;height:14px;border-radius:50%;border:2px solid ${col};animation:marker-ring 2.4s ease-out infinite;"></div>
            </div>`
        });
        const m = L.marker([ev.lat, ev.lon], { icon });
        if (ev.popupHtml) m.bindPopup(ev.popupHtml, { maxWidth: 260 });
        m.addTo(this.map);
        this.eventMarkers.push(m);
      });
    }

    _createPulseMarker(lat, lon, color, name) {
      const html = `
        <div style="position:relative;width:14px;height:14px;">
          <div style="width:14px;height:14px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};position:absolute;top:0;left:0;"></div>
          <div style="position:absolute;top:-1px;left:-1px;width:16px;height:16px;border-radius:50%;border:2px solid ${color};animation:marker-ring 2.4s ease-out infinite;"></div>
        </div>`;
      const icon = L.divIcon({ html, className: '', iconSize: [14, 14], iconAnchor: [7, 7] });
      const marker = L.marker([lat, lon], { icon });
      const safeName = String(name || '').toUpperCase();
      marker.bindPopup(`
        <div style="font-family:'Share Tech Mono',monospace;color:${color};font-size:10px;">
          <div style="font-weight:700;margin-bottom:4px;letter-spacing:1px;">◎ ${safeName}</div>
          <div style="color:rgba(200,244,255,0.6);">LAT: ${lat.toFixed(4)}°N</div>
          <div style="color:rgba(200,244,255,0.6);">LON: ${lon.toFixed(4)}°E</div>
        </div>
      `, { maxWidth: 220 });
      return marker;
    }

    // ── DRAINAGE SYSTEM METHODS ──

    toggleOverlay(id, active, data = []) {
      if (!this.map) return;
      if (!this._overlays) this._overlays = {};

      if (!active) {
        if (this._overlays[id]) {
          this.map.removeLayer(this._overlays[id]);
          delete this._overlays[id];
        }
        return;
      }

      // If active, create the layer (Mock GeoJSON or shapes)
      const group = L.featureGroup();
      data.forEach(item => {
        if (item.type === 'pipe') {
          L.polyline(item.coords, { color: item.color || '#00e5ff', weight: item.weight || 3, opacity: 0.8 }).addTo(group);
        } else if (item.type === 'node') {
          L.circleMarker(item.coords, { radius: 5, color: '#fff', fillColor: '#00e5ff', fillOpacity: 1 }).addTo(group);
        }
      });

      group.addTo(this.map);
      this._overlays[id] = group;
    }

    toggleFlow(active, data = []) {
      if (!this.map) return;
      if (!this._flowLayers) this._flowLayers = [];

      if (!active) {
        this._flowLayers.forEach(l => this.map.removeLayer(l));
        this._flowLayers = [];
        return;
      }

      // Mock flow animation using moving circles along paths
      data.forEach(path => {
        const circle = L.circleMarker(path[0], { radius: 3, color: '#fff', fillOpacity: 1, zIndexOffset: 1000 });
        circle.addTo(this.map);
        this._flowLayers.push(circle);

        let step = 0;
        const animate = () => {
          if (!this._flowLayers.includes(circle)) return;
          step = (step + 1) % path.length;
          circle.setLatLng(path[step]);
          setTimeout(animate, 100);
        };
        animate();
      });
    }

    toggleHeatmap(active, data = []) {
      if (!this.map) return;
      if (!this._heatmapLayers) this._heatmapLayers = [];

      if (!active) {
        this._heatmapLayers.forEach(l => this.map.removeLayer(l));
        this._heatmapLayers = [];
        return;
      }

      data.forEach(point => {
        const heat = L.circle(point.coords, {
          radius: point.radius || 100,
          color: 'transparent',
          fillColor: point.color || '#ff1744',
          fillOpacity: 0.4
        }).addTo(this.map);
        this._heatmapLayers.push(heat);
      });
    }
  }

  window.AquaMap = { MapController };
})();

