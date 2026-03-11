const express = require("express");
const router = express.Router();

const cityController = require("../controllers/city.controller");

/* CITY ROOT CAUSE ANALYSIS */

router.get(
  "/city-root-causes",
  cityController.getCityRootCauses
);

router.get("/statistics", cityController.getCityStatistics)

module.exports = router;