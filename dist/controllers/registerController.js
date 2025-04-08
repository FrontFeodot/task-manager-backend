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
exports.postRegister = void 0;
const nanoid_1 = require("nanoid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const error_1 = __importDefault(require("../common/utils/error"));
const authHelper_1 = require("../common/utils/authHelper");
const boardController_1 = require("./boardController");
const postRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        res.send(new error_1.default({
            isError: 1,
            message: "Password and confirm password are not matched",
        }));
    }
    try {
        const userData = yield user_1.default.findOne({ email });
        if (userData) {
            res.status(400).send(new error_1.default({
                isError: 1,
                message: "User with this email already exist",
            }));
            return;
        }
        return bcryptjs_1.default.hash(password, 12).then((hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
            const userId = (0, nanoid_1.nanoid)();
            const user = new user_1.default({
                userId,
                email,
                password: hashedPassword,
            });
            try {
                yield user.save();
                yield (0, boardController_1.initDefaultBoard)(userId);
                res.send(new error_1.default({
                    isSuccess: 1,
                    message: "success",
                    payload: { token: (0, authHelper_1.generateToken)(user.userId) },
                }));
            }
            catch (err) {
                res
                    .status(500)
                    .send(new error_1.default({ isError: 1, message: "Something went wrong" }));
                return console.error("saving error", err);
            }
        }));
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Something went wrong" }));
    }
});
exports.postRegister = postRegister;
