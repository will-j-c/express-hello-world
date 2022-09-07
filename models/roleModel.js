const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  title: {
    type: String,
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

const RoleModel = mongoose.model('Role', RoleSchema);

module.exports = RoleModel;
