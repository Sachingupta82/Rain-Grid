const express = require("express");
const router = express.Router();

const wardController = require("../controllers/ward.controller");

/* WARD DASHBOARD */

router.get(
  "/:wardId/dashboard",
  wardController.getWardDashboard
);

module.exports = router;