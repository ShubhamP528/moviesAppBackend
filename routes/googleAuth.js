const express = require("express");
const route = express.Router();

const { passport, login } = require("../controllers/googleAuth.controller");

// Route to initiate Google authentication

route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback after Google has authenticated the user
route.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/google" }),
  login
);

module.exports = route;
