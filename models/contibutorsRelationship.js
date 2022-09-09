const mongoose = require('mongoose');

const contributorRelationshipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  contributor_id: {
    type: mongoose.ObjectId,
    ref: 'Role',
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const ContributorRelationshipModel = mongoose.model(
  'ContibutorRelationship',
  contributorRelationshipSchema
);

module.exports = ContributorRelationshipModel;
