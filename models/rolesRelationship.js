const mongoose = require('mongoose');

const rolesRelationshipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  role_id: {
    type: mongoose.ObjectId,
    ref: 'Role',
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const RolesRelationshipModel = mongoose.model('RolesRelationship', rolesRelationshipSchema);

module.exports = RolesRelationshipModel;
