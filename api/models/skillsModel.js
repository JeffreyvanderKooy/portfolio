// Data model for my framework, programming language skills etc.
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A skill must go by a name.'],
  },

  tags: [String],

  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  },
});

const Skill = mongoose.model('Skill', schema);

module.exports = Skill;
