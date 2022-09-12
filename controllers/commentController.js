/* eslint-disable no-underscore-dangle */
const CommentModel = require('../models/commentModel');
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const commentValidation = require('../validations/commentValidation');

const callDatabase = async (req) => {
  console.log(req.params.id);
  const projectId = await ProjectModel.findOne({ slug: req.params.slug }, { _id: 1 });
  const userId = await UserModel.findOne({ username: req.authUser.username }, { _id: 1 });
  const commentId = await CommentModel.findOne({ _id: req.params.id }, { _id: 1 });
  return [projectId, userId, commentId];
};

const controller = {
  postComment: async (req, res) => {
    try {
      const [projectId, userId] = await callDatabase(req);
      // Check user and project exist
      if (!userId) {
        return res.status(403).json();
      }
      if (!projectId) {
        return res.status(400).json();
      }
      // Validations
      let validatedResults = null;
      try {
        const comment = {
          user_id: userId._id,
          project_id: projectId._id,
          content: req.body.content,
        };
        validatedResults = await commentValidation.post.validateAsync(comment);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error: 'Validation failed',
        });
      }
      // Create new comment
      await CommentModel.create(validatedResults);
      return res.json();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to post comment',
      });
    }
  },
  editComment: async (req, res) => {
    try {
      const [, userId, commentId] = await callDatabase(req);
      // Check user and comment exists
      if (!userId) {
        return res.status(403).json();
      }
      if (!commentId) {
        return res.status(400).json();
      }
      // Validations
      let validatedResults = null;
      try {
        const comment = {
          content: req.body.content,
        };
        validatedResults = await commentValidation.edit.validateAsync(comment);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error: 'Validation failed',
        });
      }
      await CommentModel.updateOne(commentId, validatedResults);
      return res.json();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to edit comment',
      });
    }
  },
  deleteComment: async (req, res) => {
    try {
      const [, userId, commentId] = await callDatabase(req);
      // Check user and comment exists
      if (!userId) {
        return res.status(403).json();
      }
      if (!commentId) {
        return res.status(400).json();
      }
      commentId.deleteOne();
      return res.json();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: 'Failed to delete comment',
      });
    }
  },
};

module.exports = controller;
