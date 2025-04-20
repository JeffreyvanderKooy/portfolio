// # ________________________________ROUTER FOR DATA QUERIES______________________________________ # //
const express = require('express');
const dataController = require('../controllers/dataController');
const rateLimit = require('express-rate-limit');

// Get a new router instance
const router = express.Router();

// Fetches coding projects
router.route('/projects').get(dataController.getProjects);

// For submitting feedback
router
  .route('/feedback')
  .post(dataController.findChat, dataController.storeFeedback);

module.exports = router;
