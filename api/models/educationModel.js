// Data model for education data
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Name of the education e.g "backend developer"
  name: {
    type: String,
    required: [true, 'A education must have a name.'],
    trim: true,
  },

  // Name of the institution education came from e.g "Noroff"
  institution: {
    type: String,
    required: [true, 'A education must have a institution.'],
    trim: true,
  },

  // school logo
  logo: {
    type: String,
    trim: true,
  },

  // Title of the education
  title: {
    type: String,
    required: true,
    trim: true,
  },

  // url to certificate/diploma etc
  certificate: {
    type: String,
    trim: true,
  },

  // Start date of the education
  startDate: {
    type: Date,
    required: function () {
      return (
        this.title === 'Degree' ||
        this.title === 'Diploma' ||
        this.title === 'Education'
      );
    },
    validate: {
      message: 'A education must have a start date.',
      validator: function (val) {
        return val instanceof Date;
      },
    },
  },

  // True if user is currently studying
  currentlyStudying: {
    type: Boolean,
    default: false,
  },

  // Completion date of the education if completed
  completionDate: {
    type: Date,
    validate: {
      validator: function (val) {
        return !this.startDate || val > this.startDate;
      },
      message: 'Completion date must be after the start date.',
    },
  },

  // Course duration in hours if title is "Course"
  durationHours: {
    type: Number,
    required: function () {
      return this.title === 'Course' || this.title === 'Certification';
    },
  },

  // Field of study e.g "IT", "Logistics"
  fieldOfStudy: {
    type: String,
    trim: true,
  },

  // Small description of the education
  description: {
    type: String,
    trim: true,
    maxlength: [700, 'Description must not exceed 700 characters.'],
  },

  // Where the education was taken
  location: {
    type: {
      type: String,
      enum: ['Point', 'Online'], // Allow only Point or Online
      default: 'Point',
    },

    country: String,
    streetAddress: String,
    postalCode: String,

    coordinates: {
      type: [Number],
      // Not required if the type is "Online"
      required: function () {
        return this.location.type === 'Point';
      },

      validate: {
        // Check that coordinates is an array with the length of 2
        validator: function (val) {
          return val.length === 2 || this.location.type === 'Online';
        },
        message: 'Coordinates must come in [lng, lat] format.',
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

const Education = mongoose.model('Education', schema);

module.exports = Education;
