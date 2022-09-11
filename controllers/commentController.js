/* eslint-disable no-underscore-dangle */
const CommentModel = require('../models/commentModel');
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');

const controller = {
  postComment: async (req, res) => {
    try {
      // Check user and project exist
      const projectId = await ProjectModel.findOne({ slug: req.params.slug }, { _id: 1 });
      const userId = await UserModel.findOne({ username: req.authUser.username }, { _id: 1 });
      if (!userId) {
        return res.status(403).json();
      }
      if (!projectId) {
        return res.status(400).json();
      }
      // Validation of comment TODO
      const validatedComment = {
        user_id: userId._id,
        project_id: projectId._id,
        content: req.body.content,
      };
      console.log(validatedComment);
      // Create new comment
      await CommentModel.create(validatedComment);
      return res.json();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to post comment',
      });
    }
  },
  editComment: async (rew, res) => {
    res.send('Message edited');
  },
  deleteComment: async (rew, res) => {
    res.send('Message deleted');
  },
};

module.exports = controller;
