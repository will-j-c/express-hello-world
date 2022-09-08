const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    required: true,
  },
  tagline: {
    type: String,
  },
  skills: {
    type: Array,
  },
  interests: {
    type: Array,
  },
  profile_pic_url: {
    type: String,
  },
  socmed: {
    type: Array,
  },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
