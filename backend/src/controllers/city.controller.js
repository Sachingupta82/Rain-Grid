const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


exports.getCityRootCauses = async (req, res) => {

  try {

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const eventsPath = path.join(
      __dirname,
      "../data/grid_events.json"
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    ).features;

    let events = [];

    if (fs.existsSync(eventsPath)) {

      events = JSON.parse(
        fs.readFileSync(eventsPath, "utf8")
      );

    }

    /* ---------------- COLLECT STATISTICS ---------------- */

    let constructionCount = 0;
    let diggingCount = 0;
    let complaints = 0;
    let drainCleaning = 0;

    events.forEach(gridEvent => {

      gridEvent.events.forEach(event => {

        if (event.type === "construction")
          constructionCount++;

        if (event.type === "road_digging")
          diggingCount++;

        if (event.type === "complaint")
          complaints++;

        if (event.type === "drain_cleaning")
          drainCleaning++;

      });

    });

    /* ---------------- HIGH RISK GRIDS ---------------- */

    const highRiskGrids = grids.filter(
      g => g.properties.risk_level === "HIGH"
    );

    /* ---------------- ML RISK SAMPLE ---------------- */

    let mlSamples = [];

    for (let i = 0; i < Math.min(20, grids.length); i++) {

      const p = grids[i].properties;

      try {

        const ml = await axios.post(
          "http://localhost:8000/predict",
          {
            elevation: p.elevation,
            slope: p.slope,
            distance_to_drain: p.distance_to_drain,
            drain_density: p.drain_density,
            rainfall: 120,
            drain_blockage: 0.3,
            event_count: 1
          }
        );

        mlSamples.push(ml.data.flood_probability);

      } catch {}

    }

    const avgMLRisk =
      mlSamples.reduce((a, b) => a + b, 0) /
      (mlSamples.length || 1);

    /* ---------------- AI ANALYSIS ---------------- */

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

const prompt = `
You are an urban flood intelligence system.

Analyze the following city flood indicators and return SHORT structured JSON.

City Indicators:
Construction activities: ${constructionCount}
Road digging activities: ${diggingCount}
Citizen complaints: ${complaints}
Drain cleaning operations: ${drainCleaning}
High risk grids: ${highRiskGrids.length}

Rules:
- Maximum 3 items per list
- Short phrases only
- Do NOT mention machine learning or models
- Focus only on infrastructure and urban factors
- Return ONLY valid JSON

Output format:

{
  "root_causes": [],
  "infrastructure_issues": [],
  "risk_scenarios": [],
  "recommended_actions": []
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let aiText = response.text();

/* remove markdown code fences */

aiText = aiText.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

let aiAnalysis;

try {
  aiAnalysis = JSON.parse(aiText);
} catch {
  aiAnalysis = aiText;
}

    /* ---------------- RESPONSE ---------------- */

    res.json({

      city_statistics: {

        construction_events: constructionCount,
        road_digging_events: diggingCount,
        citizen_complaints: complaints,
        drain_cleaning_operations: drainCleaning,
        high_risk_grids: highRiskGrids.length,
        average_ml_risk: avgMLRisk

      },

      ai_city_analysis: aiAnalysis

    });

  } catch (error) {

    res.status(500).json({
      message: "City root cause analysis failed",
      error: error.message
    });

  }

};


exports.getCityStatistics = async (req, res) => {

  try {

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    )

    const gridData = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    )

    const grids = gridData.features

    const wards = new Set()

    let highRisk = 0

    grids.forEach(g => {

      wards.add(g.properties.ward_id)

      if (g.properties.risk_score > 0.7)
        highRisk++

    })

    res.json({

      total_grids: grids.length,
      total_wards: wards.size,
      high_risk_grids: highRisk

    })

  } catch (error) {

    res.status(500).json({
      message: "Failed to generate statistics",
      error: error.message
    })

  }

}