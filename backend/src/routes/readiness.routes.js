const express = require("express");
const router = express.Router();

const readinessController = require("../controllers/readiness.controller");

router.get(
  "/ward-readiness",
  readinessController.getWardReadiness
);

module.exports = router;