const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    project_id: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model('Comment', CommentSchema);

module.exports = CommentModel;
