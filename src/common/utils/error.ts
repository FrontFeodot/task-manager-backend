class CustomError extends Error {
  payload?: unknown;

  constructor(message: string, payload?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.payload = payload;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
