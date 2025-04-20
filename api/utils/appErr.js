class appErr extends Error {
  /**
   *
   * @param {string} message Error message to send to the user.
   * @param {number} statusCode HTTP Status code.
   * @returns Error object to use into a 'next()' functions
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 *
 * @param {string} message Error message to send to the user.
 * @param {number} statusCode HTTP Status code.
 * @returns new appErr instance
 */
const throwErr = (message, statusCode) => new appErr(message, statusCode);

module.exports = throwErr;
