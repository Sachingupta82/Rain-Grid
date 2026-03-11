const fs = require("fs");
const path = require("path");

exports.simulateFloodLogic = async (params) => {

  const {
    rainfall_mm,
    pumps_allocated,
    pump_capacity_lps,
    drain_blockage_factor
  } = params;

  const gridPath = path.join(
    __dirname,
    "../data/grids_with_risk.geojson"
  );

  const waterPath = path.join(
    __dirname,
    "../data/grid_water_simulation.json"
  );

  const gridData = JSON.parse(
    fs.readFileSync(gridPath, "utf8")
  );

  let waterData = {};

  if (fs.existsSync(waterPath)) {

    waterData = JSON.parse(
      fs.readFileSync(waterPath, "utf8")
    );

  }

  let simulatedGrids = [];
  let criticalWards = {};

  gridData.features.forEach(grid => {

    const p = grid.properties;

    let simulatedRisk = p.risk_score;

    /* rainfall impact */

    simulatedRisk += rainfall_mm / 500;

    /* drain blockage impact */

    simulatedRisk += drain_blockage_factor * 0.25;

    /* drain density mitigation */

    if (p.drain_density) {
      simulatedRisk -= p.drain_density * 0.02;
    }

    /* water propagation */

    const waterSim = waterData[p.grid_id];

    if (waterSim) {

      if (waterSim.risk === "HIGH")
        simulatedRisk += 0.3;

      if (waterSim.risk === "MEDIUM")
        simulatedRisk += 0.15;

    }

    /* pump mitigation */

    const pumpEffect =
      (pumps_allocated * pump_capacity_lps) / 1000;

    simulatedRisk -= pumpEffect * 0.05;

    /* clamp */

    simulatedRisk = Math.max(
      0,
      Math.min(1, simulatedRisk)
    );

    simulatedGrids.push({
      grid_id: p.grid_id,
      ward_id: p.ward_id,
      simulated_risk: simulatedRisk
    });

    if (simulatedRisk > 0.7) {

      if (!criticalWards[p.ward_id])
        criticalWards[p.ward_id] = 0;

      criticalWards[p.ward_id]++;

    }

  });

  const affectedGrids = simulatedGrids.filter(
    g => g.simulated_risk > 0.7
  );

  const recommendedPumps =
    Math.ceil(affectedGrids.length / 50);

  const pumpDeficit =
    Math.max(recommendedPumps - pumps_allocated, 0);

  return {

    rainfall_mm,
    pumps_allocated,
    pump_capacity_lps,

    affected_grids: affectedGrids.length,

    critical_wards: Object.keys(criticalWards).length,

    recommended_pumps: recommendedPumps,

    pump_deficit: pumpDeficit,

    simulated_grids: simulatedGrids

  };

};