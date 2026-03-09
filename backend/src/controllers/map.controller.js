const fs = require("fs");
const path = require("path");

/**
 * GET WARDS
 * Returns ward polygons
 */
exports.getWards = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/Delhi_Wards.geojson");

    const data = fs.readFileSync(filePath, "utf8");
    const wards = JSON.parse(data);

    res.status(200).json({
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
 * Returns flood risk grids
 */
exports.getGrids = async (req, res) => {
  try {

    const filePath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const data = fs.readFileSync(filePath, "utf8");
    const grids = JSON.parse(data);

    res.status(200).json({
      type: "FeatureCollection",
      count: grids.features.length,
      data: grids.features
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching grids",
      error: error.message
    });

  }
};


/**
 * GET SINGLE GRID DETAILS
 */
exports.getGridById = async (req, res) => {
  try {

    const gridId = parseInt(req.params.gridId);

    const filePath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const data = fs.readFileSync(filePath, "utf8");
    const grids = JSON.parse(data);

    const grid = grids.features.find(
      g => g.properties.grid_id === gridId
    );

    if (!grid) {
      return res.status(404).json({
        message: "Grid not found"
      });
    }

    res.status(200).json(grid);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching grid details",
      error: error.message
    });

  }
};


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
        const [ward_id, avg_risk, total_grids, high_risk_grids, readiness_score, status] = row.split(",");
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

exports.getGridInsights = async (req, res) => {
  try {

    const gridId = parseInt(req.params.gridId);

    /* ---------------------------
       LOAD GRID DATA
    ---------------------------- */

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

    /* ---------------------------
       LOAD EVENT DATA
    ---------------------------- */

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

    /* ---------------------------
       ENVIRONMENTAL CAUSES
    ---------------------------- */

    let environmentalCauses = [];

    if (p.elevation < 215)
      environmentalCauses.push("Low elevation area");

    if (p.slope < 0.002)
      environmentalCauses.push("Flat terrain slows runoff");

    if (p.distance_to_drain > 120)
      environmentalCauses.push("Limited drainage connectivity");


    /* ---------------------------
       EVENT CAUSES
    ---------------------------- */

    let eventCauses = [];

    eventHistory.forEach(e => {

      if (e.type === "construction")
        eventCauses.push({
          date: e.date,
          cause: "Construction activity may introduce debris into drains"
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


    /* ---------------------------
       PREDICTIONS
    ---------------------------- */

    let predictions = [];

    if (p.risk_level === "HIGH")
      predictions.push(
        "High probability of waterlogging during heavy rainfall"
      );

    if (p.slope < 0.002 && p.distance_to_drain > 100)
      predictions.push(
        "Water likely to accumulate due to slow runoff"
      );


    /* ---------------------------
       ACTIONS
    ---------------------------- */

    let actions = [];

    if (p.distance_to_drain > 120)
      actions.push("Inspect drainage connectivity");

    if (p.slope < 0.002)
      actions.push("Monitor runoff accumulation");

    if (p.risk_level === "HIGH")
      actions.push("Deploy mobile pumps during heavy rainfall");


    /* ---------------------------
       FINAL RESPONSE
    ---------------------------- */

    res.json({

      grid_id: p.grid_id,
      ward_id: p.ward_id,
      ward_name: p.ward_name,

      terrain_factors: {
        elevation: p.elevation,
        slope: p.slope,
        distance_to_drain: p.distance_to_drain
      },

      risk: {
        score: p.risk_score,
        level: p.risk_level
      },

      timeline: eventHistory,

      causal_chain: {
        environmental_causes: environmentalCauses,
        event_causes: eventCauses,
        predictions,
        actions
      }

    });

  } catch (error) {

    res.status(500).json({
      message: "Error generating causal chain",
      error: error.message
    });

  }
};

exports.getHotspots = async (req, res) => {
  try {

    const filePath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const data = fs.readFileSync(filePath, "utf8");
    const grids = JSON.parse(data);

    const sorted = grids.features
      .sort((a, b) => b.properties.risk_score - a.properties.risk_score)
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