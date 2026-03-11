const express = require("express");
const router = express.Router();

const optimizationController = require("../controllers/optimization.controller");

/* ADMIN PUMP OPTIMIZATION */

router.get(
  "/optimal-pump-placement",
  optimizationController.getOptimalPumpPlacement
);

module.exports = router;