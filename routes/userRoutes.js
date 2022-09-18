const express = require('express');
const multer = require('multer');

const userController = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');

const upload = multer();
const router = express.Router();

router.get('/', userController.showAllUsers);
router.post('/:token/activate', userController.activateAccount);
router.get(
  '/:username/applications',
  userAuth.isAuthenticated,
  userAuth.isAuthorized,
  userController.showApplications
);
router.get('/:username/following', userController.showFollowingUsers);
router.get('/:username/followers', userController.showFollowerUsers);
router.post('/:username/follow', userAuth.isAuthenticated, userController.followUser);

router.get('/:username', userController.showUserProfile);
router.get(
  '/:username/projects',
  userAuth.isAuthenticated,
  userAuth.isAuthorized,
  userController.showUserProjects
);
router.get('/:username/projects/public', userController.showUserProjectsPublic);
router.get(
  '/:username/projects/applied',
  userAuth.isAuthenticated,
  userAuth.isAuthorized,
  userController.showUserProjectsApplied
);
router.get('/:username/projects/accepted', userController.showUserProjectsAccepted);
router.get(
  '/:username/projects/following',
  userAuth.isAuthenticated,
  userAuth.isAuthorized,
  userController.showUserProjectsFollowing
);

router.put(
  '/:username',
  userAuth.isAuthenticated,
  userAuth.isAuthorized,
  upload.single('avatar'),
  userController.editProfile
);
router.delete('/:username/unfollow', userAuth.isAuthenticated, userController.unfollowUser);
router.delete(
  '/:username',
  userAuth.isAuthenticated,
  userAuth.isAuthorized,
  userController.deleteAccount
);

module.exports = router;
