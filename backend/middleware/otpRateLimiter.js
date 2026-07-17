import rateLimit from "express-rate-limit";

const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes

  max: 3, // Only 3 requests

  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 5 minutes.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export default otpRateLimiter;