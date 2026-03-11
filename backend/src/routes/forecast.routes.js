const express = require("express");
const router = express.Router();

const forecastController = require("../controllers/forecast.controller");

/* ADMIN FLOOD FORECAST */

router.post(
  "/flood-forecast",
  forecastController.forecastFlood
);

module.exports = router;