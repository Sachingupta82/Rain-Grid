const fs = require("fs");
const path = require("path");

exports.getWardDashboard = (req, res) => {

  try {

    const wardId = req.params.wardId;

    /* ---------------------------
       LOAD DATA FILES
    --------------------------- */

    const engineerPath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const reportPath = path.join(
      __dirname,
      "../data/engineer_reports.json"
    );

    const requestPath = path.join(
      __dirname,
      "../data/resource_requests.json"
    );

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    /* ---------------------------
       READ DATA
    --------------------------- */

    const engineers = fs.existsSync(engineerPath)
      ? JSON.parse(fs.readFileSync(engineerPath))
      : [];

    const pumps = fs.existsSync(pumpPath)
      ? JSON.parse(fs.readFileSync(pumpPath))
      : [];

    const reports = fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath))
      : [];

    const requests = fs.existsSync(requestPath)
      ? JSON.parse(fs.readFileSync(requestPath))
      : [];

    const grids = fs.existsSync(gridPath)
      ? JSON.parse(fs.readFileSync(gridPath)).features
      : [];

    /* ---------------------------
       FILTER WARD DATA
    --------------------------- */

    const wardEngineers = engineers.filter(
      e => e.ward_id === wardId
    );

    const wardPumps = pumps.filter(
      p => p.ward_id === wardId
    );

    const wardReports = reports.filter(
      r => r.ward_id === wardId
    );

    const wardRequests = requests.filter(
      r => r.ward_id === wardId
    );

    const wardHotspots = grids.filter(
      g =>
        g.properties.ward_id === wardId &&
        g.properties.risk_level === "HIGH"
    );

    /* ---------------------------
       RESPONSE
    --------------------------- */

    res.json({

      ward_id: wardId,

      engineers: wardEngineers,

      pumps: wardPumps,

      issues: wardReports,

      resource_requests: wardRequests,

      flood_hotspots: wardHotspots

    });

  } catch (error) {

    res.status(500).json({
      message: "Error generating ward dashboard",
      error: error.message
    });

  }

};