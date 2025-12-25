const router = require('express').Router();
const sendEmail = require('../utils/email');
const passport = require('passport');
const {
  registerUser,
  getMe,
  updateMe,
  deleteMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
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
    await sendEmail(
      req.user.email,
      'Welcome to CodeTalkers',
      'You have successfully logged in'
    );
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
    await sendEmail(
      req.user.email,
      'Welcome to CodeTalkers',
      'You have successfully logged in'
    );
    res.redirect('/dashboard');
  }
);

// Local authentication route
//TODO: enhence it by sending JSON instead of redirecting.
router.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    // Successful authentication
    const token = await sendCookie(res, req.user);
    await sendEmail(
      req.user.email,
      'Welcome to CodeTalkers',
      'You have successfully logged in'
    );
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: req.user
      }
    });
  }
);

// Registration route (if needed)

router.route('/register').post(registerUser);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Self-service account management routes (protected)
router.get('/me', protect, getMe);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);

// Logout route
router.get('/logout', (req, res) => {
  clearCookie(res);
  res
    .status(200)
    .json({ status: 'success', message: 'Logged out successfully' });
});
module.exports = router;
