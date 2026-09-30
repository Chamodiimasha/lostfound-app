const httpError = (status, message) => Object.assign(new Error(message), { status });
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const notFound = (req, res, next) => next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') status = 400;
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 11000) { status = 409; message = 'Duplicate value'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
module.exports = { httpError, asyncHandler, notFound, errorHandler };
