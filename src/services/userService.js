const User = require('../models/userModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * User Service
 * Contains business logic for user management operations
 */

/**
 * Get all users with optional filtering, sorting, and pagination
 * @param {Object} queryOptions - Query options from request
 * @returns {Promise<Array>} Array of users
 */
const getAllUsers = async (queryOptions = {}) => {
  const features = new APIFeatures(User.find(), queryOptions)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  return users;
};

/**
 * Get single user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {AppError} If user not found
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return user;
};

/**
 * Update user (admin operation)
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 * @throws {AppError} If user not found
 */
const updateUser = async (userId, updateData) => {
  const { avatar, displayName } = updateData;

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar, displayName },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return user;
};

/**
 * Delete user (hard delete - admin operation)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 * @throws {AppError} If user not found
 */
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
