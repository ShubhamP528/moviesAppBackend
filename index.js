const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://movies-app-frontend-git-main-shubhams-projects-9fdff750.vercel.app",
      "https://movies-app-frontend-shubhams-projects-9fdff750.vercel.app",
      "http://localhost:1234",
      "https://moviesyncapp.netlify.app",
    ],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const { dbconnect } = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

// const googleAuth = require("./routes/googleAuth");

const requireAuth = require("./middleware/requiredAuth");

// Allow requests from the specified- origin
app.use(
  cors({
    origin: [
      "https://movies-app-frontend-git-main-shubhams-projects-9fdff750.vercel.app",
      "https://movies-app-frontend-shubhams-projects-9fdff750.vercel.app",
      "http://localhost:1234",
      "https://moviesyncapp.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
dbconnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "thisismyfavouritesecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.use("/", googleAuth);

app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);

// Store sessions' states
const sessions = {};

app.post("/api/getVideoId", requireAuth, (req, res) => {
  const { room } = req.body;
  // console.log(sessions);

  if (sessions[room]) {
    const TvideoId = sessions[room].videoId;
    // console.log(sessions);

    if (TvideoId) {
      return res.status(201).json({ videoId: TvideoId });
    } else {
      return res.status(201).json({ videoId: "not available" });
    }
  }
  return res.status(500).json({ message: "room not registered" });
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  // console.log(sessions);

  socket.on("joinRoom", ({ sessionId, videoId }) => {
    // console.log(`Socket ${socket.id} joining session: ${sessionId}`);
    socket.join(sessionId);
    socket.sessionId = sessionId;
    // console.log(sessions);

    // Notify all other users in the session
    socket.to(sessionId).emit("newUserJoined");

    // If the session has a state, emit that state to the newly joined client
    if (sessions[sessionId] && !videoId) {
      // Fetch the video ID associated with the room from your backend storage
      const TvideoId = sessions[sessionId].videoId;
      // console.log(sessions);

      if (TvideoId) {
        // If video ID exists, emit it to the client
        // socket.emit("videoChange", TvideoId);
      } else {
        // If video ID doesn't exist, handle the scenario accordingly (e.g., send an error message)
        socket.emit("videoIdError", "Video ID not found for the room");
      }
      // console.log(sessions[sessionId]);
      socket.emit("currentState", sessions[sessionId]);
    } else {
      sessions[sessionId] = {
        action: "play",
        time: 0,
        host: socket.id,
        videoId,
      };
      if (videoId) {
        socket.to(sessionId).emit("videoChange", { vId: videoId });
        // socket.emit("videoChange", { vId: videoId });
        // console.log(videoId);
      }
    }
  });

  // Handle receiving the current state from an existing user
  socket.on("currentState", ({ sessionId, action, time }) => {
    // Update the session's state
    sessions[sessionId] = { ...sessions[sessionId], action, time };

    // Emit the updated state to all users in the session, including the new user
    io.to(sessionId).emit("control", { ...sessions[sessionId], action, time });
  });

  socket.on("play", ({ sessionId, time }) => {
    // console.log(`Play video in session: ${sessionId}`);
    const state = { ...sessions[sessionId], action: "play", time: time ?? 0 };
    sessions[sessionId] = state;
    // console.log(sessions);
    io.to(sessionId).emit("control", state);
  });

  socket.on("requestInitialPlaybackTime", ({ sessionId }) => {
    console.log(`Play video in session: ${sessionId}`);
    const state = sessions[sessionId];
    io.to(sessionId).emit("control", state);
  });

  socket.on("pause", ({ sessionId, time }) => {
    console.log(`Pause video in session: ${sessionId}`);
    const state = { ...sessions[sessionId], action: "pause", time };
    sessions[sessionId] = state;
    io.to(sessionId).emit("control", state);
  });

  socket.on("seek", ({ sessionId, time }) => {
    console.log(`Seek video in session: ${sessionId}`);
    // Update the session's state to reflect the seek action
    const state = sessions[sessionId] || {};
    state.time = time;
    sessions[sessionId] = state;

    io.to(sessionId).emit("control", { action: "seek", time });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
    // console.log("user leave the session");

    // Check if the disconnected user was the host of any session
    Object.keys(sessions).forEach((sessionId) => {
      if (sessions[sessionId].host === socket.id) {
        // console.log(`Host ${socket.id} left session ${sessionId}`);

        // Remove the host from the session
        delete sessions[sessionId].host;

        // Select a new host from the remaining users in the session
        const remainingUsers = Object.keys(
          io.sockets.adapter.rooms[sessionId]?.sockets || {}
        );
        console.log("Remaining users => " + io.sockets.adapter);
        if (remainingUsers.length > 0) {
          const newHost = remainingUsers[0];
          sessions[sessionId].host = newHost;
          // console.log(
          //   `User ${newHost} is the new host of session ${sessionId}`
          // );

          // Send the current state to the new host
          io.to(newHost).emit("currentState", sessions[sessionId]);

          // Notify all users in the session about the new host
          io.to(sessionId).emit("newHost", { newHost });
        } else {
          console.log(`No remaining users in session ${sessionId}`);
          // No remaining users, remove the session
          // delete sessions[sessionId];
        }
      }
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
