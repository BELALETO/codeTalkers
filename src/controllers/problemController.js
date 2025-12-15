const Problem = require('../models/problemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getAllProblems = catchAsync(async (req, res, next) => {
    const problems = await Problem.find();
    res.status(200).json({
        status: 'success',
        results: problems.length,
        data: {
            problems
        }
    });
});

const getProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
        return next(new AppError('Problem not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            problem
        }
    });
});

const createProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            problem
        }
    });
});

const updateProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!problem) {
        return next(new AppError('Problem not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            problem
        }
    });
});

const deleteProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
        return next(new AppError('Problem not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllProblems,
    getProblem,
    createProblem,
    updateProblem,
    deleteProblem
};
