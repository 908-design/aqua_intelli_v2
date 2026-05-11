// ═══════════════════════════════════════════════════════════════════════
// AquaIntelli — Three.js 3D Digital Twin Renderer
// ═══════════════════════════════════════════════════════════════════════

window.initThreeJSRenderer = function(containerId, moduleType, data) {
    // #region agent log
    fetch('http://127.0.0.1:7780/ingest/f67f863a-1fcc-45d3-8ee6-23daa86573a1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bee3ae'},body:JSON.stringify({sessionId:'bee3ae',runId:'pre-fix',hypothesisId:'H3',location:'frontend/three_renderer.js:init',message:'Three renderer init',data:{containerId,moduleType,hasTHREE:!!window.THREE,hasOrbitControls:!!(window.THREE&&window.THREE.OrbitControls)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = ""; // Clear existing

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f18);

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(200, 150, 250);

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Setup Controls (guarded for environments where OrbitControls is unavailable)
    let controls = null;
    if (window.THREE && typeof window.THREE.OrbitControls === 'function') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
    } else {
        // #region agent log
        fetch('http://127.0.0.1:7780/ingest/f67f863a-1fcc-45d3-8ee6-23daa86573a1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bee3ae'},body:JSON.stringify({sessionId:'bee3ae',runId:'post-fix',hypothesisId:'H3',location:'frontend/three_renderer.js:controls',message:'OrbitControls unavailable, using render-only mode',data:{hasTHREE:!!window.THREE,hasOrbitControls:!!(window.THREE&&window.THREE.OrbitControls)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 50);
    scene.add(dirLight);

    // Grid Helper
    const grid = new THREE.GridHelper(200, 20, 0x00e5ff, 0x1a2b3c);
    grid.position.y = 0;
    scene.add(grid);

    // Module References for updates
    const refs = { pipe: null, drillBit: null, water: null, rpm: 0, depth: 0, targetDepth: 0 };

    // Render Logic based on Module Type
    if (moduleType === 'borewell' && data && data.layers) {
        renderBorewellGeometry(scene, data.layers, refs);
    } else if (moduleType === 'aquifer') {
        renderAquiferVolume(scene);
    }

    // Export update function for live telemetry
    window.updateBorewellDiggingModel = (telemetry) => {
        if (!refs.pipe) return;
        refs.rpm = telemetry.rpm || 0;
        refs.targetDepth = telemetry.dynamic_level_m || refs.depth;
    };

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (controls) controls.update();

        // Borewell Realtime Animation
        if (moduleType === 'borewell' && refs.pipe) {
            // Rotate based on RPM (converted to radians per frame)
            const rotationSpeed = (refs.rpm / 60) * (Math.PI * 2) / 60; 
            refs.pipe.rotation.y += rotationSpeed;
            if (refs.drillBit) refs.drillBit.rotation.y += rotationSpeed;

            // Smoothly move water level if needed
            if (refs.water) {
                const targetY = -refs.targetDepth;
                refs.water.position.y += (targetY - refs.water.position.y) * 0.05;
            }

            // Subtle vibration if drilling (RPM > 0)
            if (refs.rpm > 0) {
                refs.pipe.position.x = (Math.random() - 0.5) * 0.2;
                refs.pipe.position.z = (Math.random() - 0.5) * 0.2;
            } else {
                refs.pipe.position.x = 0;
                refs.pipe.position.z = 0;
            }
        }

        renderer.render(scene, camera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container.clientWidth) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    return { scene, camera, renderer, controls, refs };
};

// --- BOREWELL 3D CROSS-SECTION (M04) ---
function renderBorewellGeometry(scene, layers, refs) {
    let currentY = 0;
    const radius = 30;

    // Build stratigraphy layers
    layers.forEach(layer => {
        const thickness = layer.depth_to - layer.depth_from;
        const geo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
        
        const isAquifer = layer.name.toLowerCase().includes('aquifer');
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(layer.color || 0x8B7355),
            transparent: isAquifer,
            opacity: isAquifer ? 0.4 : 0.9,
            roughness: 0.9,
            metalness: 0.0
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = currentY - (thickness / 2);
        scene.add(mesh);
        
        const wireframeGeo = new THREE.WireframeGeometry(geo);
        const wireframeMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.1 });
        const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
        mesh.add(wireframe);

        currentY -= thickness;
    });

    const totalDepth = layers[layers.length - 1].depth_to;

    // Add drill pipe group
    const pipeGroup = new THREE.Group();
    
    // Main shaft
    const pipeGeo = new THREE.CylinderGeometry(3, 3, totalDepth + 50, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
    pipeMesh.position.y = -(totalDepth + 50) / 2 + 25;
    pipeGroup.add(pipeMesh);

    // Drill Bit (Cone)
    const bitGeo = new THREE.ConeGeometry(6, 12, 16);
    const bitMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 1.0, roughness: 0.3 });
    const bitMesh = new THREE.Mesh(bitGeo, bitMat);
    bitMesh.position.y = -totalDepth;
    bitMesh.rotation.x = Math.PI;
    pipeGroup.add(bitMesh);

    scene.add(pipeGroup);
    refs.pipe = pipeGroup;
    refs.drillBit = bitMesh;

    // Dynamic Water Level
    const waterGeo = new THREE.CylinderGeometry(28, 28, 2, 32);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x00e5ff, 
        transparent: true, 
        opacity: 0.6, 
        emissive: 0x00e5ff, 
        emissiveIntensity: 0.5 
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -20; // Default level
    scene.add(waterMesh);
    refs.water = waterMesh;

    // Well Casing (Transparent)
    const caseGeo = new THREE.CylinderGeometry(30.5, 30.5, totalDepth, 32, 1, true);
    const caseMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.05 });
    const casing = new THREE.Mesh(caseGeo, caseMat);
    casing.position.y = -totalDepth/2;
    scene.add(casing);
}

// --- AQUIFER 3D SCANNER (M07) ---
function renderAquiferVolume(scene) {
    // Render a voxelized representation of the subsurface aquifer
    const group = new THREE.Group();
    
    // Create random voxels representing water saturation
    const size = 100;
    const spacing = 10;
    
    for(let x = -size; x < size; x+=spacing) {
        for(let y = -50; y < 0; y+=spacing) {
            for(let z = -size; z < size; z+=spacing) {
                // Determine saturation randomly for visual effect
                const noise = Math.sin(x*0.05) * Math.cos(z*0.05) * Math.sin(y*0.1);
                
                if (noise > 0.2) {
                    const geo = new THREE.BoxGeometry(spacing*0.8, spacing*0.8, spacing*0.8);
                    
                    // Colors based on saturation (Blue = saturated, Red = depleted)
                    const color = noise > 0.6 ? 0x00e5ff : (noise > 0.4 ? 0x0088ff : 0xff1744);
                    const opacity = noise > 0.4 ? 0.6 : 0.3;

                    const mat = new THREE.MeshStandardMaterial({
                        color: color,
                        transparent: true,
                        opacity: opacity,
                        emissive: color,
                        emissiveIntensity: 0.5
                    });
                    
                    const voxel = new THREE.Mesh(geo, mat);
                    voxel.position.set(x, y, z);
                    group.add(voxel);
                }
            }
        }
    }
    
    // Add bounding box
    const boxGeo = new THREE.BoxGeometry(size*2, 50, size*2);
    const boxMat = new THREE.MeshBasicMaterial({color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.1});
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = -25;
    scene.add(box);

    scene.add(group);
}
