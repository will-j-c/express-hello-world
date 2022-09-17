const express = require('express');
const controller = require('../controllers/dataController');

const router = express.Router();

router.get('/skills', controller.skills);
router.get('/categories', controller.categories);

module.exports = router;
