// Data model for user feedback
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Feedback must be linked to a user.'],
  },

  experience: {
    type: String,
    trim: true,
    enum: ['bad', 'neutral', 'good'],
    required: [true, 'A feedback must have a users experience.'],
  },

  feedback: {
    type: String,
    maxlength: 300,
  },

  name: String,
});

const Feedback = mongoose.model('feedback', feedbackSchema);

module.exports = Feedback;
