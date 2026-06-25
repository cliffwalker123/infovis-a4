// This is your playground!
// Add functionality to your html controls, play with cytoscape's events and make those magic lenses!

/* global fetch, cytoscape, RadarChart, d3, XMLSerializer */
import _style from "./style.js";
import { default as d3Fisheye } from "./libs/d3-fisheye-2.1.2.js";
import { default as _ } from "./libs/underscore-1.13.6.js";

const ATTRIBUTE_THRESHOLD = 10;
const RADAR_SIZE = 96;

function numericAttributes(node) {
  return Object.entries(node)
    .filter(([key, value]) => {
      return key !== "id" && key !== "label" && Number.isFinite(Number(value));
    })
    .map(([key, value]) => [key, Number(value)]);
}

async function getData() {
  const football = await (await fetch("data/football.json")).json();
  const data = [];
  const maxByAttribute = {};

  football.nodes.forEach((n) => {
    const attributes = Object.fromEntries(numericAttributes(n));

    Object.entries(attributes).forEach(([key, value]) => {
      maxByAttribute[key] = Math.max(maxByAttribute[key] || 0, value);
    });

    data.push({
      data: {
        id: n.id,
        name: n.label,
        mins: n.mins_played || 0,
        attrCount: Object.keys(attributes).length,
        attributes,
      },
      group: "nodes",
    });
  });

  football.edges.forEach((n) => {
    data.push({
      data: {
        id: n.id,
        source: n.src,
        target: n.dst,
        weight: n.val,
      },
      group: "edges",
    });
  });

  return { elements: data, maxByAttribute };
}

// returns true if the point "p" is inside the circle defined by "c" (center) and "r" (radius)
function isInCircle(c, r, p) {
  return Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2) <= Math.pow(r, 2);
}

// returns the nodes that are visible 
function nodesInView(cy) {
  const ext = cy.extent();

  return cy.nodes().filter(n => {
    const bb = n.boundingBox()
    return bb.x1 > ext.x1 && bb.x2 < ext.x2 && bb.y1 > ext.y1 && bb.y2 < ext.y2
  })
}

function semanticLevelFromZoom(zoom) {
  if (zoom < 1) return 0;
  if (zoom < 2) return 1;
  return 2;
}

function ensureRadarCache() {
  let cache = document.getElementById("radar-cache");

  if (!cache) {
    cache = document.createElement("div");
    cache.id = "radar-cache";
    cache.style.position = "absolute";
    cache.style.left = "-10000px";
    cache.style.top = "-10000px";
    cache.style.width = "0";
    cache.style.height = "0";
    cache.style.overflow = "hidden";
    document.body.appendChild(cache);
  }

  return cache;
}

function chartIdForNode(node) {
  return `radar-chart-${String(node.id()).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function radarValuesForNode(node, maxByAttribute) {
  return Object.entries(node.data("attributes") || {})
    .filter(([key]) => maxByAttribute[key] > 0)
    .map(([key, value]) => ({
      axis: key,
      value: Number(value) / maxByAttribute[key],
    }));
}

function radarImageForNode(node, maxByAttribute) {
  if (node.data("radarImage")) {
    return node.data("radarImage");
  }

  const values = radarValuesForNode(node, maxByAttribute);

  if (!values.length || typeof RadarChart !== "function") {
    return "";
  }

  const cache = ensureRadarCache();
  const chartId = chartIdForNode(node);
  let chart = document.getElementById(chartId);

  if (!chart) {
    chart = document.createElement("div");
    chart.id = chartId;
    cache.appendChild(chart);
  }

  RadarChart(`#${chartId}`, [values], {
    w: RADAR_SIZE,
    h: RADAR_SIZE,
    levels: 3,
    maxValue: 1,
    labelFactor: 1,
    opacityArea: 0.45,
    opacityCircles: 0.08,
    dotRadius: 1.5,
    strokeWidth: 1.5,
    color: d3.scaleOrdinal(["#1f78b4"]),
  });

  const svg = chart.querySelector("svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const serialized = new XMLSerializer().serializeToString(svg);
  const image = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;

  node.data("radarImage", image);
  return image;
}

function applySemanticZoom(cy, maxByAttribute) {
  const level = semanticLevelFromZoom(cy.zoom());
  const richNodes = cy.nodes().filter((node) => node.data("attrCount") >= ATTRIBUTE_THRESHOLD);
  const sparseNodes = cy.nodes().filter((node) => node.data("attrCount") < ATTRIBUTE_THRESHOLD);

  cy.startBatch();
  cy.nodes().removeClass("hidden-semantic semantic-radar");
  cy.edges().removeClass("hidden-semantic");

  if (level === 0) {
    sparseNodes.addClass("hidden-semantic");
    cy.edges().forEach((edge) => {
      if (edge.source().data("attrCount") < ATTRIBUTE_THRESHOLD || edge.target().data("attrCount") < ATTRIBUTE_THRESHOLD) {
        edge.addClass("hidden-semantic");
      }
    });
  }

  if (level === 2) {
    nodesInView(cy).forEach((node) => {
      if (radarImageForNode(node, maxByAttribute)) {
        node.addClass("semantic-radar");
      }
    });
  }

  cy.endBatch();

  console.log(`Semantic level: ${level} (${richNodes.length} rich nodes, ${sparseNodes.length} sparse nodes)`);
}

async function main() {
  const { elements, maxByAttribute } = await getData();

  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements,
    minZoom: 0.2,
    maxZoom: 2.5,
  });

  const layout = cy.layout({
    name: "cola",
    nodeSpacing: 50,
    edgeLength: 800,
    animate: true,
    randomize: false,
    maxSimulationTime: 2000,
  });
  
  layout.run(); // emits special events! 
  
  cy.style(_style);

  cy.nodes().forEach((node) => {
    node.addClass(node.data("attrCount") >= ATTRIBUTE_THRESHOLD ? "attr-rich" : "attr-sparse");
  });

  const refreshSemanticZoom = _.throttle(() => {
    applySemanticZoom(cy, maxByAttribute);
  }, 150);
  
  cy.on("zoom", e => {
    const zoom_level = cy.zoom();
    console.log(`Zoom level: ${zoom_level}`);
    refreshSemanticZoom();
    
    /* 
      Your code goes here! 

      HINTs: 
        1. cy.zoom() returns the current zoom level. Notice how it changes while the layout is simulated! 
        2. This line above `cy.style(_style)`, loads the stylesheet from style.js, which you may also edit for the magic lenses later. You can load other stylesheets! 
        3. Use `nodesInView` to get a selection of only the nodes within the viewport
        4. For the radar charts, use the RadarChart function from /libs. See how it is used in: https://gist.github.com/nbremer/21746a9668ffdf6d8242 
    */

  });

  cy.on("pan resize", refreshSemanticZoom);
  layout.on("layoutstop", refreshSemanticZoom);
  refreshSemanticZoom();

  cy.on("mousemove", _.throttle(e => {
    const mouse = { x: e.originalEvent.x, y: e.originalEvent.y };
    console.log(`Mouse position: [x: ${mouse.x}, y: ${mouse.y}]`);

    cy.nodes().forEach((n) => {
      const node = n.renderedPosition(); // Careful: other position functions may invoke different coordinate systems

      // console.log(`Node position: [x: ${node.x}, y: ${node.y}]`);
    });
    
    /* 
      Your code also goes here! 

      HINTs: 
        1. use the "isInCircle" function defined above to calculate whether a node is inside the lens! 
        2. if you experience performance issues, use cy.startBatch() and cy.endBatch() to avoid unnecessary canvas redraws. See https://js.cytoscape.org/#cy.batch for more
        3. see below how to get the mouse and node positions
    */
  }, 100));

}

main();
