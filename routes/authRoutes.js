const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/requiredAuth");

router.post("/signup", authController.signupForAll);
router.post("/login", authController.loginForAll);

router.post("/signup-for-all", authController.signupForAll);
router.post("/login-for-all", authController.loginForAll);

router.post("/verify", requireAuth, authController.verify);

module.exports = router;
