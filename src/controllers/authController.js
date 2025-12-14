const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendCookie, clearCookie } = require('../utils/cookie');

// Local registration controller
exports.registerUser = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword, displayName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use.', 400));
  }

  const newUser = await User.create({
    email,
    password,
    confirmPassword,
    displayName
  });

  await sendCookie(res, newUser);
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    user: newUser
  });
});

// Get current authenticated user
exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user (restricted fields)
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if user tries to update password through this route
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password',
        400
      )
    );
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const allowedFields = ['displayName', 'email', 'avatar'];
  const filteredBody = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Soft delete current user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // Clear authentication cookie
  clearCookie(res);

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully',
    data: null
  });
});
