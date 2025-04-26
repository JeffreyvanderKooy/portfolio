// # ________________________________IMPORTS______________________________________ # //

const { GoogleGenerativeAI } = require('@google/generative-ai');
const catchAsync = require('../utils/catchAsync');
const personalInfo = require('../models/personalModel');
const sanitizeJSON = require('../utils/sanitizeJson.js');
const dataController = require('../controllers/dataController');
const logger = require('../utils/winston.js');
const throwErr = require('../utils/appErr');
const {
  promptBuilder,
  systemInstruction,
  failJsonpParseMessage,
  failTopicMessage,
} = require('../utils/promptBuilder.js');

// # ___________________________________INIT GEMINI MODEL___________________________________ # //

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  systemInstruction: systemInstruction,
});

// # ____________________________________HELPER FUNCTIONS__________________________________ # //

/**
 *
 * @param {string} prompt Full prompt with instructions to send to the Gemini Model
 * @param {string} message Original prompt sent by user
 * @param {Array<{role: string, parts: { text: string } }>} chatHistory Array of exchanges between "Model" & "User"
 * @param {Function} next Next function from Express to throw err
 * @param {Object} chat Chat instance from the MongoDB
 * @returns {Promise<object>} Resolves with Gemini response object, or passes error to `next()`
 */
const getParsedResponse = async (prompt, message, chatHistory, next, chat) => {
  // Build the Gemini Chat instance
  const modelChat = model.startChat({
    history: chatHistory,
  });

  // Get response from Gemini (string)
  const result = await modelChat.sendMessage(prompt);
  const response = result.response.text();

  // Parses the raw JSON into a JS Object or passes error to 'next()'
  return tryParseJson(response, chat, message, next);
};

/**
 *
 * @param {string} json Raw JSON block supplied in the Gemini response
 * @param {Object} chat Chat instance from the MongoDB
 * @param {string} message Original prompt sent by user
 * @param {Function} next Next function from Express to throw err
 * @returns {Object} Returns the parsed JSON as a JS Object or throws err in 'next'
 */
const tryParseJson = async (json, chat, message, next) => {
  // Remove unwanted characters from the JSON to prepare for parsing
  const sanitizedJson = sanitizeJSON(json);

  try {
    // Parse the JSON into an object and return it if succesfull
    const parsed = JSON.parse(sanitizedJson.trim());
    parsed.userPrompt = message;

    return parsed;
  } catch (err) {
    // Else log the error, archieve the chat and throw an error
    logger.error(`Failed to parse Gemini response: ${json}`);

    // Store the chat marked as error for debugging
    await dataController.updateChatHistory(chat, {
      timestamp: new Date(),
      userPrompt: message,
      response: json,
    });
    await dataController.logErrorChat(chat);

    // No json was extracted, throw error
    throw throwErr(failJsonpParseMessage, 400);
  }
};

/**
 *
 * @param {Object} chat Chat instance from the MongoDB
 * @param {Object} metadata JS Object containing information about the request
 */
const persistChatHistory = async (chat, metadata) => {
  try {
    await dataController.updateChatHistory(chat, metadata);
  } catch (err) {
    logger.error(`An error occured saving to the database:\n ${err}`);
  }
};

// # ________________________________ROUTE HANDLERS______________________________________ # //

// Generates a welcome message to the user
exports.welcome = catchAsync(async (req, res, next) => {
  // Extract chat from req
  const { chat } = req.query;

  // There is a chat history so the user has visited the site before
  const hasVisited = chat.history.length > 0;

  // Build the query
  const prompt = new promptBuilder().welcomePrompt(hasVisited);

  // Query Gemini Model
  const completion = await model.generateContent(prompt);
  const response = completion.response.candidates[0].content.parts[0].text;

  // Build metadata for data storage for extra context
  const metadata = {
    response: { message: response },
    userPrompt: 'Introduce yourself.',
    timestamp: new Date(),
  };

  // Send response out to the user
  res.status(200).json({ ok: true, message: response, topic: 'welcome' });

  // Add 2 new entries to the chat history and archive the chat
  process.nextTick(async () => persistChatHistory(chat, metadata));
});

// Extracts the **main** topic the user is asking about in their question to JeffBot
exports.query = catchAsync(async (req, res, next) => {
  // Get chat instance and chat history from req
  const { history, chat } = req.query;

  // Build prompt
  const prompt = new promptBuilder(req.body.query).queryPrompt();

  // Get a JS object response from Gemini
  const parsed = await getParsedResponse(
    prompt,
    req.body.query,
    history,
    next,
    chat
  );

  // No topic could be extracted, return the response message letting the user know JeffBot cannot help with this and archive the chat entries
  if (!parsed.topic) return next(throwErr(failTopicMessage, 400));

  // Attach metadata to the req
  const metadata = {
    response: parsed,
    userPrompt: req.body.query,
    timestamp: new Date(),
  };
  req.metadata = metadata;

  // Personal questions are handled on a different path
  if (parsed.topic === 'personal') {
    return res.redirect(
      `/api/v1/assistant/personal/${encodeURIComponent(
        req.body.query
      )}?chatId=${encodeURIComponent(chat.userId)}`
    );
  } else {
    // Attach JeffBots information to the req, and go to next middleware
    req.query = { ...parsed, ...req.query };
    next();
  }
});

// Receives the documents regarding the topic and generates a user friendly response from Gemini
exports.filterDocuments = catchAsync(async (req, res, next) => {
  // Get chat instance and chat history from middleware
  const { history, chat } = req.query;

  // Build the prompt
  const prompt = new promptBuilder(req.body.query).filterDocPrompt(
    req.query.documents
  );

  // Get a JS object response from Gemini
  const parsed = await getParsedResponse(
    prompt,
    req.body.query,
    history,
    next,
    chat
  );

  // Attach topic to parsed object
  parsed.topic = req.query.topic;

  // Find documents to the corresponding ID's
  const documents = req.query.documents.filter(doc =>
    parsed.documents.includes(doc._id.toString())
  );
  parsed.documents = documents;

  // Attach the response to the metadata
  req.metadata.response = parsed;

  // Send data to user
  res.status(200).send({
    ok: true,
    ...parsed,
  });

  // Add 2 new entries to the chat history and archive the chat
  process.nextTick(async () => persistChatHistory(chat, req.metadata));
});

// Handles query's with the topic: "personal", e.g "Where did he live?"
exports.personalInfo = catchAsync(async (req, res, next) => {
  // Make a big string out of the documents
  const { history, chat } = req.query;

  // Build prompt
  const prompt = new promptBuilder(req.params.prompt).personalPrompt(
    personalInfo
  );

  // Get parsed response from Gemini Model
  const parsed = await getParsedResponse(
    prompt,
    req.params.prompt,
    history,
    next,
    chat
  );

  // Attach topic to response
  parsed.topic = 'personal';

  // Form metadata
  const metadata = {
    response: parsed,
    userPrompt: req.params.prompt,
    timestamp: new Date(),
  };

  res.status(200).json({ ok: true, ...parsed });

  // Add 2 new entries to the chat history and archive the chat
  process.nextTick(async () => persistChatHistory(chat, metadata));
});
