const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendCookie } = require('../utils/cookie');

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

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: 'success',
    user
  });
});