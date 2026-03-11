const express = require("express");
const router = express.Router();

const engineerController = require("../controllers/engineer.controller");

/* ADMIN ROUTES */

router.get("/", engineerController.getEngineers);
router.post("/", engineerController.addEngineer);
router.put("/:engineerId", engineerController.updateEngineer);
router.delete("/:engineerId", engineerController.deleteEngineer);
router.patch("/:engineerId/change-ward", engineerController.changeEngineerWard);


/* WARD HEAD ROUTES */

router.get("/ward/:wardId", engineerController.getEngineersByWard);
router.post("/assign-task", engineerController.assignPumpTask);
router.get("/reports/:wardId", engineerController.getWardReports);
router.get(
  "/resource-requests/:wardId",
  engineerController.getWardResourceRequests
);
router.post(
  "/approve-resource-request",
  engineerController.approveResourceRequest
);


/* ENGINEER MOBILE ROUTES */

router.get("/:engineerId/tasks", engineerController.getEngineerTasks);
router.post("/complete-task", engineerController.completeTask);

router.post("/upload-proof", engineerController.uploadProof);
router.post("/report-issue", engineerController.reportIssue);
router.post("/request-resources", engineerController.requestResources);

module.exports = router;