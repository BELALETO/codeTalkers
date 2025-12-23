const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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

/**
 * Handle forgotten password request
 * @param {string} email - User email
 * @param {string} protocol - Request protocol (http/https)
 * @param {string} host - Request host
 * @returns {Promise<void>}
 * @throws {AppError} If user not found or email sending fails
 */
const forgotPassword = async (email, protocol, host) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('There is no user with email address.', 404);
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${protocol}://${host}/reset-password/${resetToken}`; // Current frontend URL structure assumption.
  // Ideally this should be an env var pointing to frontend logic, but usually for these tasks we can assume path.

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail(
      email,
      'Your password reset token (valid for 10 min)',
      message
    );
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the email. Try again later!',
      500
    );
  }
};

/**
 * Reset password using token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Updated user
 * @throws {AppError} If token is invalid or expired
 */
const resetPassword = async (token, password, confirmPassword) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};

module.exports = {
  registerUser,
  getCurrentUser,
  updateCurrentUser,
  deactivateUser,
  forgotPassword,
  resetPassword
};
