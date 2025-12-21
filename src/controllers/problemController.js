const Problem = require('../models/problemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const cache = require('../utils/cache');

const getAllProblems = catchAsync(async (req, res, next) => {
    const key = `problems:all:${JSON.stringify(req.query)}`;
    const cachedProblems = await cache.get(key);

    if (cachedProblems) {
        return res.status(200).json({
            status: 'success',
            results: cachedProblems.length,
            data: {
                problems: cachedProblems
            }
        });
    }

    const features = new APIFeatures(Problem.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const problems = await features.query;

    await cache.set(key, problems, 3600);

    res.status(200).json({
        status: 'success',
        results: problems.length,
        data: {
            problems
        }
    });
});

const getProblem = catchAsync(async (req, res, next) => {
    const key = `problems:${req.params.id}`;
    const cachedProblem = await cache.get(key);

    if (cachedProblem) {
        return res.status(200).json({
            status: 'success',
            data: {
                problem: cachedProblem
            }
        });
    }

    const problem = await Problem.findById(req.params.id);
    if (!problem) {
        return next(new AppError('Problem not found', 404));
    }

    await cache.set(key, problem, 3600);

    res.status(200).json({
        status: 'success',
        data: {
            problem
        }
    });
});

const createProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.create(req.body);

    await cache.del('problems:all*');

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

    await cache.del(`problems:${req.params.id}`);
    await cache.del('problems:all*');

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

    await cache.del(`problems:${req.params.id}`);
    await cache.del('problems:all*');

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
