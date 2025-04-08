"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "";
const generateToken = (userId) => jsonwebtoken_1.default.sign({ userId: userId }, JWT_SECRET, { expiresIn: "7d" });
exports.generateToken = generateToken;
