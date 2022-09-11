const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/userAuth');

const router = express.Router();

router.post(
  '/:slug',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  commentController.postComment
);
router.put(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  commentController.editComment
);
router.delete(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  commentController.deleteComment
);

module.exports = router;
