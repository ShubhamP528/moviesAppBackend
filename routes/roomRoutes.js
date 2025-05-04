const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const requireAuth = require("../middleware/requiredAuth");

router.post("/update", requireAuth, roomController.UpdateRoom);

router.post("/update-session", requireAuth, roomController.UpdateSession);

module.exports = router;
