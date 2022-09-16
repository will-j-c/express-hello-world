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
        return res.status(400).json({
          error: 'Validation failed',
        });
      }
      // Create new comment
      await CommentModel.create(validatedResults);
      return res.json();
    } catch (error) {
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
        return res.status(400).json({
          error: 'Validation failed',
        });
      }
      await CommentModel.updateOne(databaseCall.commentId, validatedResults);
      return res.json();
    } catch (error) {
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
      return res.status(500).json({
        error: 'Failed to delete comment',
      });
    }
  },
  showProjectComments: async (req, res) => {
    try {
      const databaseCall = await callDatabase({
        id: req.params.id,
        slug: req.params.slug,
        username: req.authUser.username,
      });
      const commentsPerPage = 10;
      const skipNumber = req.query.page * commentsPerPage - commentsPerPage || 0;
      const comments = await CommentModel.find(
        { project_id: databaseCall.projectId },
        { project_id: 0, _id: 0, createdAt: 0 }
      )
        .sort({ updatedAt: 'desc' })
        .skip(skipNumber)
        .limit(commentsPerPage)
        .populate('user_id')
        .lean();
      const commentsToSend = comments.map((comment) => ({
        userProfilePic: comment.user_id.profile_pic_url || null,
        content: comment.content,
        updatedAt: comment.updatedAt,
        user_id: comment.user_id._id,
      }));
      return res.json(commentsToSend);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch comments',
      });
    }
  },
};

module.exports = controller;
