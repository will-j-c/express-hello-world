const express = require('express');
const controller = require('../controllers/contributorController');
const authMiddleware = require('../middlewares/userAuth');

const router = express.Router();

router.put(
  '/:id/accept/:username',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  controller.acceptApplicant
);
router.put(
  '/:id/reject/:username',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  controller.rejectApplicant
);
router.post('/:id/apply', authMiddleware.isAuthenticated, controller.addApplicant);
router.delete('/:id/withdraw', authMiddleware.isAuthenticated, controller.removeApplicant);
router.get('/:id', controller.show);
router.delete(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  controller.delete
);
router.put('/:id', authMiddleware.isAuthenticated, authMiddleware.isAuthorized, controller.update);
router.get('/', controller.index);

module.exports = router;
