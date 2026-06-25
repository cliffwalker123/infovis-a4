const _style = [{
  "selector": "core",
  "style": {
    "selection-box-color": "#AAD8FF",
    "selection-box-border-color": "#8BB0D0",
    "selection-box-opacity": "0.5"
  }
}, {
  "selector": "node",
  "style": {
    "width": "mapData(mins, 0, 1000, 10, 100)",
    "height": "mapData(mins, 0, 1000, 10, 100)",
    "content": "data(name)",
    "font-size": "12px",
    "text-valign": "center",
    "text-halign": "center",
    "background-color": "#555",
    "text-outline-color": "#555",
    "text-outline-width": "2px",
    "color": "#fff",
    "overlay-padding": "6px",
    "z-index": "10"
  }
}, {
  "selector": "node.attr-rich",
  "style": {
    "shape": "ellipse",
    "background-color": "#2f6f9f",
    "text-outline-color": "#2f6f9f"
  }
}, {
  "selector": "node.attr-sparse",
  "style": {
    "shape": "rectangle",
    "background-color": "#b35c32",
    "text-outline-color": "#b35c32"
  }
}, {
  "selector": ".hidden-semantic",
  "style": {
    "display": "none"
  }
}, {
  "selector": "node.semantic-radar",
  "style": {
    "shape": "rectangle",
    "width": "112px",
    "height": "112px",
    "background-color": "#ffffff",
    "background-opacity": "1",
    "background-image": "data(radarImage)",
    "background-fit": "contain",
    "background-width": "100%",
    "background-height": "100%",
    "border-width": "2px",
    "border-color": "#1f78b4",
    "content": "data(name)",
    "font-size": "9px",
    "text-valign": "bottom",
    "text-halign": "center",
    "text-margin-y": "8px",
    "text-outline-color": "#1f78b4",
    "text-outline-width": "1px",
    "z-index": "20"
  }
}, {
  "selector": "node:selected",
  "style": {
    "border-width": "6px",
    "border-color": "#AAD8FF",
    "border-opacity": "0.5",
    "background-color": "#77828C",
    "text-outline-color": "#77828C"
  }
}, {
  "selector": "edge",
  "style": {
    "curve-style": "haystack", // bezier, taxi, ...
    "haystack-radius": "0.5",
    "opacity": "0.4",
    "line-color": "#bbb",
    "width": "mapData(weight, 0, 1, 1, 8)",
    "overlay-padding": "3px"
  }
}, {
  "selector": "edge.lens-edge-highlight",
  "style": {
    "line-color": "#ffd400",
    "opacity": "0.95",
    "width": "8px",
    "z-index": "30"
  }
}, {
  "selector": "node.magic",
  "style": {
    // your magic lens effects for nodes go here! 
    // See https://js.cytoscape.org/#style for all options
  }
}, {
  "selector": "edge.magic",
  "style": {
    // your magic lens effects for edges go here! 
    // See https://js.cytoscape.org/#style for all options
  }
}]

export default _style;
