const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GoogleUser, UserBasic } = require("../models/User");
const { createToken } = require("../controllers/authController");

require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/googleAuth/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const login = async (req, res) => {
  try {
    const email = req?.user?.emails[0]?.value;
    // console.log(email);
    const user =
      (await GoogleUser.findOne({})) || (await UserBasic.findOne({ email }));

    if (user) {
      const token = createToken(user._id);
      console.log(user);

      return res
        .status(200)
        .json({ username: user.username, token, room: user.room });
    } else {
      const newUser = await GoogleUser.create({
        username: req?.user?.displayName,
        email,
        googleId: req?.user?.id,
        profilePicture: req?.user?.photos[0]?.value,
      });

      console.log(newUser);
      const token = createToken(newUser._id);
      return res
        .status(200)
        .json({ username: newUser?.username, token, room: newUser.room });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { passport, login };
