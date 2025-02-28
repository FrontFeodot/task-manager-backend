import { ICustomResponsePayload } from "../interfaces/ICustomError";

class CustomResponse {
  isSuccess: number;
  isError: number;
  message: string;
  payload?: unknown;

  constructor({
    isSuccess,
    isError,
    message = "Something went wrong",
    payload,
  }: ICustomResponsePayload) {
    if (isSuccess) {
      this.isError = 0;
      this.isSuccess = isSuccess;
    } else {
      this.isSuccess = 0;
      this.isError = isError as number;
    }
    this.message = message;
    if (payload) {
      this.payload = payload;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomResponse;
