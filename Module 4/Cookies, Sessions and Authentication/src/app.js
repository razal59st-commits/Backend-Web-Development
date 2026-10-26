
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const AppError = require('./errors/AppError');

const app = express();

if (
  !process.env.COOKIE_SECRET ||
  process.env.COOKIE_SECRET.length < 32
) {
  throw new Error(
    'COOKIE_SECRET must be at least 32 characters'
  );
}

app.use(express.json());

app.use(
  cookieParser(process.env.COOKIE_SECRET)
);

app.use('/auth', authRoutes);

// Keep this as the final middleware.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Log unexpected errors on the server only.
  console.error('Unexpected server error:', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  });
});

module.exports = app;
