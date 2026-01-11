import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModels.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Validate input
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // 2. Check if a verified user already exists
  const isRegistered = await User.findOne({ email, accountVerified: true });
  if (isRegistered) {
    return next(new ErrorHandler("User already exists.", 409));
  }

  // 3. Check if there are too many unverified registration attempts
  const registrationAttempts = await User.find({ email, accountVerified: false });
  if (registrationAttempts.length >= 5) {
    return next(
      new ErrorHandler(
        "Too many registration attempts. Please try again later.",
        400
      )
    );
  }

  // 4. Validate password length
  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters", 400)
    );
  }

  try {
    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 7. Generate email verification code
    const verificationCode = user.generateEmailVerificationCode();
    await user.save();

    // 8. Send verification code
    await sendVerificationCode(verificationCode, email, res);
  } catch (error) {
    console.error("Register error:", error);
    return next(new ErrorHandler("Internal server error.", 500));
  }
});


export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  // 1. Validate input
  if (!email || !otp) {
    return next(new ErrorHandler("Email or OTP is missing.", 400));
  }

  try {
    // 2. Check if a verified user already exists
    const verifiedUser = await User.findOne({ email, accountVerified: true });
    if (verifiedUser) {
      return next(new ErrorHandler("User already exists.", 409));
    }

    // 3. Find unverified registration attempts, newest first
    const userAllEntries = await User.find({ email, accountVerified: false }).sort({ createdAt: -1 });

    if (!userAllEntries || userAllEntries.length === 0) {
      return next(new ErrorHandler("User not found.", 404));
    }

    // 4. Select latest attempt and delete older ones if more than one
    let user;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = userAllEntries[0];
    }

    // 5. Check OTP match
    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP.", 400));
    }

    // 6. Check if OTP is expired
    const currentTime = Date.now();
    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP expired.", 400));
    }

    // 7. Verify account
    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    // 8. Send token to user
    sendToken(user, 200, "Account Verified.", res);

  } catch (error) {
    console.error("verifyOTP error:", error);
    return next(new ErrorHandler("Internal server error.", 500));
  }
});


export const login = catchAsyncErrors(async (req, res, next) => {
  
})