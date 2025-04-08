"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomResponse {
    constructor({ isSuccess, isError, message = "Something went wrong", payload, }) {
        if (isSuccess) {
            this.isError = 0;
            this.isSuccess = isSuccess;
        }
        else {
            this.isSuccess = 0;
            this.isError = isError;
        }
        this.message = message;
        if (payload) {
            this.payload = payload;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = CustomResponse;
