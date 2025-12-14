const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');

const protect = catchAsync(async (req, res, next) => {
  console.log(req.headers);
  const token = req.cookies?.jwt;

  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }
  console.log('token extracted from cookie :>> ', token);
  const decoded = await verifyToken(token);
  console.log('decoded :>> ', decoded);
  const user = await User.findById(decoded.id);
  console.log('user :>> ', user);
  if (!user) {
    return next(new AppError("User doesn't exist☹️", 404));
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
