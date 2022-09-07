const mongoose = require('mongoose');

const usersRelationshipSchema = new mongoose.Schema({
  follower: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  followee: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
});

const UsersRelationshipModel = mongoose.model('UsersRelationship', usersRelationshipSchema);

module.exports = UsersRelationshipModel;
