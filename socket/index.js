const express = require("express");
const requireAuth = require("../middleware/requiredAuth");
const router = express.Router();

// Store sessions' states
const manualSessions = {};

console.log("This is sessions => ", manualSessions);

router.get("/manualSessions/getTotalUser", (req, res) => {
  console.log(manualSessions);
  let count = 0;
  for (let session in manualSessions) {
    count++;
  }
  return res.status(200).json({ totalUsers: count });
});

router.post("/api/manualSessions/getVideoId", requireAuth, (req, res) => {
  const { room } = req.body;
  // console.log(manualSessions);

  if (manualSessions[`m-${room}`]) {
    const TvideoId = manualSessions[`m-${room}`].videoId;
    // console.log(manualSessions);

    if (TvideoId) {
      return res.status(201).json({ videoId: TvideoId });
    } else {
      return res.status(201).json({ videoId: "not available" });
    }
  }
  return res.status(500).json({ message: "room not registered" });
});

const manualVoideoSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
    console.log(manualSessions);

    socket.on("manualSessions-joinRoom", ({ room }) => {
      console.log(`Socket ${socket.id} joining room: ${room}`);
      socket.join(`m-${room}`);
      console.log(io.sockets.adapter.rooms);
    });

    socket.on("manualSessions-totalUsers", ({ room }) => {
      // console.log(io.sockets.adapter.rooms);
      const rooms = io.sockets.adapter.rooms;
      console.log(rooms);
      let userCount = 0;
      if (rooms.has(`m-${room}`)) {
        userCount = rooms.get(`m-${room}`).size;
        // console.log(`Number of users in room "${room}":`, userCount);
      } else {
        // console.log(`Room "${room}" does not exist.`);
      }
      io.to(`m-${room}`).emit("manualSessions-totalUsers-ans", userCount);
    });

    socket.on("manualSessions-newuser", ({ sessionId, videoId }) => {
      // console.log(`Socket ${socket.id} joining session: ${sessionId}`);
      // socket.join(sessionId);
      socket.sessionId = `m-${sessionId}`;
      // console.log(manualSessions);

      // Notify all other users in the session
      socket.to(`m-${sessionId}`).emit("manualSessions-newUserJoined");
      console.log(videoId, "  ", manualSessions[`m-${sessionId}`]?.videoId);

      console.log("This is manualSessions => ", manualSessions);

      // If the session has a state, emit that state to the newly joined client
      if (
        manualSessions[`m-${sessionId}`] &&
        videoId === manualSessions[`m-${sessionId}`]?.videoId
      ) {
        // Fetch the video ID associated with the room from your backend storage
        const TvideoId = manualSessions[`m-${sessionId}`].videoId;
        // console.log(manualSessions);

        if (TvideoId) {
          // If video ID exists, emit it to the client
          // socket.emit("videoChange", TvideoId);
        } else {
          // If video ID doesn't exist, handle the scenario accordingly (e.g., send an error message)
          socket.emit(
            "manualSessions-videoIdError",
            "Video ID not found for the room"
          );
        }
        // console.log(manualSessions[`m-${sessionId}`]);
        socket.emit(
          "manualSessions-currentState",
          manualSessions[`m-${sessionId}`]
        );
      } else if (!manualSessions[`m-${sessionId}`]) {
        manualSessions[`m-${sessionId}`] = {
          action: "play",
          time: 0,
          host: socket.id,
          videoId,
          rate: 1,
        };
      } else {
        if (videoId !== manualSessions[`m-${sessionId}`]?.videoId) {
          manualSessions[`m-${sessionId}`] = {
            action: "play",
            time: 0,
            host: socket.id,
            videoId,
            rate: 1,
          };

          socket.to(`m-${sessionId}`).emit("manualSessions-videoChange", {
            vId: videoId,
            action: "play",
            time: 0,
            rate: 1,
          });

          socket.emit(
            "manualSessions-currentState",
            manualSessions[`m-${sessionId}`]
          );
        }
        // else if (videoId === manualSessions[`m-${sessionId}`]?.videoId) {
        //   tim = manualSessions[`m-${sessionId}`]?.time;
        //   act = manualSessions[`m-${sessionId}`]?.action;
        //   socket
        //     .to(`m-${sessionId}`)
        //     .emit("videoChange", { vId: videoId, action: act, time: tim });
        //   // socket.emit("videoChange", { vId: videoId });
        //   // console.log(videoId);
        // }
      }
    });

    // for message
    socket.on("manualSessions-chatMessage", ({ room, message }) => {
      // Broadcast the message to other users in the room
      console.log(room, message);
      io.to(`m-${room}`).emit("manualSessions-receiveMessage", message);
    });

    // Handle receiving the current state from an existing user
    socket.on("manualSessions-currentState", ({ sessionId, action, time }) => {
      // Update the session's state
      manualSessions[`m-${sessionId}`] = {
        ...manualSessions[`m-${sessionId}`],
        action,
        time,
      };

      // Emit the updated state to all users in the session, including the new user
      io.to(`m-${sessionId}`).emit("manualSessions-control", {
        ...manualSessions[`m-${sessionId}`],
        action,
        time,
      });
    });

    socket.on("manualSessions-play", ({ sessionId, time }) => {
      console.log(io.sockets.adapter.rooms);

      // console.log(`Play video in session: ${sessionId}`);
      const state = {
        ...manualSessions[`m-${sessionId}`],
        action: "play",
        time: time ?? 0,
      };
      manualSessions[`m-${sessionId}`] = state;
      // console.log(manualSessions);
      io.to(`m-${sessionId}`).emit("manualSessions-control", state);
    });

    socket.on("manualSessions-changePlaybackSpeed", ({ sessionId, rate }) => {
      console.log(`Change playback speed in session: ${`m-${sessionId}`}`);
      const state = { ...manualSessions[`m-${sessionId}`], rate };
      manualSessions[`m-${sessionId}`] = state;
      io.to(`m-${sessionId}`).emit(
        "manualSessions-changePlaybackSpeed-ans",
        rate
      );
    });

    socket.on("manualSessions-requestInitialPlaybackTime", ({ sessionId }) => {
      console.log(`Play video in session: ${`m-${sessionId}`}`);
      const state = manualSessions[`m-${sessionId}`];
      io.to(`m-${sessionId}`).emit("manualSessions-control", state);
    });

    socket.on("manualSessions-pause", ({ sessionId, time }) => {
      console.log(`Pause video in session: ${`m-${sessionId}`}`);
      const state = {
        ...manualSessions[`m-${sessionId}`],
        action: "pause",
        time,
      };
      manualSessions[`m-${sessionId}`] = state;
      io.to(`m-${sessionId}`).emit("manualSessions-control", state);
    });

    socket.on("manualSessions-seek", ({ sessionId, time }) => {
      console.log(`Seek video in session: ${`m-${sessionId}`}`);
      // Update the session's state to reflect the seek action
      const state = manualSessions[`m-${sessionId}`] || {};
      state.time = time;
      manualSessions[`m-${sessionId}`] = state;

      io.to(`m-${sessionId}`).emit("manualSessions-control", {
        action: "seek",
        time,
      });
    });

    socket.on("manualSessions-leave", ({ sessionId }) => {
      console.log(
        `User ${socket.id} requested manual disconnect from session m-${sessionId}`
      );

      // Leave the room
      socket.leave(`m-${sessionId}`);

      // Optional: clean up the session if this user was the host
      if (manualSessions[`m-${sessionId}`]?.host === socket.id) {
        delete manualSessions[`m-${sessionId}`].host;

        // Find a new host if there are others
        const remainingUsers = io.sockets.adapter.rooms.get(`m-${sessionId}`);
        if (remainingUsers && remainingUsers.size > 0) {
          const newHost = Array.from(remainingUsers)[0];
          manualSessions[`m-${sessionId}`].host = newHost;

          io.to(newHost).emit(
            "manualSessions-currentState",
            manualSessions[`m-${sessionId}`]
          );

          io.to(`m-${sessionId}`).emit("manualSessions-newHost", { newHost });
        } else {
          // No users left, delete the session
          delete manualSessions[`m-${sessionId}`];
        }
      }

      // // Finally disconnect the socket (optional: only if you want to cut off)
      // socket.disconnect();
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
      // console.log("user leave the session");

      // Check if the disconnected user was the host of any session
      Object.keys(manualSessions).forEach((sessionId) => {
        if (manualSessions[`m-${sessionId}`]?.host === socket.id) {
          // console.log(`Host ${socket.id} left session ${`m-${sessionId}`}`);

          // Remove the host from the session
          delete manualSessions[`m-${sessionId}`].host;

          // Select a new host from the remaining users in the session
          const remainingUsers = Object.keys(
            io.sockets.adapter.rooms[`m-${sessionId}`]?.sockets || {}
          );
          console.log("Remaining users => " + io.sockets.adapter);
          if (remainingUsers.length > 0) {
            const newHost = remainingUsers[0];
            manualSessions[`m-${sessionId}`].host = newHost;
            // console.log(
            //   `User ${newHost} is the new host of session ${`m-${sessionId}`}`
            // );

            // Send the current state to the new host
            io.to(newHost).emit(
              "manualSessions-currentState",
              manualSessions[`m-${sessionId}`]
            );

            // Notify all users in the session about the new host
            io.to(`m-${sessionId}`).emit("manualSessions-newHost", { newHost });
          } else {
            console.log(`No remaining users in session ${`m-${sessionId}`}`);
            // No remaining users, remove the session
            // delete manualSessions[`m-${sessionId}`];
          }
        }
      });
    });
  });
};

module.exports = {
  manualVoideoSocket,
  router,
};
