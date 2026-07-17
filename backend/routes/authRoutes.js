import express from "express";
import {
  registerController,
  loginController,
  verifyOtpController,
  resendOtpController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController.js";

import otpRateLimiter from "../middleware/otpRateLimiter.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

router.post("/verify-otp", verifyOtpController);

// ✅ Resend OTP - Only 3 requests in 5 minutes
router.post(
  "/resend-otp",
  otpRateLimiter,
  resendOtpController
);

router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;