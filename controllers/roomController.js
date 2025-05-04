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
    console.log(error);
    res.status(500).json({ error: err.message });
  }
};

exports.UpdateSession = async (req, res) => {
  try {
    const { sessionType } = req.body;
    const email = req.user.email;
    const user = await UserBasic.findOneAndUpdate(
      { email },
      { sessionType },
      {
        new: true,
      }
    );
    return res.status(200).json({ message: "session updated", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
