const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
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
  (email, password, done) => {
    // Implement your local authentication logic here
    // For example, find the user in the database and verify the password
    return done(null, false); // Replace with actual user object on success
  }
);

const google = new GoogleStrategy(
  {
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Implement your Google authentication logic here
    // For example, find or create a user in the database based on the Google profile
    return done(null, profile); // Replace with actual user object on success
  }
);

const github = new GitHubStrategy(
  {
    clientID: githubClientID,
    clientSecret: githubClientSecret,
    callbackURL: '/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Implement your GitHub authentication logic here
    // For example, find or create a user in the database based on the GitHub profile
    return done(null, profile); // Replace with actual user object on success
  }
);

passport.use(local);
passport.use(google);
passport.use(github);
