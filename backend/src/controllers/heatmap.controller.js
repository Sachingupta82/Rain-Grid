const fs = require("fs");
const path = require("path");

exports.generateLiveRiskHeatmap = (req, res) => {

  try {

    const { rainfall_mm, drain_blockage } = req.body;

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    ).features;

    let updatedGrids = [];

    grids.forEach(grid => {

      const p = grid.properties;

      let dynamicRisk = p.risk_score;

      /* rainfall impact */

      dynamicRisk += rainfall_mm / 500;

      /* blockage impact */

      dynamicRisk += drain_blockage * 0.2;

      /* slope factor */

      if (p.slope < 0.002)
        dynamicRisk += 0.1;

      dynamicRisk = Math.max(0, Math.min(1, dynamicRisk));

      let level = "LOW";

      if (dynamicRisk > 0.7)
        level = "HIGH";
      else if (dynamicRisk > 0.4)
        level = "MEDIUM";

      updatedGrids.push({
        grid_id: p.grid_id,
        ward_id: p.ward_id,
        risk_score: dynamicRisk,
        risk_level: level
      });

    });

    res.json({

      rainfall_mm,

      total_grids: updatedGrids.length,

      heatmap: updatedGrids

    });

  } catch (error) {

    res.status(500).json({
      message: "Heatmap generation failed",
      error: error.message
    });

  }

};