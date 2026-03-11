const express = require("express");
const router = express.Router();

const spreadController = require("../controllers/spread.controller");

/* ADMIN FLOOD SPREAD */

router.get(
  "/flood-spread",
  spreadController.simulateFloodSpread
);

module.exports = router;