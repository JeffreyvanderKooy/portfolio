// # ________________________________IMPORTS______________________________________ # //
const Education = require('../models/educationModel');
const Experience = require('../models/experienceModel');
const Project = require('../models/projectsModel');
const Skill = require('../models/skillsModel');
const Chat = require('../models/chatModel');
const Feedback = require('../models/feedbackModel');
const catchAsync = require('../utils/catchAsync');
const throwErr = require('../utils/appErr');
const logger = require('../utils/winston');

// # ________________________________HELPER FUNCTIONS______________________________________ # //

/**
 *
 * @param {string} topic Topic parsed from the Gemini response
 * @param {Function} next Next function from Express to throw err incase no Model could be extracted
 * @returns {Object} MongoDB Model to query for documents
 */
const getModel = (topic, next) => {
  let model;

  switch (topic.toLowerCase()) {
    case 'education':
      model = Education;
      break;
    case 'experience':
      model = Experience;
      break;
    case 'projects':
      model = Project;
      break;
    case 'skills':
      model = Skill;
      break;
  }

  if (!model) {
    logger.info(`No topic could be parsed from topic: ${topic}`);
    return next(
      throwErr(`No data Model could be parsed from topic: ${topic}`, 400)
    );
  }

  return model;
};

/**
 *
 * @param {Object} chat Chat instance from MongoDB
 * @description Creates a copy of the current Chat instance to the MongoDB for later debugging and resets the Chat history so the user can keep chatting with JeffBot
 */
exports.logErrorChat = async chat => {
  // Create a chat copy
  await Chat.create({
    userId: `error-${chat.userId}`,
    history: chat.history,
    error: true,
  });

  // Reset chat history
  await Chat.findByIdAndUpdate(chat._id, { history: [] });
};

/**
 *
 * @param {Object} chat Chat instance from MongoDB
 * @param {Object} metadata JS Object containing relevant information about the request and response from Gemini to store into the database
 * @description Stores 2 new entries on the Chat object in the MongoDB; 1 for "user" with their initial prompt, and 1 for "model" with the Gemini response
 */
exports.updateChatHistory = async (chat, metadata) => {
  const updatedHistory = chat.history.slice(-10);

  const makeEntry = (role, msg) => ({
    chatId: chat._id,
    entry: {
      role: role,
      parts: [{ text: msg }],
    },

    metadata,
  });

  const userEntry = makeEntry('user', metadata.userPrompt);
  const modelEntry = makeEntry('model', metadata.response.message);

  updatedHistory.push(userEntry);
  updatedHistory.push(modelEntry);

  await Chat.findByIdAndUpdate(chat._id, {
    history: updatedHistory,
    lastEntry: new Date(),
  });
};

// # ________________________________ROUTE HANDLERS______________________________________ # //

// Fetches documents from DB depending on topic extracted by Gemini
exports.fetchData = catchAsync(async (req, res, next) => {
  // Desctructure the AI data
  const { topic } = req.query;

  // Get relevant data model based on topic property
  const Model = getModel(topic, next);

  // Get docs and attach to req to access later
  const documents = await Model.find().lean();
  req.query.documents = documents;

  // Onto next middleware
  next();
});

// Finds the correct chat instance according to the ID in req.body
exports.findChat = catchAsync(async (req, res, next) => {
  // Get usedId from body or from URL parameter
  const userId = req.body.chatId || req.query.chatId;

  // Try to find the chat
  let chat = await Chat.findOne({ userId });

  // No chat found, create a chat instance
  if (!chat) {
    chat = await Chat.create({
      userId,
      history: [],
    });

    logger.info(`A new chat was made with id: ${chat.userId}`);
  }

  // Create a new history array, leaving out the metadata etc
  const history = chat.history.map(history => history.entry);

  // Attach to req for later use
  req.query.history = history;
  req.query.chat = chat;

  // Onto next middleware
  next();
});

// Gets project documents
exports.getProjects = catchAsync(async (req, res, next) => {
  const documents = await Project.find();

  res
    .status(200)
    .json({ ok: true, data: documents, results: documents.length });
});

// Logs feedback send by the frontend
exports.storeFeedback = catchAsync(async (req, res, next) => {
  // Desconstruct data
  const { userExperience: experience, name, feedback } = req.body;
  const { _id: chatId } = req.query.chat;

  // Throw error if missing required parameter
  if (!chatId || !experience)
    return next(throwErr("Missing parameter 'ChatId' or 'experience'"), 400);

  // Create a new feedback instance
  await Feedback.create({
    chatId,
    experience,
    name: name || 'Anonymous', // Set name to 'Anonymous' if no name was entered
    feedback,
  });

  // Log the creation of a new feedback
  logger.info(`Received new feedback from user: ${chatId}`);

  // Response
  res.status(200).json({
    ok: true,
    message: 'Feedback received and stored to the database.',
  });
});
