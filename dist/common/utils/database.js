"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
const mongoConnect = (callback) => {
    if (MONGO_URI) {
        return (0, mongoose_1.connect)(MONGO_URI)
            .then((result) => {
            console.log("Connected!");
            callback();
        })
            .catch((err) => {
            console.log("mongo connect error", err);
        });
    }
    console.error("connect not succeed");
};
exports.default = mongoConnect;
