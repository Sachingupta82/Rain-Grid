const fs = require("fs");
const path = require("path");

/**
 * GET ALL ENGINEERS
 */
exports.getEngineers = (req, res) => {

  try {

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    res.json({
      total: engineers.length,
      engineers
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching engineers",
      error: error.message
    });

  }

};

exports.updateEngineer = (req, res) => {

  try {

    const engineerId = req.params.engineerId;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const engineer = engineers.find(
      e => e.engineer_id === engineerId
    );

    if (!engineer) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    Object.assign(engineer, req.body);

    fs.writeFileSync(
      filePath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({
      message: "Engineer updated",
      engineer
    });

  } catch (error) {

    res.status(500).json({
      message: "Engineer update failed",
      error: error.message
    });

  }

};


exports.deleteEngineer = (req, res) => {

  try {

    const engineerId = req.params.engineerId;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    let engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const exists = engineers.find(
      e => e.engineer_id === engineerId
    );

    if (!exists) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    engineers = engineers.filter(
      e => e.engineer_id !== engineerId
    );

    fs.writeFileSync(
      filePath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({
      message: "Engineer removed successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Engineer deletion failed",
      error: error.message
    });

  }

};


exports.changeEngineerWard = (req, res) => {

  try {

    const engineerId = req.params.engineerId;
    const { ward_id } = req.body;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const engineer = engineers.find(
      e => e.engineer_id === engineerId
    );

    if (!engineer) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    engineer.ward_id = ward_id;

    fs.writeFileSync(
      filePath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({
      message: "Engineer ward updated",
      engineer
    });

  } catch (error) {

    res.status(500).json({
      message: "Ward transfer failed",
      error: error.message
    });

  }

};

exports.uploadProof = (req, res) => {

  try {

    const { engineer_id, pump_id, grid_id, image_url } = req.body;

    if (!engineer_id || !pump_id || !image_url) {
      return res.status(400).json({
        message: "engineer_id, pump_id and image_url are required"
      });
    }

    const engineerPath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const proofPath = path.join(
      __dirname,
      "../data/deployment_proofs.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(engineerPath, "utf8")
    );

    const engineer = engineers.find(
      e => e.engineer_id === engineer_id
    );

    if (!engineer) {
      return res.status(404).json({
        message: "Engineer not found"
      });
    }

    /* ---------------------------
       LOAD EXISTING PROOFS
    --------------------------- */

    let proofs = [];

    if (fs.existsSync(proofPath)) {

      proofs = JSON.parse(
        fs.readFileSync(proofPath, "utf8")
      );

    }

    /* ---------------------------
       CREATE PROOF RECORD
    --------------------------- */

    const proof = {

      proof_id: "PRF_" + Date.now(),

      engineer_id,
      pump_id,
      grid_id,

      image_url,

      status: "pending_verification",

      uploaded_at: new Date()

    };

    proofs.push(proof);

    fs.writeFileSync(
      proofPath,
      JSON.stringify(proofs, null, 2)
    );

    res.json({

      message: "Deployment proof uploaded",

      proof

    });

  } catch (error) {

    res.status(500).json({
      message: "Proof upload failed",
      error: error.message
    });

  }

};




exports.reportIssue = (req, res) => {

  try {

    const {
      engineer_id,
      ward_id,
      grid_id,
      issue_type,
      description
    } = req.body;

    if (!engineer_id || !ward_id || !issue_type) {

      return res.status(400).json({
        message: "engineer_id, ward_id and issue_type are required"
      });

    }

    const issuePath = path.join(
      __dirname,
      "../data/engineer_reports.json"
    );

    let reports = [];

    if (fs.existsSync(issuePath)) {

      reports = JSON.parse(
        fs.readFileSync(issuePath, "utf8")
      );

    }

    const report = {

      report_id: "REP_" + Date.now(),

      engineer_id,
      ward_id,
      grid_id,

      issue_type,
      description,

      status: "pending",

      reported_at: new Date()

    };

    reports.push(report);

    fs.writeFileSync(
      issuePath,
      JSON.stringify(reports, null, 2)
    );

    res.json({

      message: "Issue reported successfully",

      report

    });

  } catch (error) {

    res.status(500).json({
      message: "Issue reporting failed",
      error: error.message
    });

  }

};


exports.requestResources = (req, res) => {

  try {

    const {
      engineer_id,
      ward_id,
      resource_type,
      quantity,
      reason
    } = req.body;

    if (!engineer_id || !resource_type || !quantity) {

      return res.status(400).json({
        message: "engineer_id, resource_type and quantity required"
      });

    }

    const requestPath = path.join(
      __dirname,
      "../data/resource_requests.json"
    );

    let requests = [];

    if (fs.existsSync(requestPath)) {

      requests = JSON.parse(
        fs.readFileSync(requestPath, "utf8")
      );

    }

    const request = {

      request_id: "REQ_" + Date.now(),

      engineer_id,
      ward_id,

      resource_type,
      quantity,

      reason,

      status: "pending",

      requested_at: new Date()

    };

    requests.push(request);

    fs.writeFileSync(
      requestPath,
      JSON.stringify(requests, null, 2)
    );

    res.json({

      message: "Resource request submitted",

      request

    });

  } catch (error) {

    res.status(500).json({
      message: "Resource request failed",
      error: error.message
    });

  }

};



exports.getWardResourceRequests = (req, res) => {

  try {

    const wardId = req.params.wardId;

    const requestPath = path.join(
      __dirname,
      "../data/resource_requests.json"
    );

    if (!fs.existsSync(requestPath)) {

      return res.json({
        ward_id: wardId,
        total_requests: 0,
        requests: []
      });

    }

    const requests = JSON.parse(
      fs.readFileSync(requestPath, "utf8")
    );

    const wardRequests = requests.filter(
      r => r.ward_id === wardId
    );

    res.json({

      ward_id: wardId,

      total_requests: wardRequests.length,

      requests: wardRequests

    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching resource requests",
      error: error.message
    });

  }

};


exports.approveResourceRequest = (req, res) => {

  try {

    const { request_id, status } = req.body;

    if (!request_id || !status) {

      return res.status(400).json({
        message: "request_id and status are required"
      });

    }

    const requestPath = path.join(
      __dirname,
      "../data/resource_requests.json"
    );

    if (!fs.existsSync(requestPath)) {

      return res.status(404).json({
        message: "No resource requests found"
      });

    }

    const requests = JSON.parse(
      fs.readFileSync(requestPath, "utf8")
    );

    const request = requests.find(
      r => r.request_id === request_id
    );

    if (!request) {

      return res.status(404).json({
        message: "Resource request not found"
      });

    }

    request.status = status;
    request.reviewed_at = new Date();

    fs.writeFileSync(
      requestPath,
      JSON.stringify(requests, null, 2)
    );

    res.json({

      message: "Resource request updated",

      request

    });

  } catch (error) {

    res.status(500).json({
      message: "Approval failed",
      error: error.message
    });

  }

};

exports.getEngineerTasks = (req, res) => {

  try {

    const engineerId = req.params.engineerId;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const engineer = engineers.find(
      e => e.engineer_id === engineerId
    );

    if (!engineer) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    res.json({
      engineer_id: engineerId,
      tasks: engineer.active_tasks || []
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching tasks",
      error: error.message
    });

  }

};


exports.completeTask = (req, res) => {

  try {

    const {
      engineer_id,
      pump_id
    } = req.body;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const engineer = engineers.find(
      e => e.engineer_id === engineer_id
    );

    if (!engineer) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    const task = engineer.active_tasks.find(
      t => t.pump_id === pump_id
    );

    if (!task) {

      return res.status(404).json({
        message: "Task not found"
      });

    }

    task.status = "completed";
    task.completed_at = new Date();

    fs.writeFileSync(
      filePath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({
      message: "Task completed",
      task
    });

  } catch (error) {

    res.status(500).json({
      message: "Task completion failed",
      error: error.message
    });

  }

};


/**
 * GET ENGINEERS BY WARD
 */
exports.getEngineersByWard = (req, res) => {

  try {

    const wardId = req.params.wardId;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const wardEngineers = engineers.filter(
      e => e.ward_id === wardId
    );

    res.json({
      ward_id: wardId,
      engineers: wardEngineers
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching ward engineers",
      error: error.message
    });

  }

};


/**
 * ADD ENGINEER
 */
exports.addEngineer = (req, res) => {

  try {

    const {
      engineer_id,
      engineer_name,
      ward_id,
      phone
    } = req.body;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const exists = engineers.find(
      e => e.engineer_id === engineer_id
    );

    if (exists) {

      return res.status(400).json({
        message: "Engineer already exists"
      });

    }

    const newEngineer = {
      engineer_id,
      engineer_name,
      ward_id,
      phone,
      active_tasks: []
    };

    engineers.push(newEngineer);

    fs.writeFileSync(
      filePath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({
      message: "Engineer added successfully",
      engineer: newEngineer
    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding engineer",
      error: error.message
    });

  }

};


/**
 * ASSIGN PUMP TASK
 */
exports.assignPumpTask = (req, res) => {

  try {

    const {
      engineer_id,
      pump_id,
      grid_id
    } = req.body;

    const filePath = path.join(
      __dirname,
      "../data/ward_engineers.json"
    );

    const engineers = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const engineer = engineers.find(
      e => e.engineer_id === engineer_id
    );

    if (!engineer) {

      return res.status(404).json({
        message: "Engineer not found"
      });

    }

    const task = {
      pump_id,
      grid_id,
      status: "pending",
      assigned_at: new Date()
    };

    engineer.active_tasks.push(task);

    fs.writeFileSync(
      filePath,
      JSON.stringify(engineers, null, 2)
    );

    res.json({
      message: "Pump task assigned",
      task
    });

  } catch (error) {

    res.status(500).json({
      message: "Task assignment failed",
      error: error.message
    });

  }

};



exports.getWardReports = (req, res) => {

  try {

    const wardId = req.params.wardId;

    const reportPath = path.join(
      __dirname,
      "../data/engineer_reports.json"
    );

    if (!fs.existsSync(reportPath)) {

      return res.json({
        ward_id: wardId,
        total_reports: 0,
        reports: []
      });

    }

    const reports = JSON.parse(
      fs.readFileSync(reportPath, "utf8")
    );

    const wardReports = reports.filter(
      r => r.ward_id === wardId
    );

    res.json({

      ward_id: wardId,

      total_reports: wardReports.length,

      reports: wardReports

    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching ward reports",
      error: error.message
    });

  }

};