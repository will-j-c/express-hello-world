/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const CommentModel = require('../models/commentModel');
const UserModel = require('../models/userModel');
const ContributorModel = require('../models/contributorModel');
const ProjectModel = require('../models/projectModel');

const userAuth = {
  isAuthenticated: (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication details empty',
      });
    }
    if (authHeader.slice(0, 7) !== 'Bearer ') {
      return res.status(401).json({
        error: 'Invalid authentication type',
      });
    }
    const token = authHeader.slice(7);
    if (token.length === 0) {
      return res.status(401).json({
        error: 'Invalid authentication token',
      });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET_ACCESS);

    if (verified) {
      req.authUser = verified.data;
      return next();
    }

    return res.status(401).json({
      message: 'Invalid authentication token',
    });
  },

  isAuthorized: async (req, res, next) => {
    const route = req.baseUrl.split('/').pop();
    const user = await UserModel.findOne({ username: req.authUser.username }, { _id: 1 });

    switch (route) {
      case 'comments':
        await commentsAuth();
        break;
      case 'contributors':
        await contributorsAuth();
        break;
      case 'projects':
        await projectsAuth();
        break;
      case 'users':
        usersAuth();
        break;
      default:
        return next();
    }

    async function commentsAuth() {
      const comment = await CommentModel.findOne({ _id: req.params.id }, { user_id: 1, _id: 0 });
      if (comment.user_id.toString() === user._id.toString()) {
        return next();
      }
      return res
        .status(403)
        .json({ error: 'User is not authorized to change Comments details for this project' });
    }

    async function projectsAuth() {
      // If it's a request to unfollow a project
      if (req.params.username) {
        if (req.params.username === req.authUser.username) {
          return next();
        }
        return res.status(403).json({
          error: 'User is not authorized to change Project details for this project',
        });
      }
      const project = await ProjectModel.findOne({ slug: req.params.slug }, { user_id: 1, _id: 0 });
      if (project?.user_id.toString() === user?._id.toString()) {
        return next();
      }
      return res.status(403).json({
        error: 'User is not authorized to change Project details for this project',
      });
    }

    async function contributorsAuth() {
      const contributor = await ContributorModel.findOne({ _id: req.params.id });
      const project = await ProjectModel.findById(contributor.project_id);
      if (project.user_id.toString() === user._id.toString()) {
        req.contributorID = contributor?._id;
        req.projectID = project._id;
        return next();
      }
      return res.status(403).json({
        error: 'User is not authorized to change Contributor details for this project',
      });
    }

    function usersAuth() {
      if (req.authUser.username === req.params.username) {
        req.userID = user._id;
        return next();
      }
      return res.status(403).json({
        error: 'User is not authorized',
      });
    }
  },
};

module.exports = userAuth;
