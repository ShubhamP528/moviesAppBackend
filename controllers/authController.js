const User = require("../models/User");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "2d" });
};
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.signup(username, email, password);

    // create a token

    const token = createToken(user._id);
    res.status(201).json({ username, token, room: user.room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.login(username, password);

    // create a Token
    const token = createToken(user._id);
    // console.log(user.room);
    res.status(200).json({ username, token, room: user.room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
