const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const cache = require('../utils/cache');

/**
 * User Controller
 * Handles HTTP requests/responses for user management endpoints
 * Business logic is delegated to userService
 */

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const key = `users:all:${JSON.stringify(req.query)}`;
  const cachedUsers = await cache.get(key);

  if (cachedUsers) {
    return res.status(200).json({
      status: 'success',
      results: cachedUsers.length,
      data: {
        users: cachedUsers
      }
    });
  }

  // Delegate business logic to service
  const users = await userService.getAllUsers(req.query);

  await cache.set(key, users, 3600); // Cache for 1 hour

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
  const key = `users:${req.params.id}`;
  const cachedUser = await cache.get(key);

  if (cachedUser) {
    return res.status(200).json({
      status: 'success',
      data: {
        user: cachedUser
      }
    });
  }

  // Delegate business logic to service
  const user = await userService.getUserById(req.params.id);

  if (user) {
    await cache.set(key, user, 3600);
  }

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

  // Invalidate cache
  await cache.del(`users:${req.params.id}`);
  await cache.del('users:all*');

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

  // Invalidate cache
  await cache.del(`users:${req.params.id}`);
  await cache.del('users:all*');

  // Handle HTTP response
  res.status(204).json({
    status: 'success',
    data: null
  });
});
