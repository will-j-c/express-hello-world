const mongoose = require('mongoose');

const contributorsRelationshipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  contributor_id: {
    type: mongoose.ObjectId,
    ref: 'contributor',
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const contributorsRelationshipModel = mongoose.model(
  'contributorsRelationship',
  contributorsRelationshipSchema
);

module.exports = contributorsRelationshipModel;
