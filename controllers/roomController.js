const { UserBasic } = require("../models/User");

exports.UpdateRoom = async (req, res) => {
  try {
    // console.log(req.body);
    const { room } = req.body;
    const email = req.user.email;
    const user = await UserBasic.findOneAndUpdate(
      { email },
      { room },
      {
        new: true,
      }
    );
    res.status(201).json({ name: user.name, room: user.room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
