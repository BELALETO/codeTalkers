const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');
const { prmosify } = require('util');

const signAsync = prmosify(jwt.sign);
const verifyAsync = prmosify(jwt.verify);

const generateToken = async (payload) => {
  return await signAsync(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

const verifyToken = async (token) => {
  try {
    return await verifyAsync(token, jwtSecret);
  } catch (err) {
    throw new Error(`Invalid token: ${err.message}`);
  }
};

module.exports = {
  generateToken,
  verifyToken
};
