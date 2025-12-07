const mongoose = require('mongoose');
const { mongoURI, mongoUser, mongoPassword } = require('./config');

const getConnectionString = () => {
  return mongoURI
    .replace('<USER>', encodeURIComponent(mongoUser))
    .replace('<PASSWORD>', encodeURIComponent(mongoPassword));
};

const connectDB = async () => {
  try {
    await mongoose.connect(getConnectionString());
    console.log('MongoDB connected successfully✅');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = connectDB;
