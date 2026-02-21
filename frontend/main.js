// main.js - frontend logic: fetch data, render 3D, call API predict
// const API_BASE = "http://127.0.0.1:9000";

// const API_BASE = "http://127.0.0.1:8001"; // default: same origin; if running backend on different host: e.g. "http://localhost:8000"
const API_BASE =  "https://iris-visual-ai-api.onrender.com"; // deployed backend API URL
async function fetchData() {
  try {
    const res = await fetch(API_BASE + "/data?sample=150");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to fetch dataset:", e);
    return null;
  }
}

function render3D(data, highlight=null, elementId="plot3d") {
  const speciesColors = { "Iris-setosa": "#66c2ff", "Iris-versicolor": "#b39bff", "Iris-virginica": "#ffa66b" };
  const traceBySpecies = {};
  data.forEach(d => {
    const s = d["Species"];
    if (!traceBySpecies[s]) traceBySpecies[s] = { x:[], y:[], z:[], text:[] };
    traceBySpecies[s].x.push(d["PetalLengthCm"]);
    traceBySpecies[s].y.push(d["PetalWidthCm"]);
    traceBySpecies[s].z.push(d["SepalLengthCm"]);
    traceBySpecies[s].text.push(`Sepal: ${d.SepalLengthCm}, Petal: ${d.PetalLengthCm}`);
  });
  const traces = Object.keys(traceBySpecies).map(k => ({
    x: traceBySpecies[k].x,
    y: traceBySpecies[k].y,
    z: traceBySpecies[k].z,
    text: traceBySpecies[k].text,
    mode: 'markers',
    type: 'scatter3d',
    name: k,
    marker: { size: 4, color: speciesColors[k] || null, opacity:0.85 }
  }));
  if (highlight) {
    traces.push({
      x: [highlight.PetalLengthCm],
      y: [highlight.PetalWidthCm],
      z: [highlight.SepalLengthCm],
      mode: 'markers',
      marker: { size: 8, color: '#ffd86b', symbol: 'diamond' },
      name: 'Your input'
    });
  }
  const layout = {
    margin: { l:0, r:0, b:0, t:0 },
    scene: { xaxis:{title:"Petal Length"}, yaxis:{title:"Petal Width"}, zaxis:{title:"Sepal Length"} },
    template: 'plotly_dark',
    legend: { 
      orientation: 'h', x: 0.5, yanchor: 'top', y: -0.15, xanchor: 'center',
      // font: { size: 12 }
    }
  };
  Plotly.newPlot(elementId, traces, layout, {displayModeBar:true});
}

let dataset = null;
(async () => {
  dataset = await fetchData();
  if (!dataset) {
    document.getElementById("plot3d").innerText = "Failed to load dataset from backend. Make sure API is running.";
    return;
  }
  render3D(dataset, null, "plot3d");
  render3D(dataset, null, "plot2");
  // init vanta
  if (window.VANTA) {
    VANTA.NET({ el: "#vanta-bg", color: 0x9be5ff, backgroundColor: 0x071028, points: 8.0, maxDistance: 22.0, spacing: 18.0 });
  }
})();

document.getElementById("predictBtn").addEventListener("click", async () => {
  const sl = parseFloat(document.getElementById("sepal_length").value);
  const sw = parseFloat(document.getElementById("sepal_width").value);
  const pl = parseFloat(document.getElementById("petal_length").value);
  const pw = parseFloat(document.getElementById("petal_width").value);
  const payload = { sepal_length: sl, sepal_width: sw, petal_length: pl, petal_width: pw };
  try {
    const res = await fetch(API_BASE + "/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const rj = await res.json();
    if (!res.ok) {
      document.getElementById("predictionResult").hidden = false;
      document.getElementById("predSpecies").innerText = "Error: " + (rj.detail || "unknown");
      return;
    }
    // Show species + probs
    document.getElementById("predictionResult").hidden = false;
    document.getElementById("predSpecies").innerText = rj.species;
    const probDiv = document.getElementById("predProbs");
    probDiv.innerHTML = "";
    for (const [k,v] of Object.entries(rj.probabilities)) {
      const p = document.createElement("div");
      p.innerHTML = `<strong>${k}</strong>: ${v}%`;
      probDiv.appendChild(p);
    }
    // update hero metric
    const top = Math.max(...Object.values(rj.probabilities));
    document.getElementById("hero-pct").innerText = Math.round(top) + "%";
    // highlight in 3d
    const highlight = { PetalLengthCm: pl, PetalWidthCm: pw, SepalLengthCm: sl };
    render3D(dataset, highlight, "plot3d");
    render3D(dataset, highlight, "plot2");
  } catch (e) {
    console.error(e);
    document.getElementById("predictionResult").hidden = false;
    document.getElementById("predSpecies").innerText = "Network error";
  }
});

// autorotate toggle
let rotateInterval = null;
document.getElementById("autorotate").addEventListener("change", (ev) => {
  const checked = ev.target.checked;
  if (!checked) {
    if (rotateInterval) { clearInterval(rotateInterval); rotateInterval = null; }
    return;
  }
  let angle = 0;
  rotateInterval = setInterval(() => {
    angle += 0.02;
    const eye = {x: 1.6*Math.cos(angle), y: 1.6*Math.sin(angle), z: 0.6};
    Plotly.relayout("plot3d", {"scene.camera.eye": eye});
  }, 50);
});
