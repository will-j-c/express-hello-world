const mongoose = require('mongoose');

const rolesRelationshipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  project_id: {
    type: mongoose.ObjectId,
    ref: 'Project',
    required: true,
  },
  state: {
    type: mongoose.ObjectId,
    ref: 'Project',
    required: true,
  },
});

const RolesRelationshipModel = mongoose.model('RolesRelationship', rolesRelationshipSchema);

module.exports = RolesRelationshipModel;
