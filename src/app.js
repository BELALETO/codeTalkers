const express = require('express');
const morgan = require('morgan');
const sendEmail = require('./utils/email');

const app = express();

// Middleware for logging HTTP requests
app.use(morgan('dev'));

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

module.exports = app;
