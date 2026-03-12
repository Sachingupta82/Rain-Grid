const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * GET WARDS
 */
exports.getWards = async (req, res) => {
  try {

    const filePath = path.join(
      __dirname,
      "../data/Delhi_Wards.geojson"
    );

    const data = fs.readFileSync(filePath, "utf8");
    const wards = JSON.parse(data);

    res.json({
      type: "FeatureCollection",
      count: wards.features.length,
      data: wards.features
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching wards",
      error: error.message
    });

  }
};


/**
 * GET ALL GRIDS
 */
exports.getGrids = async (req, res) => {

  try {

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const gridData = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    );

    res.json({
      type: "FeatureCollection",
      count: gridData.features.length,
      data: gridData.features
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching grids",
      error: error.message
    });

  }

};


/**
 * GET GRID BY ID
 */
exports.getGridById = async (req, res) => {

  try {

    const gridId = parseInt(req.params.gridId);

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const gridData = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    );

    const grid = gridData.features.find(
      g => g.properties.grid_id === gridId
    );

    if (!grid) {
      return res.status(404).json({
        message: "Grid not found"
      });
    }

    res.json(grid);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching grid",
      error: error.message
    });

  }

};


/**
 * GET WARD READINESS
 */
exports.getWardReadiness = async (req, res) => {

  try {

    const filePath = path.join(
      __dirname,
      "../data/ward_readiness.csv"
    );

    const data = fs.readFileSync(filePath, "utf8");

    const rows = data
      .split("\n")
      .slice(1)
      .map(row => {

        const [
          ward_id,
          avg_risk,
          total_grids,
          high_risk_grids,
          readiness_score,
          status
        ] = row.split(",");

        return {
          ward_id,
          avg_risk,
          total_grids,
          high_risk_grids,
          readiness_score,
          status
        };

      });

    res.json(rows);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching ward readiness",
      error: error.message
    });

  }

};


async function generateAICausalChain(data) {

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are an urban flood risk analyst working for a city disaster command center.

Analyze the following grid data and produce structured JSON containing:

1. root_causes
2. risk_analysis
3. predicted_scenarios
4. recommended_actions

Grid Data:
${JSON.stringify(data, null, 2)}

Return ONLY JSON.
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();

  } catch (error) {

    return {
      message: "AI analysis unavailable"
    };

  }

}


/**
 * GRID INSIGHTS
 */
exports.getGridInsights = async (req, res) => {

  try {

    const gridId = parseInt(req.params.gridId);

    /* ---------------- GRID DATA ---------------- */

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const gridData = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    );

    const grid = gridData.features.find(
      g => g.properties.grid_id === gridId
    );

    if (!grid) {
      return res.status(404).json({
        message: "Grid not found"
      });
    }

    const p = grid.properties;

    /* ---------------- WATER SIMULATION ---------------- */

    const waterPath = path.join(
      __dirname,
      "../data/grid_water_simulation.json"
    );

    let waterSimulation = null;

    if (fs.existsSync(waterPath)) {

      const waterData = JSON.parse(
        fs.readFileSync(waterPath, "utf8")
      );

      const raw = waterData[p.grid_id] || null;
waterSimulation = raw ? {
  ...raw,
  depth_cm: raw.depth_cm ?? (raw.water_level != null ? +(raw.water_level * 100).toFixed(1) : null)
} : null;

    }

    /* ---------------- EVENTS ---------------- */

    const eventsPath = path.join(
      __dirname,
      "../data/grid_events.json"
    );

    let eventHistory = [];

    if (fs.existsSync(eventsPath)) {

      const eventsData = JSON.parse(
        fs.readFileSync(eventsPath, "utf8")
      );

      const gridEvents = eventsData.find(
        e => e.grid_id === gridId
      );

      if (gridEvents) {

        eventHistory = gridEvents.events.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

      }

    }

    /* ---------------- ENGINEER ---------------- */

    const engineerPath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    let engineer = null;

    if (fs.existsSync(engineerPath)) {

      const engineers = JSON.parse(
        fs.readFileSync(engineerPath, "utf8")
      );

      engineer = engineers.find(
        e => e.ward_id === p.ward_id
      );

    }

    /* ---------------- ML PREDICTION ---------------- */

    let mlPrediction = null;

    try {

      const rainfall = parseFloat(req.query.rainfall || 120);

      const mlResponse = await axios.post(
        "http://localhost:8000/predict",
        {
          elevation: p.elevation,
          slope: p.slope,
          distance_to_drain: p.distance_to_drain,
          drain_density: p.drain_density,
          rainfall: rainfall,
          drain_blockage: Math.min(eventHistory.length * 0.2, 1),
          event_count: eventHistory.length
        }
      );

      const prob = mlResponse.data.flood_probability || 0;

      let riskLevel = "LOW";

      if (prob > 0.7) riskLevel = "HIGH";
      else if (prob > 0.4) riskLevel = "MEDIUM";

      mlPrediction = {
        flood_probability: prob,
        risk_level: riskLevel
      };

    } catch (err) {

      mlPrediction = {
        error: "ML service unavailable"
      };

    }

    const mlProb = mlPrediction?.flood_probability || 0;

    /* ---------------- PUMP DATA ---------------- */

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    let pumpRecommendation = [];

    if (fs.existsSync(pumpPath)) {

      const pumps = JSON.parse(
        fs.readFileSync(pumpPath, "utf8")
      );

      const available = pumps.filter(
        p => p.status === "available"
      );

      if (
        (p.risk_level === "HIGH" || mlProb > 0.6) &&
        available.length > 0
      ) {

        const pump = available[0];

        pumpRecommendation.push({
          pump_id: pump.pump_id,
          capacity_lps: pump.capacity_lps,
          power_kw: pump.power_kw,
          reason: "High flood probability detected"
        });

      }

    }

    /* ---------------- EXISTING CAUSAL CHAIN ---------------- */

    let environmentalCauses = [];

    if (p.elevation < 215)
      environmentalCauses.push("Low elevation area");

    if (p.slope < 0.002)
      environmentalCauses.push("Flat terrain slows runoff");

    if (p.distance_to_drain > 120)
      environmentalCauses.push("Limited drainage connectivity");

    if (p.drain_density < 2)
      environmentalCauses.push("Low drainage network density");

    let eventCauses = [];

    eventHistory.forEach(e => {

      if (e.type === "construction")
        eventCauses.push({
          date: e.date,
          cause: "Construction debris may block drainage"
        });

      if (e.type === "road_digging")
        eventCauses.push({
          date: e.date,
          cause: "Road excavation may obstruct stormwater channels"
        });

      if (e.type === "drain_cleaning")
        eventCauses.push({
          date: e.date,
          cause: "Drain desilting improves water flow"
        });

      if (e.type === "complaint")
        eventCauses.push({
          date: e.date,
          cause: "Citizen reported water accumulation"
        });

    });

    let predictions = [];

    if (p.risk_level === "HIGH")
      predictions.push("Hydrology analysis indicates high waterlogging risk");

    if (mlProb > 0.7)
      predictions.push("Severe flood probability predicted");

    else if (mlProb > 0.4)
      predictions.push("Moderate flooding probability predicted");

    if (waterSimulation?.risk === "HIGH")
      predictions.push("Water simulation indicates flood cluster formation");

    let actions = [];

    if (p.distance_to_drain > 120)
      actions.push("Inspect drainage connectivity");

    if (p.slope < 0.002)
      actions.push("Monitor runoff accumulation");

    if (eventHistory.length > 2)
      actions.push("Inspect drains for debris due to nearby activities");

    if (mlProb > 0.7)
      actions.push("Deploy additional mobile pumps");

    if (waterSimulation?.risk === "HIGH")
      actions.push("Deploy pumps immediately");

    /* ---------------- AI CAUSAL ANALYSIS ---------------- */

/* ---------------- AI CAUSAL ANALYSIS ---------------- */

let aiAnalysis = null;

try {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
You are a flood intelligence system.

Return ONLY JSON.

Format:

{
"root_causes": ["..."],
"risk_analysis": ["..."],
"predicted_scenarios": ["..."],
"recommended_actions": ["..."]
}

Maximum 3 items per section.

GRID DATA:
Elevation: ${p.elevation}
Slope: ${p.slope}
Drain density: ${p.drain_density}

Events:
${JSON.stringify(eventHistory)}

Water risk: ${waterSimulation?.risk}
`;

  const result = await model.generateContent(prompt);

  let text = result.response.text();

  /* CLEAN MARKDOWN */

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  /* EXTRACT JSON BLOCK */

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start !== -1 && end !== -1) {

    const jsonString = text.substring(start, end + 1);

    aiAnalysis = JSON.parse(jsonString);

  } else {

    throw new Error("JSON not found");

  }

} catch (error) {

  console.log("AI parsing failed:", error.message);

  aiAnalysis = {
    root_causes: ["Low terrain slope"],
    risk_analysis: ["Localized water accumulation possible"],
    predicted_scenarios: ["Short-term waterlogging during rainfall"],
    recommended_actions: ["Inspect drainage near recent activities"]
  };

}

    /* ---------------- RESPONSE ---------------- */

    res.json({

      grid_id: p.grid_id,
      ward_id: p.ward_id,
      ward_name: p.ward_name,

      terrain_factors: {
        elevation: p.elevation,
        slope: p.slope,
        distance_to_drain: p.distance_to_drain,
        drain_density: p.drain_density
      },

      risk: {
        score: p.risk_score,
        level: p.risk_level
      },

      ml_prediction: mlPrediction,

      water_simulation: waterSimulation,

      responsible_engineer: engineer,

      pump_recommendation: pumpRecommendation,

      timeline: eventHistory,

      causal_chain: {
        environmental_causes: environmentalCauses,
        event_causes: eventCauses,
        predictions,
        actions
      },

      ai_causal_chain: aiAnalysis

    });

  } catch (error) {

    res.status(500).json({
      message: "Error generating grid insights",
      error: error.message
    });

  }

};

/**
 * HOTSPOTS
 */
exports.getHotspots = async (req, res) => {

  try {

    const filePath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const data = fs.readFileSync(filePath, "utf8");
    const grids = JSON.parse(data);

    const sorted = grids.features
      .sort((a, b) =>
        b.properties.risk_score - a.properties.risk_score
      )
      .slice(0, 2500);

    res.json({
      count: sorted.length,
      data: sorted
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching hotspots",
      error: error.message
    });

  }

};