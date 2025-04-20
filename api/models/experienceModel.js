// Data model for experience (work experience etc.)
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Title
  title: {
    type: String,
    required: [true, 'Experience must come with a title.'],
    trim: true,
  },

  // Institution / company where the experience was gained
  institution: {
    type: String,
    required: [true, 'Experience must come from an institution.'],
    trim: true,
  },

  // company logo
  logo: {
    type: String,
    trim: true,
  },

  // industry category
  industry: {
    type: String,
    required: [true, 'Experience must come from an industry.'],
    trim: true,
  },

  // fulltime or partime
  fulltime: {
    type: Boolean,
    required: [true, 'Experience must specify if it was fulltime or not'],
  },

  // Volunteer work or not
  volunteer: {
    type: Boolean,
    default: false,
  },

  // start date
  startDate: {
    type: Date,
    required: [true, 'Experience must have a start date.'],
  },

  // Date of completion
  completionDate: {
    type: Date,
    validate: {
      validator: function (val) {
        return !this.startDate || val > this.startDate;
      },
      message: 'Completion date must be after start date.',
    },
  },

  // If still working there
  currentlyEmployed: {
    type: Boolean,
    default: false,
  },

  recommendationLink: String,

  // A list of 3 tasks performed
  tasks: {
    type: [String],
    validate: {
      validator: function (val) {
        return val.length === 3;
      },
      message: 'Exactly 3 tasks are required.',
    },
    trim: true,
    maxlength: 100,
  },

  // Where the experience was gained
  location: {
    type: {
      type: String,
      enum: ['Point', 'Online'], // Allow only Point or Online
      default: 'Point',
    },

    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country name may not contain more then 50 characters'],
    },

    streetAddress: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Street address may not contain more then 100 characters',
      ],
    },

    postalCode: {
      type: String,
      trim: true,
      maxlength: [10, 'A postal code may not contain more then 10 characters'],
    },

    coordinates: {
      type: [Number], // Array of two numbers [lng, lat]
      validate: {
        validator: function (val) {
          return val.length === 2;
        },
        message: 'Coordinates must be in [lng, lat] format.',
      },
      // Only required if location was not "Online"
      required: function () {
        return this.type === 'Point';
      },
    },
  },

  // Timestamp of creation
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Attach a completion date if its not there to help the chatbot do calculations
schema.post(/^find/, function (docs) {
  docs.forEach(
    doc =>
      doc.startDate &&
      (doc.completionDate = doc.completionDate || new Date().setFullYear(2030))
  );
});

const Experience = mongoose.model('Experience', schema);

module.exports = Experience;
