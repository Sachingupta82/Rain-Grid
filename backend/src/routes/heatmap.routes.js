const express = require("express");
const router = express.Router();

const heatmapController = require("../controllers/heatmap.controller");

/* ADMIN LIVE HEATMAP */

router.post(
  "/live-risk-heatmap",
  heatmapController.generateLiveRiskHeatmap
);

module.exports = router;