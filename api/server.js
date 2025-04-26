// Initialize dotenv so global variables are available
require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/winston');

// Connect to database
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log('Connected to database.'));

// Import express app instance
const app = require('./app');

// Render will provide the port in process.env.PORT if not use 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Site hosting on port: ' + port));

// # ________________________________CATCHING UNCAUGHT EXEPECTIONS AND REJECTIONS______________________________________ # //
process.on('uncaughtException', err => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
process.on('unhandledRejection', err => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
