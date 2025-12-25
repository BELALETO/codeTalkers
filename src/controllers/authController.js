const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendCookie, clearCookie } = require('../utils/cookie');
const cache = require('../utils/cache');

/**
 * Authentication Controller
 * Handles HTTP requests/responses for authentication endpoints
 * Business logic is delegated to authService
 */

// Local registration controller
exports.registerUser = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword, displayName } = req.body;

  // Delegate business logic to service
  const newUser = await authService.registerUser({
    email,
    password,
    confirmPassword,
    displayName
  });

  // Handle HTTP response
  const token = await sendCookie(res, newUser);
  res.status(201).json({
    status: 'success',
    token,
    message: 'User registered successfully',
    user: newUser
  });
});

// Get current authenticated user
exports.getMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cacheKey = `user:me:${userId}`;

  // 1. Try cache
  const cachedUser = await cache.get(cacheKey);
  if (cachedUser) {
    return res.status(200).json({
      status: 'success',
      data: {
        user: JSON.parse(cachedUser)
      }
    });
  }

  // 2. Fallback to DB
  const user = await authService.getCurrentUser(userId);

  // 3. Store in Redis (TTL: 5 minutes)
  await cache.set(cacheKey, user, 300);

  // 4. Respond
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user (restricted fields)
exports.updateMe = catchAsync(async (req, res, next) => {
  // Delegate business logic to service
  const updatedUser = await authService.updateCurrentUser(
    req.user.id,
    req.body
  );

  // Handle HTTP response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Soft delete current user
exports.deleteMe = catchAsync(async (req, res, next) => {
  // Delegate business logic to service
  await authService.deactivateUser(req.user.id);

  // Handle HTTP response
  clearCookie(res);
  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully',
    data: null
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  await authService.forgotPassword(
    req.body.email,
    req.protocol,
    req.get('host')
  );

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const user = await authService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.confirmPassword
  );

  await sendCookie(res, user);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
    data: { user }
  });
});
