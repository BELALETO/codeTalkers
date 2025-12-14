const express = require('express');
const morgan = require('morgan');
const sendEmail = require('./utils/email');
const passport = require('./config/passport');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware for logging HTTP requests
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(limiter);
app.use(passport.initialize());

// Middleware for parsing JSON bodies
app.use(express.json());

// Sample route
app.get('/', async (req, res) => {
  await sendEmail(
    'belalsryo@gmail.com',
    'Test Email',
    'This is a test email from the Express app.'
  );
  res.send('Hello, World!');
});

app.get('/dashboard', (req, res) => {
  res.send('Welcome to your dashboard!');
});

app.get('/login', (req, res) => {
  res.send('Please login to continue.');
});

// Authentication routes
app.use('/api/v1/auth', authRouter);
// User routes
app.use('/api/v1/users', userRouter);
module.exports = app;
