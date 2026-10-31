const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const authorization = req.headers.authorization ?? '';
  const match = typeof authorization === 'string'
    ? /^Bearer\s+(\S+)$/.exec(authorization)
    : null;
  const token = match ? match[1] : null;

  if (!token) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return next();
  } catch {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }
};
