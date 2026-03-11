const express = require("express");
const router = express.Router();

const commandController = require("../controllers/command.controller");

/* ADMIN COMMAND CENTER */

router.get(
  "/live-command-center",
  commandController.getCommandCenter
);

module.exports = router;