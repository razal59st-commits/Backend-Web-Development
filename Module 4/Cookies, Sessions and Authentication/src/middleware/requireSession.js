
const AppError = require('../errors/AppError');
const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');
const { COOKIE_NAME } = require('../session/cookieConfig');

const authRequired = () =>
  new AppError(
    401,
    'AUTH_REQUIRED',
    'Authentication required'
  );

async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies[COOKIE_NAME];

    const session = sessionId
      ? sessionStore.get(sessionId)
      : null;

    if (!session) {
      throw authRequired();
    }

    const user = await userRepository.findPublicById(
      session.userId
    );

    if (!user) {
      sessionStore.destroy(sessionId);
      throw authRequired();
    }

    req.sessionId = sessionId;
    req.user = user;

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = requireSession;
