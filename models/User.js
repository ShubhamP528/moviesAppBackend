const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const googleAuthuser = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  room: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: String,
    default:
      "https://res.cloudinary.com/dgsjppp4a/image/upload/v1715063684/xeviafw34cp6msw7qmvo.png",
  },
});

const GoogleUser = mongoose.model("GoogleAuthUser", googleAuthuser);

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  room: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
  },
});

// static signup method

userSchema.statics.signup = async function (name, email, password) {
  // validation

  if (!email || !password || !name) {
    throw Error("ALl fields must be field");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not enough strong");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ email, password: hash, name });

  return user;
};

userSchema.statics.login = async function (name, password) {
  if (!name || !password) {
    throw Error("All fields must be field");
  }

  const user = await this.findOne({ name });

  if (!user) {
    throw Error("Incorrect name");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

const UserBasic = mongoose.model("User", userSchema);

module.exports = {
  UserBasic,
  GoogleUser,
};
