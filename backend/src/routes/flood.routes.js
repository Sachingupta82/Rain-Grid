const express = require("express");
const router = express.Router();
const floodController = require("../controllers/flood.controller");

router.get("/clusters", floodController.getFloodClusters);

module.exports = router;