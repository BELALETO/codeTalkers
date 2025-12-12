const router = require('express').Router();
const passport = require('passport');
const { registerUser } = require('../controllers/authController');
const { sendCookie, clearCookie } = require('../utils/cookie');

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  async (req, res) => {
    // Successful authentication
    await sendCookie(res, req.user);
    res.status(200).redirect('/dashboard');
  }
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    session: false
  }),
  async (req, res) => {
    // Successful authentication
    await sendCookie(res, req.user);
    res.redirect('/dashboard');
  }
);

// Local authentication route
router.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Successful authentication
    res.status(200).redirect('/dashboard');
  }
);

// Registration route (if needed)

router.route('/register').post(registerUser);

// Logout route
router.get('/logout', (req, res) => {
  clearCookie(res);
  res
    .status(200)
    .json({ status: 'success', message: 'Logged out successfully' });
});
module.exports = router;
