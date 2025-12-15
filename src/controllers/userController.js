const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

/**
 * User Controller
 * Handles HTTP requests/responses for user management endpoints
 * Business logic is delegated to userService
 */

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Delegate business logic to service
  const users = await userService.getAllUsers(req.query);

  // Handle HTTP response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // Delegate business logic to service
  const user = await userService.getUserById(req.params.id);

  // Handle HTTP response
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Delegate business logic to service
  const user = await userService.updateUser(req.params.id, req.body);

  // Handle HTTP response
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // Delegate business logic to service
  await userService.deleteUser(req.params.id);

  // Handle HTTP response
  res.status(204).json({
    status: 'success',
    data: null
  });
});
