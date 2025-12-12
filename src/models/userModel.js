const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      lowercase: true
    },
    googleId: { type: String },
    githubId: { type: String },
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
    }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.githubId || this.googleId) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
