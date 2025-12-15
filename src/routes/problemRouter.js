const router = require('express').Router();
const { getAllProblems, getProblem, createProblem, updateProblem, deleteProblem } = require('../controllers/problemController');
const { protect, restrictTo } = require('../middleware/auth');

router.route('/').get(protect, getAllProblems).post(protect, restrictTo('admin'), createProblem);
router.route('/:id').get(protect, getProblem).patch(protect, restrictTo('admin'), updateProblem).delete(protect, restrictTo('admin'), deleteProblem);
module.exports = router;
