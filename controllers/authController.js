const { UserBasic } = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

exports.createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "2d" });
};

createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "2d" });
};
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserBasic.signup(name, email, password);

    // create a token

    const token = createToken(user._id);
    res.status(201).json({ name, token, room: user.room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await UserBasic.login(name, password);

    // create a Token
    const token = createToken(user._id);
    // console.log(user.room);
    res.status(200).json({ name, token, room: user.room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const user = req.user;
    // console.log(user);
    const token = createToken(user._id);

    res.status(200).json({
      name: user.name,
      token,
      room: user.room,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

exports.signupForAll = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      throw Error("ALl fields must be field");
    }

    const existUser = await UserBasic.findOne({ email: email });
    if (existUser) {
      throw Error("Email already exist");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email is not valid");
    }

    if (!validator.isStrongPassword(password)) {
      throw Error("Password is not enough strong");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await UserBasic.create({ email, password: hash, name });
    const token = createToken(user._id);

    res.status(200).json({
      name: user.name,
      token,
      room: user.room,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.loginForAll = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw Error("All fields must be field");
    }

    const user = await UserBasic.findOne({ email });

    if (!user) {
      throw Error("Incorrect email");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw Error("Incorrect password");
    }

    const token = createToken(user._id);

    res.status(200).json({
      name: user.name,
      token,
      room: user.room,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
