const express = require("express");
const router = express.Router();

const mapController = require("../controllers/map.controller");

/**
 * Map APIs
 */

router.get("/wards", mapController.getWards);

router.get("/grids", mapController.getGrids);

router.get("/grids/:gridId", mapController.getGridById);

router.get("/wards/readiness", mapController.getWardReadiness);

router.get("/grids/:gridId/insights", mapController.getGridInsights);

router.get("/hotspots", mapController.getHotspots);

module.exports = router;