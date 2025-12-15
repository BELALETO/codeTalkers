const User = require('../models/userModel');
const AppError = require('../utils/appError');

/**
 * Authentication Service
 * Contains business logic for user authentication and account management
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.confirmPassword - Password confirmation
 * @param {string} userData.displayName - User display name
 * @returns {Promise<Object>} Created user object
 * @throws {AppError} If email already exists
 */
const registerUser = async (userData) => {
  const { email, password, confirmPassword, displayName } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use.', 400);
  }

  // Create new user
  const newUser = await User.create({
    email,
    password,
    confirmPassword,
    displayName
  });

  return newUser;
};

/**
 * Get current user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {AppError} If user not found
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User doesn't exist", 404);
  }

  return user;
};

/**
 * Update current user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 * @throws {AppError} If password update attempted or user not found
 */
const updateCurrentUser = async (userId, updateData) => {
  // Check if user tries to update password through this route
  if (updateData.password || updateData.confirmPassword) {
    throw new AppError(
      'This route is not for password updates. Please use /update-password',
      400
    );
  }

  // Filter out unwanted fields that are not allowed to be updated
  const allowedFields = ['displayName', 'email', 'avatar'];
  const filteredBody = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = updateData[key];
    }
  });

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    throw new AppError("User doesn't exist", 404);
  }

  return updatedUser;
};

/**
 * Deactivate user account (soft delete)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 * @throws {AppError} If user not found
 */
const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { active: false });

  if (!user) {
    throw new AppError("User doesn't exist", 404);
  }
};

module.exports = {
  registerUser,
  getCurrentUser,
  updateCurrentUser,
  deactivateUser
};
