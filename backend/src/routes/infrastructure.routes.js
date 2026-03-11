const express = require("express");
const router = express.Router();

const infraController = require("../controllers/infrastructure.controller");

/* ADMIN INFRASTRUCTURE INTELLIGENCE */

router.get("/drains", infraController.getDrains)

router.get(
  "/infrastructure-risk",
  infraController.getInfrastructureRisk
);

module.exports = router;