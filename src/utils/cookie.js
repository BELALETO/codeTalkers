const { generateToken } = require('./jwt');

const sendCookie = async (res, user) => {
  const token = await generateToken({ id: user._id });

  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return token;
};

const clearCookie = (res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
};

module.exports = { sendCookie, clearCookie };
