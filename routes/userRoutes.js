const express = require('express');
const userController = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');
const multer = require('multer');
const upload = multer();
const router = express.Router();

router.get('/', userController.showAllUsers);
router.post('/:token/activate', userController.activateAccount);
router.get('/:username/following', userController.showFollowingUsers);
router.get('/:username/followers', userController.showFollowerUsers);
router.post('/:username/follow', userAuth.isAuthenticated, userController.followUser);

router.get('/:username', userController.showProfile);
router.get('/:username/projects', userController.showUserProjects);
router.get('/:username/projects/public', userController.showUserProjectsPublic);
router.get('/:username/projects/draft', userController.showUserProjectsDraft);
router.get('/:username/projects/applied', userController.showUserProjectsApplied);
router.get('/:username/projects/accepted', userController.showUserProjectsAccepted);
router.get('/:username/projects/following', userController.showUserProjectsFollowing);

router.put(
  '/:username',
  userAuth.isAuthenticated,
  upload.single('avatar'),
  userController.editProfile
);
router.delete('/:username/unfollow', userAuth.isAuthenticated, userController.unfollowUser);
router.get('/:username', userController.showProfile);
router.delete('/:username', userAuth.isAuthenticated, userController.deleteAccount);

module.exports = router;
