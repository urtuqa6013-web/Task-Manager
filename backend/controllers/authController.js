import User from "../models/userModels.js"
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import sendEmail from "../utils/sendEmail.js";


export const registerController = async (req, res) => {
  try {

    console.log("✅ Register API called");
    const { name, email, password } = req.body;
    //validation
    if (!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      })
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    //hased password

    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });

    console.log("Sending OTP to:", email);
    console.log("OTP:", otp);

    await sendEmail(
      email,
      "Verify Your Email - Task Manager",
      `
    <h2>Welcome to Task Manager</h2>
    <p>Hello <b>${name}</b>,</p>
    <h1>${otp}</h1>
  `
    );

    //  JWT code HERE
   const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);


    // Response
    res.status(201).send({
      success: true,
      message: "Registration successful. Please check your email for the verification code",
      email: user.email,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Validation
    if (!email || !otp || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check OTP
    if (user.otp !== String(otp).trim()) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (user.otpExpire < Date.now()) {
      return res.status(400).send({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Clear OTP
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};



export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save OTP and expiry
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      "Reset Your Password",
      `
      <h2>Password Reset Request</h2>
      <p>Hello <b>${user.name}</b>,</p>
      <p>Your password reset OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.status(200).send({
      success: true,
      message: "Password reset OTP sent successfully.",
    });

  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).send({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save OTP and expiry
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Send OTP
    await sendEmail(
      email,
      "Verify Your Email - Task Manager",
      `
      <h2>Email Verification</h2>
      <p>Hello <b>${user.name}</b>,</p>
      <p>Your new verification OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.status(200).send({
      success: true,
      message: "Verification OTP resent successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    console.log("DB OTP:", user.otp);
    console.log("INPUT OTP:", otp);
    console.log("TYPE DB:", typeof user.otp);
    console.log("TYPE INPUT:", typeof otp);

    if (!user.otp) {
      return res.status(400).send({
        message: "OTP not found. Please register again."
      });
    }

    if (user.otp !== String(otp).trim()) {
      return res.status(400).send({ message: "Invalid OTP" });
    }
    if (user.otpExpire < Date.now()) {
      return res.status(400).send({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.send({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//login user

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }


    if (!user.isVerified) {
      return res.status(401).send({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate token
  const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

    res.status(200).send({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("JWT ERROR:", error);

    return res.status(401).send({
      success: false,
      message: error.message,
    });
  }
};