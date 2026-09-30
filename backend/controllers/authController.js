const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError, asyncHandler } = require('../middleware/error');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email });
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) throw httpError(400, 'Name must be at least 2 characters');
  if (!email || !emailRe.test(email)) throw httpError(400, 'Valid email is required');
  if (!password || password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'Email already registered');
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw httpError(401, 'Invalid email or password');
  res.json({ token: sign(user), user: publicUser(user) });
});

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
