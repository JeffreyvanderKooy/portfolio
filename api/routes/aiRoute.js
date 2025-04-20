// # ________________________________ROUTER FOR JEFFBOT QUERIES______________________________________ # //
const express = require('express');
const aiController = require('../controllers/aiController');
const dataController = require('../controllers/dataController');

// Get a new router instance
const router = express.Router();

// First middleware in all queries, finds the right Chat instance for chat history persistiance
router.use(dataController.findChat);

// Generates a friendly welcome message
router.route('/welcome').post(aiController.welcome);

// Handles user questions to JeffBot
router.route('/query').post(
  aiController.query, // Extracts the topic the user asks about
  dataController.fetchData, // Finds documents to the corresponding topic (e.g. "experience" fetches work history)
  aiController.filterDocuments // Filters the documents based on users question and generates a friendly message
);

// Redirect for personal question
router.route('/personal/:prompt').get(aiController.personalInfo);

module.exports = router;
