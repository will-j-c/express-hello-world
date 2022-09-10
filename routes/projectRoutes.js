const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.get('/:slug', projectController.projectShow);
router.put('/:slug', projectController.editProject);
router.delete('/:slug', projectController.deleteProject);
router.get('/', projectController.showAllProjects);
router.post('/', projectController.createProject);

module.exports = router;
