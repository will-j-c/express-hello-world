const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', userController.showAllUsers);
router.get('/:username', userController.showUsername);
router.get('/:username/following', userController.showFollowingUsers);

module.exports = router;
