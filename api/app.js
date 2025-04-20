// # ________________________________IMPORTS...______________________________________ # //
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const path = require('path');

// Error handling
const globalErrorHandler = require('./controllers/errorController');
const throwErr = require('./utils/appErr');

// Routes
const aiRouter = require('./routes/aiRoute');
const dataRouter = require('./routes/dataRoute');

const app = express();

// # ________________________________GLOBAL RATE LIMITER & CORS______________________________________ # //

app.set('trust proxy', 2);

// INITIALIZE GLOBAL RATE LIMITER
const limiter = rateLimit({
  windowMs: 1000 * 60 * 15,
  limit: 100,
  message: {
    ok: false,
    message:
      "Oops! Seems like you've hit the maximum requests of 100 per 15 minutes, please wait a moment before making another request 😞.",
  },
});

// INITIALIZE CORS
const corsSetup = cors({
  origin: process.env.CORS_ALLOWED_ORIGIN,
  credentials: true, // Allow credentials (cookies, headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
});

// # ________________________________MIDDLEWARE STACK______________________________________ # //

// Cors
app.use(corsSetup);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

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

// Body-parser for parsing req.body
app.use(express.json());

// # ________________________________ROUTES______________________________________ # //

// Data endpoint
app.use('/api/v1/data', dataRouter);

// EXTRA LIMITER FOR AI REQUESTS
const AIlimiter = rateLimit({
  windowMs: 1000 * 60,
  limit: 15,
  message: {
    ok: false,
    message:
      'JeffBot 🤖 only has time to answer 15 questions per minute, hes on break now. Please wait for him to come back before making another request 😞.',
  },
});

app.use(AIlimiter);

// JeffBot endpoint
app.use('/api/v1/assistant', aiRouter);

// # ________________________________REDIRECTS FOR REQUESTS THAT DONT HAVE A PATH______________________________________ # //

app.all('*', (req, res, next) =>
  next(throwErr(`No path for ${req.originalUrl} found!`, 404))
);

// # ________________________________GLOBAL ERROR HANDLER______________________________________ # //
app.use(globalErrorHandler);

module.exports = app;
