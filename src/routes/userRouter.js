const router = require('express').Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.route('/').get(protect, restrictTo('admin'), getAllUsers);
router
  .route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
