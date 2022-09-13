/* eslint-disable no-underscore-dangle */
const CommentModel = require('../models/commentModel');
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const commentValidation = require('../validations/commentValidation');

const callDatabase = async ({ id, slug, username }) => ({
  projectId: await ProjectModel.findOne({ slug }, { _id: 1 }),
  userId: await UserModel.findOne({ username }, { _id: 1 }),
  commentId: await CommentModel.findOne({ _id: id }, { _id: 1 }),
});

const controller = {
  postComment: async (req, res) => {
    try {
      const databaseCall = await callDatabase({
        id: req.params.id,
        slug: req.params.slug,
        username: req.authUser.username,
      });
      // Check user and project exist
      if (!databaseCall.userId) {
        return res.status(403).json();
      }
      if (!databaseCall.projectId) {
        return res.status(400).json();
      }
      // Validations
      let validatedResults = null;
      try {
        const comment = {
          user_id: databaseCall.userId._id,
          project_id: databaseCall.projectId._id,
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
      const databaseCall = await callDatabase({
        id: req.params.id,
        slug: req.params.slug,
        username: req.authUser.username,
      });
      // Check user and comment exists
      if (!databaseCall.userId) {
        return res.status(403).json();
      }
      if (!databaseCall.commentId) {
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
      await CommentModel.updateOne(databaseCall.commentId, validatedResults);
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
      const databaseCall = await callDatabase({
        id: req.params.id,
        slug: req.params.slug,
        username: req.authUser.username,
      });
      // Check user and comment exists
      if (!databaseCall.userId) {
        return res.status(403).json();
      }
      if (!databaseCall.commentId) {
        return res.status(400).json();
      }
      databaseCall.commentId.deleteOne();
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
