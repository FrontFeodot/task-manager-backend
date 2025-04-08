"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtected = exports.postLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = __importDefault(require("../common/utils/error"));
const authHelper_1 = require("../common/utils/authHelper");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "";
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            res
                .status(400)
                .send(new error_1.default({ isError: 1, message: "User not found" }));
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send(new error_1.default({
                isError: 1,
                message: "Invalid password",
                payload: {
                    field: "password",
                },
            }));
            return;
        }
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Login successful",
            payload: { token: (0, authHelper_1.generateToken)(user.userId) },
        }));
    }
    catch (err) {
        console.error(err);
        res.status(500).send(new error_1.default({
            isError: 1,
            message: "Error during login",
            payload: err,
        }));
    }
});
exports.postLogin = postLogin;
const getProtected = (req, res) => {
    const token = req.body.token;
    if (!token) {
        res.status(401).send(new error_1.default({
            isError: 1,
            message: "No token, authorization denied",
        }));
        return;
    }
    try {
        const authToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (authToken) {
            res
                .status(200)
                .send(new error_1.default({ isSuccess: 1, message: "Success" }));
        }
    }
    catch (err) {
        console.error(err);
        res
            .status(401)
            .send(new error_1.default({ isError: 1, message: "Invalid token" }));
    }
};
exports.getProtected = getProtected;
