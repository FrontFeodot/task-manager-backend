import { connect } from "mongoose";

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const mongoConnect = (callback: () => void) => {
  if (MONGO_URI) {
    return connect(MONGO_URI)
      .then((result) => {
        console.log("Connected!");
        callback();
      })
      .catch((err) => {
        console.log("mongo connect error", err);
      });
  }
  console.log("connect not succeed");
};

export default mongoConnect;
