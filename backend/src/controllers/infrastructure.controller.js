const fs = require("fs");
const path = require("path");

exports.getDrains = async (req, res) => {

  try {

    const drainPath = path.join(
      __dirname,
      "../data/barapulla_drains.geojson"
    )

    const drains = JSON.parse(
      fs.readFileSync(drainPath, "utf8")
    )

    res.json(drains)

  } catch (error) {

    res.status(500).json({
      message: "Failed to load drainage data",
      error: error.message
    })

  }

}

exports.getInfrastructureRisk = (req, res) => {

  try {

    const eventsPath = path.join(
      __dirname,
      "../data/grid_events.json"
    );

    const gridPath = path.join(
      __dirname,
      "../data/grids_with_risk.geojson"
    );

    if (!fs.existsSync(eventsPath)) {

      return res.json({
        message: "No event data available",
        risks: []
      });

    }

    const events = JSON.parse(
      fs.readFileSync(eventsPath, "utf8")
    );

    const grids = JSON.parse(
      fs.readFileSync(gridPath, "utf8")
    ).features;

    let constructionZones = [];
    let diggingZones = [];
    let complaintZones = [];
    let drainCleaningZones = [];

    events.forEach(gridEvent => {

      const gridId = gridEvent.grid_id;

      gridEvent.events.forEach(event => {

        const grid = grids.find(
          g => g.properties.grid_id === gridId
        );

        if (!grid) return;

        const data = {
          grid_id: gridId,
          ward_id: grid.properties.ward_id,
          ward_name: grid.properties.ward_name,
          date: event.date,
          description: event.description
        };

        if (event.type === "construction")
          constructionZones.push(data);

        if (event.type === "road_digging")
          diggingZones.push(data);

        if (event.type === "complaint")
          complaintZones.push(data);

        if (event.type === "drain_cleaning")
          drainCleaningZones.push(data);

      });

    });

    res.json({

      infrastructure_risks: {

        construction_zones: constructionZones,

        road_digging_zones: diggingZones,

        complaint_hotspots: complaintZones,

        drain_cleaning_zones: drainCleaningZones

      }

    });

  } catch (error) {

    res.status(500).json({
      message: "Error analyzing infrastructure risks",
      error: error.message
    });

  }

};