const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');

const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }

  const decoded = await verifyToken(token);
  const user = await User.findById(decoded.id).select('+active');

  if (!user) {
    return next(new AppError("User doesn't exist☹️", 404));
  }

  // Check if user account is still active
  if (!user.active) {
    return next(
      new AppError(
        'This account has been deactivated. Please contact support.',
        401
      )
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role))
      return next(new AppError('Forbidden❌', 403));
    next();
  };
};

module.exports = { protect, restrictTo };
