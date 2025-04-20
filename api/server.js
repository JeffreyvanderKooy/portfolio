const mongoose = require('mongoose');

// Initialize dotenv so global variables are available
require('dotenv').config();

// Initialize database
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log('Connected to database.'));

// Import express app instance
const app = require('./app');

// Render will provide the port in process.env.PORT if not use 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Site hosting on port: ' + port));
