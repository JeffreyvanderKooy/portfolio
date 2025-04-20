// # ________________________________IMPORTS______________________________________ # //
const { generalErrorMessage } = require('../utils/promptBuilder');

/**
 *
 * @param {Error} err Error object that enters the middleware
 * @param {Object} res response object prvided by Express on a request
 */
const sendDevErr = (err, res) => {
  res.status(err.statusCode);

  if (err.isOperational) res.json({ ok: false, message: err.message });
  if (!err.isOperational)
    res.json({
      ok: false,
      error: err,
      message: 'Non-production error occured. Please check the logs.',
    });

  console.log(err);
};

/**
 *
 * @param {Error} err Error object that enters the middleware
 * @param {Object} res response object prvided by Express on a request
 */
const sendDevProd = (err, res) => {
  if (err.isOperational) res.json({ ok: false, message: err.message });
  if (!err.isOperational) {
    console.log(err);

    res.json({
      ok: false,
      message: generalErrorMessage,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') sendDevErr(err, res);
  if (process.env.NODE_ENV === 'production') sendDevProd(err, res);
};
