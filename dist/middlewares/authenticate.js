"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = __importDefault(require("../common/utils/error"));
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        res
            .status(401)
            .send(new error_1.default({ isError: 1, message: "Unauthorized" }));
        return;
    }
    try {
        const { userId } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!userId) {
            throw new error_1.default({ isError: 1, message: "Invalid token" });
        }
        req.body.userId = userId;
        next();
    }
    catch (error) {
        res.status(401).send({ error });
    }
};
exports.authenticate = authenticate;
