const sendDevErr = (err, res) => {
  res.status(err.statusCode);

  if (err.isOperational) res.json({ ok: false, message: err.message });
  if (!err.isOperational) res.json({ ok: false, error: err });
};

const sendDevProd = (err, res) => {};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') sendDevErr(err, res);
};
