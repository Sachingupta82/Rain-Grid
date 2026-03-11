const fs = require("fs");
const path = require("path");

exports.getSystemOverview = (req, res) => {

  try {

    /* ---------------- LOAD DATA ---------------- */

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

    const readinessPath = path.join(
      __dirname,
      "../data/ward_readiness.csv"
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

    const readiness = fs.existsSync(readinessPath)
      ? fs.readFileSync(readinessPath, "utf8")
          .split("\n")
          .slice(1)
          .map(row => row.split(","))
      : [];

    /* ---------------- PUMP STATS ---------------- */

    const totalPumps = pumps.length;

    const deployedPumps = pumps.filter(
      p => p.status === "deployed"
    ).length;

    const allocatedPumps = pumps.filter(
      p => p.status === "allocated"
    ).length;

    const availablePumps = pumps.filter(
      p => p.status === "available"
    ).length;

    /* ---------------- ENGINEER STATS ---------------- */

    const totalEngineers = engineers.length;

    const activeEngineers = engineers.filter(
      e => e.status === "active"
    ).length;

    /* ---------------- FLOOD HOTSPOTS ---------------- */

    const floodHotspots = grids.filter(
      g => g.properties.risk_level === "HIGH"
    ).length;

    /* ---------------- CRITICAL WARDS ---------------- */

    const criticalWards = readiness.filter(
      r => r[5] === "CRITICAL"
    ).length;

    /* ---------------- RESPONSE ---------------- */

    res.json({

      pumps: {
        total: totalPumps,
        deployed: deployedPumps,
        allocated: allocatedPumps,
        available: availablePumps
      },

      engineers: {
        total: totalEngineers,
        active: activeEngineers
      },

      flood_status: {
        hotspots: floodHotspots,
        critical_wards: criticalWards
      }

    });

  } catch (error) {

    res.status(500).json({
      message: "Error generating system overview",
      error: error.message
    });

  }

};