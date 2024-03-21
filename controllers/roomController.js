const User = require("../models/User");

exports.UpdateRoom = async (req, res) => {
  try {
    const { room, username } = req.body;
    const user = await User.findOneAndUpdate(
      { username },
      { room },
      {
        new: true,
      }
    );
    res.status(201).json({ username: user.username, room: user.room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const { title, duration } = req.body;
    const movie = new Movie({ title, duration });
    await movie.save();
    res.status(201).json({ message: "Movie created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
