const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const {
  googleClientID,
  googleClientSecret,
  githubClientID,
  githubClientSecret
} = require('./config');

const local = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.correctPassword(password, user.password))) {
        return done(new AppError('Incorrect email or password.', 404), false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);

const google = new GoogleStrategy(
  {
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: '/api/v1/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          displayName: profile.displayName,
          avatar: profile.photos?.[0].value
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);

const github = new GitHubStrategy(
  {
    clientID: githubClientID,
    clientSecret: githubClientSecret,
    callbackURL: '/api/v1/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        console.log('profile :>> ', profile);
        user = await User.create({
          githubId: profile.id,
          email: profile.emails?.[0]?.value || null,
          displayName: profile.displayName || profile.username,
          avatar: profile.photos?.[0].value
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);

passport.use(local);
passport.use(google);
passport.use(github);

module.exports = passport;
