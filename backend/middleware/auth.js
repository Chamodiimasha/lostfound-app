const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError, asyncHandler } = require('./error');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw httpError(401, 'Not authenticated');
  let payload;
  try { payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); }
  catch { throw httpError(401, 'Invalid or expired token'); }
  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'User no longer exists');
  req.user = user;
  next();
});
