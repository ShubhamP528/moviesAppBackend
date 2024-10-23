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

const loginByGoogle = async (req, res) => {
  try {
    const email = req?.user?.emails[0]?.value;
    // console.log(email);
    const user = await UserBasic.findOne({ email });

    if (user) {
      const token = createToken(user._id);
      console.log(user);

      const room = user.room;

      console.log(typeof room);
      if (room === "") {
        console.log("room is here");
      }

      // if (process.env.production) {
      res.redirect(
        `https://smart-shop-kro.netlify.app/?token=${token}&email=${user.email}&profilePicture=${user.profilePicture}&name=${user.name}&room=${room}&profilePicture=${user.profilePicture}`
      );
      // } else {
      //   res.redirect(
      //     `http://localhost:3001/?token=${token}&email=${user.email}&profilePicture=${user.profilePicture}&name=${user.name}&room=${room}`
      //   );
      // }

      // return res
      //   .status(200)
      //   .json({ name: user.name, token, room: user.room });
    } else {
      const newUser = await UserBasic.create({
        name: req?.user?.displayName,
        email,
        googleId: req?.user?.id,
        profilePicture: req?.user?.photos[0]?.value,
      });

      console.log(newUser);

      const room = newUser.room;

      console.log(typeof room);
      if (room === "") {
        console.log("room is here");
      }
      const token = createToken(newUser._id);
      // if (process.env.production) {
      res.redirect(
        `https://smart-shop-kro.netlify.app/?token=${token}&email=${newUser.email}&profilePicture=${newUser.profilePicture}&name=${newUser.name}&room=${room}`
      );
      // } else {
      //   res.redirect(
      //     `http://localhost:3001/?token=${token}&email=${newUser.email}&profilePicture=${newUser.profilePicture}&name=${newUser.name}&room=${room}`
      //   );
      // }
      // return res
      //   .status(200)
      //   .json({ name: newUser?.name, token, room: newUser.room });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { passport, loginByGoogle };
