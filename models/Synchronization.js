const mongoose = require("mongoose");

const synchronizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  playbackTime: {
    type: Number,
    default: 0,
  },
  // Add any other synchronization data as needed
});

module.exports = mongoose.model("Synchronization", synchronizationSchema);
