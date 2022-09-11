/* eslint-disable no-underscore-dangle */
const { isError } = require('joi');
const jwt = require('jsonwebtoken');
const CommentModel = require('../models/commentModel');
const UserModel = require('../models/userModel');

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
    const commentRoute = '/api/v1/comments';
    if (req.baseUrl === commentRoute) {
      // Compare the comment user_id to the user making the request
      const comment = await CommentModel.findOne({ _id: req.params.id }, { user_id: 1, _id: 0 });
      const user = await UserModel.findOne({ username: req.authUser.username }, { _id: 1 });
      if (comment.user_id.toString() === user._id.toString()) {
        return next();
      }
      return res.status(403).json();
    }
    return next();
  },
};

module.exports = userAuth;
