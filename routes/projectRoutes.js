const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.post('/:slug/follow/:username', projectController.followProject);
router.delete('/:slug/unfollow/:username', projectController.unfollowProject);
router.get('/:slug', projectController.projectShow);
router.put('/:slug', projectController.editProject);
router.get('/', projectController.showAllProjects);
router.post('/', projectController.createProject);

module.exports = router;
