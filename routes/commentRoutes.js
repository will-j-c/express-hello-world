const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/userAuth');

const router = express.Router();

router.post('/:slug', authMiddleware.isAuthenticated, commentController.postComment);
router.get('/:slug', authMiddleware.isAuthenticated, commentController.showProjectComments);
router.put(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  commentController.editComment
);
router.delete(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  commentController.deleteComment
);

module.exports = router;
