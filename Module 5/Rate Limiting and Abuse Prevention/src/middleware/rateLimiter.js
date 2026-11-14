'use strict';
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : 15 * 60;

    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

// For multiple instances behind a load balancer, rate-limit-redis can replace
// the default in-memory store with a shared Redis store. In-memory counters are
// local to each process, so each instance would otherwise enforce a separate
// limit and requests could evade the intended cap by landing on different instances.
