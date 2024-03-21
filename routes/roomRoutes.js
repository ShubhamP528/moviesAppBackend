const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.post("/update", roomController.UpdateRoom);

module.exports = router;
