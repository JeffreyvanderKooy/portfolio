const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const throwErr = require('./utils/appErr');

const app = express();

// INITIALIZE GLOBAL RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 60 * 1000,
  limit: 100,
  message: {
    ok: false,
    message:
      "Oops! Seems like you've hit the maximum requests of 100, please wait 15 minutes.",
  },
});

// INITIALIZE CORS
const corsSetup = cors({
  origin: process.env.CORS_ALLOWED_ORIGIN,
  credentials: true, // Allow credentials (cookies, headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
});

// GLOBAL MIDDLEWARES

// Cors
app.use(corsSetup);

// Expres-rate-limit
app.use(limiter);

// Setting security headers
app.use(helmet());

// Initiate logger if in development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Redirect all requests for wich there are no paths
app.all('*', (req, res, next) =>
  next(throwErr(`No path for ${req.originalUrl} found!`, 404))
);

// Redirect global errors
app.use(globalErrorHandler);

module.exports = app;
