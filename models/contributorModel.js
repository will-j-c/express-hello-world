const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  project_id: {
    type: mongoose.ObjectId,
    ref: 'Project',
    required: true,
  },
  skills: {
    type: Array,
    required: true,
  },
  is_remote: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  commitmentLevel: {
    type: String,
    required: true,
  },
  remuneration: {
    type: String,
  },
  available_slots: {
    type: Number,
    required: true,
  },
});

const contributorModel = mongoose.model('contributor', contributorSchema);

module.exports = contributorModel;
