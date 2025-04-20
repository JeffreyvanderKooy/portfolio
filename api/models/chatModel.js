const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  // ID generated on the frontend and send with requests as body
  userId: String,

  // Chat history
  history: [Object],

  // Last time user talked with JeffBot
  lastEntry: Date,

  // Creation date
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  // Used for debugging (set to true if error)
  error: {
    type: Boolean,
    default: false,
  },
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
