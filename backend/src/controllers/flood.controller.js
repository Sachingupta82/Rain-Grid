const fs = require("fs");
const path = require("path");

exports.getFloodClusters = async (req, res) => {

  const simPath = path.join(
    __dirname,
    "../data/grid_water_simulation.json"
  );

  const sim = JSON.parse(
    fs.readFileSync(simPath, "utf8")
  );

  const flooded = [];

  for (const grid in sim) {

    if (sim[grid].risk === "HIGH") {

      flooded.push({
        grid_id: grid,
        water_level: sim[grid].water_level
      });

    }

  }

  res.json({
    flooded_grids: flooded.length,
    grids: flooded
  });

};