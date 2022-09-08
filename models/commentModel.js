const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.ObjectId,
      required: true,
    },
    project_id: {
      type: mongoose.ObjectId,
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
