const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.post('/:slug/follow/:username', projectController.followProject);
router.get('/:slug', projectController.projectShow);
router.get('/', projectController.showAllProjects);
router.post('/', projectController.createProject);

module.exports = router;
