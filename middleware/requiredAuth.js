const jwt = require("jsonwebtoken");

const User = require("../models/User");

require("dotenv").config();

const requireAuth = async (req, res, next) => {
  // verify authentication

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  console.log(token);

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    console.log(_id);

    // req.user= await User.findOne({_id}).select('_id')

    req.user = await User.findOne({ _id });
    console.log(req.user);
    next();
  } catch (err) {
    console.log(err.message);
    return res
      .status(401)
      .json({ error: "Request is not authorized", message: err.message });
  }
};

module.exports = requireAuth;
