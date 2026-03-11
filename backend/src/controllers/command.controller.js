const fs = require("fs");
const path = require("path");

exports.getCommandCenter = (req, res) => {

  try {

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const engineerPath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    const reportPath = path.join(
      __dirname,
      "../data/engineer_reports.json"
    );

    const pumps = fs.existsSync(pumpPath)
      ? JSON.parse(fs.readFileSync(pumpPath))
      : [];

    const engineers = fs.existsSync(engineerPath)
      ? JSON.parse(fs.readFileSync(engineerPath))
      : [];

    const grids = fs.existsSync(gridPath)
      ? JSON.parse(fs.readFileSync(gridPath)).features
      : [];

    const reports = fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath))
      : [];

    const hotspots = grids.filter(
      g => g.properties.risk_level === "HIGH"
    );

    res.json({

      pumps: {
        total: pumps.length,
        deployed: pumps.filter(p => p.status === "deployed").length
      },

      engineers: {
        total: engineers.length
      },

      flood_hotspots: hotspots.length,

      issues_reported: reports.length

    });

  } catch (error) {

    res.status(500).json({
      message: "Command center data failed",
      error: error.message
    });

  }

};