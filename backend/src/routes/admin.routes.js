const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");

/* ADMIN COMMAND CENTER */

router.get(
  "/system-overview",
  adminController.getSystemOverview
);

module.exports = router;