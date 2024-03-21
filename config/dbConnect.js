const mongoose = require("mongoose");

exports.dbconnect = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("db connect");
    })
    .catch((err) => {
      console.log("error connecting");
      console.log(err.message);
    });
};
