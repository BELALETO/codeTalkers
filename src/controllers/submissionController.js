const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const submissionQueue = require('../queues/submissionQueue');

exports.startSubmission = catchAsync(async (req, res, next) => {
    const { code, language, problemId } = req.body;

    // 1) Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
        return next(new AppError('No problem found with that ID', 404));
    }

    // 2) Create submission record
    const submission = await Submission.create({
        user: req.user.id,
        problem: problemId,
        code,
        language,
        status: 'queued'
    });

    // 3) Add to queue
    await submissionQueue.add('processSubmission', {
        submissionId: submission.id,
        code,
        language,
        problemId,
        userId: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            submission
        }
    });
});

exports.getSubmission = catchAsync(async (req, res, next) => {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
        return next(new AppError('No submission found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            submission
        }
    });
});
