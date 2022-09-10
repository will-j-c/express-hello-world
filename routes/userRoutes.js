const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/userAuth');

const router = express.Router();

router.get('/', userController.showAllUsers);
router.post('/:token/activate', userController.activateAccount);
router.get('/:username/following', userController.showFollowingUsers);
router.get('/:username/followers', userController.showFollowerUsers);
router.post('/:username/follow', userController.addFollowUser);
router.delete('/:username/unfollow', userController.unfollowUser);
router.get('/:username', userController.showProfile);
router.delete('/:username', userController.deleteAccount);

module.exports = router;
