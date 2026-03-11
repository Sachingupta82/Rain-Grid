const fs = require("fs");
const path = require("path");

exports.simulateFloodSpread = (req, res) => {

  try {

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    ).features;

    let spreadZones = [];

    grids.forEach(g => {

      const p = g.properties;

      if (p.risk_score > 0.75) {

        spreadZones.push({
          grid_id: p.grid_id,
          ward_id: p.ward_id,
          predicted_spread: "Nearby grids may flood"
        });

      }

    });

    res.json({

      total_spread_zones: spreadZones.length,

      zones: spreadZones.slice(0, 30)

    });

  } catch (error) {

    res.status(500).json({
      message: "Flood spread simulation failed",
      error: error.message
    });

  }

};