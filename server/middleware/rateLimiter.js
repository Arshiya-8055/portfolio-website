/**
 * Rate Limiting Middleware
 * Uses express-rate-limit when installed, or built-in in-memory token bucket fallback.
 */
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  rateLimit = null;
}

// In-memory tracker fallback
const ipMap = new Map();

const memoryRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 60;
  const message = options.message || { status: 'error', message: 'Too many requests, please slow down.' };

  return (req, res, next) => {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    const now = Date.now();

    if (!ipMap.has(ip)) {
      ipMap.set(ip, []);
    }

    const timestamps = ipMap.get(ip).filter(t => now - t < windowMs);
    if (timestamps.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json(message);
    }

    timestamps.push(now);
    ipMap.set(ip, timestamps);
    next();
  };
};

let generalLimiter;
let contactLimiter;

if (rateLimit) {
  generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests/minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests from this IP. Please slow down.' }
  });

  contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 messages per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many contact messages submitted. Please wait 10 minutes before retrying.' }
  });
} else {
  generalLimiter = memoryRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: { status: 'error', message: 'Too many requests from this IP. Please slow down.' }
  });

  contactLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Too many contact messages submitted. Please wait 10 minutes before retrying.' }
  });
}

module.exports = { generalLimiter, contactLimiter };
