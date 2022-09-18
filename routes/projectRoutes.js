const express = require('express');
const multer = require('multer');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/userAuth');

const upload = multer();

const router = express.Router();

const contributorController = require('../controllers/contributorController');

// for contributor add route
router.post(
  '/:slug/contributors',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  contributorController.add
);

router.get('/:slug/contributors', contributorController.showByProject);

router.post(
  '/:slug/follow/:username',
  authMiddleware.isAuthenticated,
  projectController.followProject
);
router.delete(
  '/:slug/unfollow/:username',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  projectController.unfollowProject
);
router.get('/:slug', projectController.projectShow);
router.put(
  '/:slug',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  upload.fields([
    { name: 'logo_url', maxCount: 1 },
    { name: 'image_urls', maxCount: 4 },
  ]),
  projectController.editProject
);
router.delete(
  '/:slug',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  projectController.deleteProject
);
router.post(
  '/upload',
  authMiddleware.isAuthenticated,
  upload.fields([
    { name: 'logo_url', maxCount: 1 },
    { name: 'image_urls', maxCount: 4 },
  ]),
  projectController.uploadPhotos
);
router.get('/', projectController.showAllProjects);
router.post('/', authMiddleware.isAuthenticated, projectController.createProject);

module.exports = router;
