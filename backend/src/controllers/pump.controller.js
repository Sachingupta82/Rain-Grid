const fs = require("fs");
const path = require("path");

/**
 * GET ALL PUMPS
 */
exports.getPumps = (req, res) => {

  try {

    const filePath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    res.json({
      total: pumps.length,
      pumps
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching pumps",
      error: error.message
    });

  }

};

exports.addPump = (req, res) => {

  try {

    const {
      pump_id,
      type,
      capacity_lps,
      power_kw
    } = req.body;

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(pumpPath, "utf8")
    );

    const exists = pumps.find(
      p => p.pump_id === pump_id
    );

    if (exists) {

      return res.status(400).json({
        message: "Pump already exists"
      });

    }

    const newPump = {
      pump_id,
      type,
      capacity_lps,
      power_kw,
      ward_id: null,
      status: "available"
    };

    pumps.push(newPump);

    fs.writeFileSync(
      pumpPath,
      JSON.stringify(pumps, null, 2)
    );

    res.json({
      message: "Pump added successfully",
      pump: newPump
    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding pump",
      error: error.message
    });

  }

};


exports.updatePump = (req, res) => {

  try {

    const pumpId = req.params.pumpId;

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(pumpPath, "utf8")
    );

    const pump = pumps.find(
      p => p.pump_id === pumpId
    );

    if (!pump) {

      return res.status(404).json({
        message: "Pump not found"
      });

    }

    Object.assign(pump, req.body);

    fs.writeFileSync(
      pumpPath,
      JSON.stringify(pumps, null, 2)
    );

    res.json({
      message: "Pump updated",
      pump
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating pump",
      error: error.message
    });

  }

};


/**
 * GET PUMPS BY WARD
 */
exports.getPumpsByWard = (req, res) => {

  try {

    const wardId = req.params.wardId;

    const filePath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const wardPumps = pumps.filter(
      p => p.ward_id === wardId
    );

    res.json({
      ward_id: wardId,
      pumps: wardPumps
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching ward pumps",
      error: error.message
    });

  }

};


/**
 * ADMIN ALLOCATES PUMP TO WARD
 */
exports.allocatePump = (req, res) => {

  try {

    const { pump_id, ward_id } = req.body;

    const filePath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const pump = pumps.find(
      p => p.pump_id === pump_id
    );

    if (!pump) {

      return res.status(404).json({
        message: "Pump not found"
      });

    }

    pump.ward_id = ward_id;
    pump.status = "allocated";

    fs.writeFileSync(
      filePath,
      JSON.stringify(pumps, null, 2)
    );

    res.json({
      message: "Pump allocated to ward",
      pump
    });

  } catch (error) {

    res.status(500).json({
      message: "Pump allocation failed",
      error: error.message
    });

  }

};


exports.deletePump = (req, res) => {

  try {

    const pumpId = req.params.pumpId;

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(pumpPath, "utf8")
    );

    const filtered = pumps.filter(
      p => p.pump_id !== pumpId
    );

    fs.writeFileSync(
      pumpPath,
      JSON.stringify(filtered, null, 2)
    );

    res.json({
      message: "Pump removed successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting pump",
      error: error.message
    });

  }

};


/**
 * ENGINEER DEPLOYS PUMP
 */
exports.deployPump = (req, res) => {

  try {

    const { pump_id, engineer_id, grid_id } = req.body;

    if (!pump_id || !engineer_id || !grid_id) {
      return res.status(400).json({
        message: "pump_id, engineer_id and grid_id are required"
      });
    }

    const pumpPath = path.join(
      __dirname,
      "../data/pumps.json"
    );

    const engineerPath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const pumps = JSON.parse(
      fs.readFileSync(pumpPath, "utf8")
    );

    const engineers = JSON.parse(
      fs.readFileSync(engineerPath, "utf8")
    );

    /* ---------------------------
       CHECK PUMP EXISTS
    --------------------------- */

    const pump = pumps.find(
      p => p.pump_id === pump_id
    );

    if (!pump) {

      return res.status(404).json({
        message: "Pump not found"
      });

    }

    /* ---------------------------
       CHECK PUMP ALLOCATED
    --------------------------- */

    if (!pump.ward_id) {

      return res.status(400).json({
        message: "Pump is not allocated to any ward"
      });

    }

    /* ---------------------------
       CHECK ALREADY DEPLOYED
    --------------------------- */

    if (pump.status === "deployed") {

      return res.status(400).json({
        message: "Pump already deployed"
      });

    }

    /* ---------------------------
       CHECK ENGINEER EXISTS
    --------------------------- */

    const engineer = engineers.find(
      e => e.engineer_id === engineer_id
    );

    if (!engineer) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    /* ---------------------------
       ENGINEER WARD VALIDATION
    --------------------------- */

    if (engineer.ward_id !== pump.ward_id) {

      return res.status(400).json({
        message: "Engineer does not belong to pump ward"
      });

    }

    /* ---------------------------
       CHECK TASK ASSIGNMENT
    --------------------------- */

    const task = engineer.active_tasks?.find(
      t =>
        t.pump_id === pump_id &&
        t.status === "pending"
    );

    if (!task) {

      return res.status(400).json({
        message:
          "Engineer has no assigned task for this pump"
      });

    }

    /* ---------------------------
       DEPLOY PUMP
    --------------------------- */

    pump.status = "deployed";
    pump.assigned_engineer = engineer_id;
    pump.location_grid = grid_id;
    pump.deployed_at = new Date();

    /* ---------------------------
       UPDATE TASK STATUS
    --------------------------- */

    task.status = "completed";
    task.completed_at = new Date();

    /* ---------------------------
       SAVE FILES
    --------------------------- */

    fs.writeFileSync(
      pumpPath,
      JSON.stringify(pumps, null, 2)
    );

    fs.writeFileSync(
      engineerPath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({

      message: "Pump deployed successfully",

      deployment: {
        pump_id,
        engineer_id,
        grid_id,
        deployed_at: pump.deployed_at
      },

      pump

    });

  } catch (error) {

    res.status(500).json({

      message: "Pump deployment failed",

      error: error.message

    });

  }

};