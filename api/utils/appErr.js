class appErr extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const throwErr = (message, statusCode) => new appErr(message, statusCode);

module.exports = throwErr;
