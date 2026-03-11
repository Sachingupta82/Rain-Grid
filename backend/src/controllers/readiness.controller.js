const fs = require("fs");
const path = require("path");

exports.getWardReadiness = async (req, res) => {

  try {

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const waterPath = path.join(
      __dirname,
      "../data/grid_water_simulation.json"
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    );

    let waterData = {};

    if (fs.existsSync(waterPath)) {
      waterData = JSON.parse(
        fs.readFileSync(waterPath, "utf8")
      );
    }

    const wards = {};

    grids.features.forEach(g => {

      const p = g.properties;

      if (!wards[p.ward_id]) {

        wards[p.ward_id] = {
          total_grids: 0,
          risk_sum: 0,
          flood_grids: 0,
          drain_density_sum: 0
        };

      }

      wards[p.ward_id].total_grids++;

      wards[p.ward_id].risk_sum += p.risk_score;

      wards[p.ward_id].drain_density_sum +=
        p.drain_density || 0;

      const sim = waterData[p.grid_id];

      if (sim && sim.risk === "HIGH") {
        wards[p.ward_id].flood_grids++;
      }

    });

    const result = [];

    for (const ward in wards) {

      const w = wards[ward];

      const avgRisk = w.risk_sum / w.total_grids;

      const floodRatio =
        w.flood_grids / w.total_grids;

      const avgDrain =
        w.drain_density_sum / w.total_grids;

      let readinessScore =
        100
        - (avgRisk * 60)
        - (floodRatio * 30)
        - (5 - avgDrain) * 2;

      readinessScore = Math.max(
        0,
        Math.min(100, readinessScore)
      );

      let status = "READY";

      if (readinessScore < 40)
        status = "CRITICAL";
      else if (readinessScore < 60)
        status = "HIGH RISK";
      else if (readinessScore < 80)
        status = "MODERATE";

      result.push({
        ward_id: ward,
        avg_risk: avgRisk.toFixed(2),
        flooded_grids: w.flood_grids,
        total_grids: w.total_grids,
        readiness_score: Math.round(readinessScore),
        status
      });

    }

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: "Error computing readiness",
      error: error.message
    });

  }

};