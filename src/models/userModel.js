const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      lowercase: true
    },
    googleId: { type: String, unique: true },
    githubId: { type: String, unique: true },
    avatar: { type: String },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      minlength: 8,
      select: false
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match'
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    rank: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    score: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Problem',
      default: []
    },
    active: { type: Boolean, default: true, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Calculate rank based on score
userSchema.pre('save', async function () {
  if (!this.isModified('score')) return;

  if (this.score <= 200) {
    this.rank = 'bronze';
  } else if (this.score > 200 && this.score <= 800) {
    this.rank = 'silver';
  } else if (this.score > 800 && this.score <= 1600) {
    this.rank = 'gold';
  } else {
    this.rank = 'platinum';
  }
});

// Instance method to update score and solved problems
userSchema.methods.solveProblem = async function (problemId, points) {
  this.score += points;

  if (!this.problemsSolved.includes(problemId)) {
    this.problemsSolved.push(problemId);
  }

  return await this.save();
};

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.githubId || this.googleId) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Query middleware to exclude inactive users from results
userSchema.pre(/^find/, function () {
  // 'this' points to the current query
  this.where('active').ne(false);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
