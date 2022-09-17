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
    type: Array, // Array of String: ["skill", "skills", "skill"]
  },
  interests: {
    type: Array, // Array of String: ["interest", "skiinterestsll", "interest"]
  },
  profile_pic_url: {
    type: String,
  },
  // format of socmed:
  //  socmed: {facebook: "abc.com",
  //           linkedin: "abc.com",
  //           github: "abc.com",
  //           twitter: "abc.com",}
  socmed: {
    type: Object,
  },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
