// ═══════════════════════════════════════════════════════════════════════
// AquaIntelli — D3.js Renderers (M03 NDVI & M05 Drainage Network)
// ═══════════════════════════════════════════════════════════════════════

// --- M03 NDVI Heatmap Grid ---
window.renderNDVIGrid = function(containerId, gridData) {
    const container = document.getElementById(containerId);
    if (!container || !window.d3) return;
    container.innerHTML = "";

    const width = container.clientWidth;
    const height = 300;
    
    // Assuming gridData is an 8x8 matrix (array of arrays)
    const rows = gridData.length;
    const cols = gridData[0].length;
    
    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    const cellW = width / cols;
    const cellH = height / rows;

    // Color scale mapping NDVI (-1 to 1) to colors (Red -> Yellow -> Green)
    const colorScale = d3.scaleLinear()
        .domain([0, 0.4, 0.8])
        .range(["#ff1744", "#ffeb3b", "#00e676"]);

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const val = gridData[r][c];
            svg.append("rect")
                .attr("x", c * cellW)
                .attr("y", r * cellH)
                .attr("width", cellW - 2)
                .attr("height", cellH - 2)
                .attr("fill", colorScale(val))
                .attr("rx", 4)
                .on("mouseover", function() {
                    d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke", "none");
                });
                
            svg.append("text")
                .attr("x", (c * cellW) + (cellW/2))
                .attr("y", (r * cellH) + (cellH/2) + 4)
                .attr("text-anchor", "middle")
                .attr("fill", "#000")
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .text(val.toFixed(2));
        }
    }
};

// --- M05 D3.js Force-Directed Graph ---
window.renderDrainageNetwork = function(containerId, nodesData) {
    const container = document.getElementById(containerId);
    if (!container || !window.d3) return;
    container.innerHTML = "";

    const width = container.clientWidth;
    const height = 350;

    // We will procedurally generate edges (links) connecting these nodes for the topology
    const links = [];
    for(let i=0; i<nodesData.length - 1; i++) {
        // Connect consecutive nodes
        links.push({ source: nodesData[i].id, target: nodesData[i+1].id, value: 2 });
        // Add some random cross-links
        if (Math.random() > 0.5 && i < nodesData.length - 2) {
            links.push({ source: nodesData[i].id, target: nodesData[i+2].id, value: 1 });
        }
    }

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(nodesData)
        .force("link", d3.forceLink(links).id(d => d.id).distance(60))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#00e5ff")
        .attr("stroke-opacity", 0.4)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const nodeColor = s => s === 'CRITICAL' ? '#ff1744' : s === 'WARNING' ? '#ff9100' : '#00e676';
    const nodeSize = t => t === 'STP' ? 12 : t === 'PUMP' ? 8 : 5;

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodesData)
        .join("circle")
        .attr("r", d => nodeSize(d.type))
        .attr("fill", d => nodeColor(d.status))
        .call(drag(simulation));

    node.append("title").text(d => d.name + " (" + d.capacity_pct + "%)");

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
};
