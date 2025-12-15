const mongoose = require('mongoose');
const { mongoURI, mongoUser, mongoPassword } = require('./config');

const getConnectionString = () => {
  if (!mongoURI || !mongoUser || !mongoPassword) {
    throw new Error('MongoDB configuration variables are not set properly.');
  }
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

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully✅');
  } catch (err) {
    console.error('MongoDB disconnection error:', err);
    throw err;
  }
};

module.exports = { connectDB, disconnectDB };
