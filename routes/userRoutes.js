const express = require('express');
const userController = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');
const router = express.Router();

router.get('/', userController.showAllUsers);
router.post('/:token/activate', userController.activateAccount);
router.get('/:username/following', userController.showFollowingUsers);
router.get('/:username/followers', userController.showFollowerUsers);
router.post('/:username/follow', userAuth.isAuthenticated, userController.followUser);
router.put('/:username', userAuth.isAuthenticated, userController.editProfile);
router.delete('/:username/unfollow', userAuth.isAuthenticated, userController.unfollowUser);
router.get('/:username', userController.showProfile);
router.delete('/:username', userController.deleteAccount);

module.exports = router;
