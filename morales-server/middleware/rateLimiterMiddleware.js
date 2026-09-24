const rateLimit = require("express-rate-limit");

const MINUTE = 60 * 1000;
const LOGIN_ATTEMPT_TTL = 24 * 60 * MINUTE;
const LOGIN_PENALTIES = [
  { attempts: 10, durationMs: 30 * MINUTE },
  { attempts: 8, durationMs: 5 * MINUTE },
  { attempts: 5, durationMs: 3 * MINUTE },
];

const getLoginKey = (req) => {
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase()
    : "missing-email";
  return `${req.ip}|${email}`;
};

const getPenalty = (attempts) =>
  LOGIN_PENALTIES.find((penalty) => attempts >= penalty.attempts);

const createProgressiveLoginLimiter = ({ now = Date.now } = {}) => {
  const loginAttempts = new Map();

  return (req, res, next) => {
    const key = getLoginKey(req);
    const currentTime = now();
    let record = loginAttempts.get(key);

    if (
      record
      && currentTime >= record.blockedUntil
      && currentTime - record.lastAttempt >= LOGIN_ATTEMPT_TTL
    ) {
      loginAttempts.delete(key);
      record = undefined;
    }

    if (record?.blockedUntil > currentTime) {
      const retryAfterSeconds = Math.ceil((record.blockedUntil - currentTime) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message: `Too many failed login attempts. Please try again in ${retryAfterSeconds} seconds.`,
        failedAttempts: record.attempts,
        retryAfterSeconds,
      });
    }

    res.once("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        loginAttempts.delete(key);
        return;
      }

      // Login validation failures (400) and incorrect credentials (401) count.
      if (res.statusCode !== 400 && res.statusCode !== 401) return;

      const failedAt = now();
      const latestRecord = loginAttempts.get(key) || { attempts: 0, blockedUntil: 0 };
      const attempts = latestRecord.attempts + 1;
      const penalty = getPenalty(attempts);
      loginAttempts.set(key, {
        attempts,
        blockedUntil: penalty ? failedAt + penalty.durationMs : 0,
        lastAttempt: failedAt,
      });
    });

    return next();
  };
};

const apiLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many API requests. Please try again later." },
});

const loginLimiter = createProgressiveLoginLimiter();

const registerLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Please try again after one hour.",
  },
});

const orderCreationLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  message: { message: "Too many order attempts. Please try again later." },
});

const reviewCreationLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  message: { message: "Too many review attempts. Please try again later." },
});

module.exports = {
  LOGIN_PENALTIES,
  apiLimiter,
  createProgressiveLoginLimiter,
  loginLimiter,
  orderCreationLimiter,
  registerLimiter,
  reviewCreationLimiter,
};
