const express = require('express');
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', submissionController.startSubmission);
router.get('/:id', submissionController.getSubmission);

module.exports = router;
