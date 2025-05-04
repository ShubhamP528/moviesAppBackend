const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GoogleUser, UserBasic } = require("../models/User");
const { createToken } = require("../controllers/authController");

require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");

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
        `https://syncmovie-watch.netlify.app/?token=${token}&email=${user.email}&profilePicture=${user.profilePicture}&name=${user.name}&room=${room}&profilePicture=${user.profilePicture}`
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
        `https://syncmovie-watch.netlify.app/?token=${token}&email=${newUser.email}&profilePicture=${newUser.profilePicture}&name=${newUser.name}&room=${room}`
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

const loginByGooglePlus = async (req, res) => {
  try {
    const tokenT = req.body.token; // The token sent from the frontend

    if (!tokenT) {
      return res.status(400).json({ message: "Token is missing" });
    }
    const client = new OAuth2Client(process.env.UPDATED_CLIENT_ID);

    console.log(client);

    console.log(process.env.UPDATED_CLIENT_ID);

    // Verify the Google ID token using OAuth2Client
    const ticket = await client.verifyIdToken({
      idToken: tokenT,
      audience: process.env.UPDATED_CLIENT_ID, // Your Google OAuth 2.0 Client ID
    });

    console.log(ticket);

    const payload = ticket.getPayload(); // Get user info from the token
    const email = payload.email;
    const name = payload.name;
    const profilePicture = payload.picture;
    const googleId = payload.sub; // This is the unique ID from Google
    console.log(payload);

    // Check if the user already exists in the database
    let user;

    user = await UserBasic.findOne({ email });

    // user = await User.findOne({
    //   $or: [{ googleAuthId: googleId }, { email: email }],
    // });

    if (!user) {
      user = await UserBasic.create({
        name: name,
        email,
        googleId: googleId,
        profilePicture: profilePicture,
      });
    }

    await user.save();

    const token = createToken(user._id);
    return res.json({
      name: user.name,
      email: user.email,
      userId: user._id,
      token,
      profilePicture: user.profilePicture,
      room: user.room,
      sessionType: user.sessionType,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

module.exports = { passport, loginByGoogle, loginByGooglePlus };
