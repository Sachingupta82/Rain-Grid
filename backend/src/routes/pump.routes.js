const express = require("express");
const router = express.Router();

const pumpController = require("../controllers/pump.controller");

/**
 * Pump Management APIs
 */

/* Admin */
router.get("/", pumpController.getPumps);

router.post("/", pumpController.addPump);

router.put("/:pumpId", pumpController.updatePump);

router.delete("/:pumpId", pumpController.deletePump);

/* Ward */
router.get("/ward/:wardId", pumpController.getPumpsByWard);

/* Allocation */
router.post("/allocate", pumpController.allocatePump);

/* Deployment */
router.post("/deploy", pumpController.deployPump);

module.exports = router;