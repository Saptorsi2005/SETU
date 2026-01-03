// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL specific errors
  if (err.code === '23505') {
    // Unique violation
    statusCode = 400;
    message = 'A record with this information already exists.';
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Referenced record does not exist.';
  } else if (err.code === '22P02') {
    // Invalid text representation
    statusCode = 400;
    message = 'Invalid data format.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found handler
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
