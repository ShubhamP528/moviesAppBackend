const User = require("../models/User");

exports.UpdateRoom = async (req, res) => {
  try {
    console.log(req.body);
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
