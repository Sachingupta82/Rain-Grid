const express = require("express");
const router = express.Router();

const simulationController = require("../controllers/simulation.controller");

router.post(
  "/simulate-flood",
  simulationController.simulateFlood
);

module.exports = router;