const mongoose = require("mongoose");

exports.dbconnect = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/movies")
    .then(() => {
      console.log("db connect");
    })
    .catch((err) => {
      console.log("error connecting");
      console.log(err.message);
    });
};
