const express = require('express');
const controller = require('../controllers/contributorController');
const authMiddleware = require('../middlewares/userAuth');

const router = express.Router();

// TO DO: add authorization middleware later once ready
router.put('/:id/accept/:userId', authMiddleware.isAuthenticated, controller.acceptApplicant);
router.put('/:id/reject/:userId', authMiddleware.isAuthenticated, controller.rejectApplicant);
router.post('/:id/apply', authMiddleware.isAuthenticated, controller.addApplicant);
router.delete('/:id/withdraw', authMiddleware.isAuthenticated, controller.removeApplicant);
router.get('/:id', controller.showOne);
router.delete(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorized,
  controller.delete
);
router.put('/:id', authMiddleware.isAuthenticated, authMiddleware.isAuthorized, controller.update);
router.get('/', controller.showAll);
router.post('/', authMiddleware.isAuthenticated, authMiddleware.isAuthorized, controller.add);

module.exports = router;
