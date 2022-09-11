const express = require('express');
const controller = require('../controllers/contributorController');
const authMiddleware = require('../middlewares/userAuth');

const router = express.Router();

router.put(
  '/:id/accept/:userId',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  controller.acceptApplicant
);
router.put(
  '/:id/reject/:userId',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  controller.rejectApplicant
);
router.post('/:id/apply', authMiddleware.isAuthenticated, controller.addApplicant);
router.delete('/:id/withdraw', authMiddleware.isAuthenticated, controller.removeApplicant);
router.get('/:id', controller.showOne);
router.delete(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  controller.delete
);
// eslint-disable-next-line prettier/prettier
router.put(
  '/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.isAuthorised,
  controller.update
);
router.get('/', controller.showAll);
router.post('/', authMiddleware.isAuthenticated, controller.add);

module.exports = router;
