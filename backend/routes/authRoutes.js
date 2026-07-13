import express from "express";
import {
  registerController,
  loginController,
  verifyOtpController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify-otp", verifyOtpController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;