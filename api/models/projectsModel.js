// Data model for my projects
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A project must have a name.'],
    trim: true,
  },

  description: {
    type: String,
    required: [true, 'A project must have a description.'],
    trim: true,
  },

  stack: {
    type: [
      {
        name: String,
        icon: String,
      },
    ],
    default: [],
  },

  demoUrl: {
    type: String,
    required: false,
  },

  githubUrl: {
    type: String,
    require: [true, 'A project must point to a github repo.'],
  },

  image: {
    type: String,
    default: 'under-construction.jpg',
    require: [true, 'A project must have a image.'],
  },
});

const Project = mongoose.model('Project', schema);

module.exports = Project;
