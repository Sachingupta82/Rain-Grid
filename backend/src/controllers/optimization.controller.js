const fs = require("fs");
const path = require("path");

exports.getOptimalPumpPlacement = (req, res) => {

  try {

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    ).features;

    const highRisk = grids
      .filter(g => g.properties.risk_score > 0.7)
      .sort((a, b) =>
        b.properties.risk_score - a.properties.risk_score
      )
      .slice(0, 20);

    const plan = highRisk.map(g => {

      const p = g.properties;

      return {
        grid_id: p.grid_id,
        ward_id: p.ward_id,
        ward_name: p.ward_name,
        risk_score: p.risk_score,
        recommended_action: "Deploy mobile pump"
      };

    });

    res.json({
      recommended_pump_locations: plan
    });

  } catch (error) {

    res.status(500).json({
      message: "Pump optimization failed",
      error: error.message
    });

  }

};