const fs = require("fs");
const path = require("path");
const axios = require("axios");

exports.forecastFlood = async (req, res) => {

  try {

    const {
      rainfall_mm,
      drain_blockage_factor,
      pumps_deployed,
      pump_capacity_lps
    } = req.body;

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    ).features;

    let floodGrids = [];
    let wardRisk = {};

    for (const grid of grids) {

      const p = grid.properties;

      /* -----------------------
         Base risk
      ----------------------- */

      let risk = p.risk_score;

      /* rainfall impact */

      risk += rainfall_mm / 500;

      /* blockage impact */

      risk += drain_blockage_factor * 0.3;

      /* terrain effect */

      if (p.slope < 0.002)
        risk += 0.1;

      if (p.drain_density < 2)
        risk += 0.1;

      /* pump mitigation */

      const pumpEffect =
        (pumps_deployed * pump_capacity_lps) / 1000;

      risk -= pumpEffect * 0.05;

      risk = Math.max(0, Math.min(1, risk));

      /* -----------------------
         ML prediction
      ----------------------- */

      let mlProb = 0;

      try {

        const ml = await axios.post(
          "http://localhost:8000/predict",
          {
            elevation: p.elevation,
            slope: p.slope,
            distance_to_drain: p.distance_to_drain,
            drain_density: p.drain_density,
            rainfall: rainfall_mm,
            drain_blockage: drain_blockage_factor,
            event_count: 1
          }
        );

        mlProb = ml.data.flood_probability;

      } catch {}

      const finalRisk = (risk + mlProb) / 2;

      if (finalRisk > 0.7) {

        floodGrids.push({
          grid_id: p.grid_id,
          ward_id: p.ward_id,
          risk: finalRisk
        });

        if (!wardRisk[p.ward_id])
          wardRisk[p.ward_id] = 0;

        wardRisk[p.ward_id]++;

      }

    }

    /* -----------------------
       Pump requirement
    ----------------------- */

    const recommendedPumps =
      Math.ceil(floodGrids.length / 40);

    res.json({

      rainfall_mm,

      flood_grids: floodGrids.length,

      high_risk_wards: Object.keys(wardRisk).length,

      recommended_pumps: recommendedPumps,

      example_grids: floodGrids.slice(0, 20)

    });

  } catch (error) {

    res.status(500).json({
      message: "Flood forecast failed",
      error: error.message
    });

  }

};