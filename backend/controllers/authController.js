import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";

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
  const registrationAttempts = await User.find({
    email,
    accountVerified: false,
  });
  if (registrationAttempts.length >= 5) {
    return next(
      new ErrorHandler(
        "Too many registration attempts. Please try again later.",
        400,
      ),
    );
  }

  // 4. Validate password length
  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters", 400),
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
    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });

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
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire,
    ).getTime();
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
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }
  // .select is used to get the password of the user. because in the userModel.js we have written select: false
  const user = await User.findOne({ email, accountVerified: true }).select(
    "password",
  );
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password"));
  }
  sendToken(user, 200, "User logged in successfully", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler("Email is required", 400));
  }
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("Invalid email.", 400));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({
    validateBeforSave: false,
  });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = generateForgetPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Bookworm Library Managment System Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        400,
      ),
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm password do not match", 400),
    );
  }
  if (
    req.body.password.length < 8 ||
    req.body.password.length > 16 ||
    req.body.confirmPassword.length < 8 ||
    req.body.confirmPassword.length > 16
  ) {
    return next(
      new ErrorHandler("Password and Confirm password must be between 8 and 16 characters", 400),
    );
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, "Password reset successfull", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next)=> {
  const user = await User.findById(req.user._id).select("password");
  const {currentPassword, newPassword, confirmNewPassword} = req.body;
  if(!currentPassword || !newPassword || !confirmNewPassword){
    return next(new ErrorHandler("please enter all the fields.", 400))
  }
  const isPasswordMatched = await bcrypt.compare(currentPassword, user.password)
  if(!isPasswordMatched){
    return next(new ErrorHandler("Current password is incorrect.", 400))
  }
  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    confirmNewPassword.length < 8 ||
    confirmNewPassword.length > 16
  ){
    return next(new ErrorHandler("Password must be between 8 and 16 characters", 400))
  }
  if(newPassword !== confirmNewPassword){
    return next(new ErrorHandler("New password and Confirm new password do not match", 400))
  }
  // if the current password is same as the password saved in the database then the user is allowed to fill the newPassword and confirmNewPassword fields and then if the newPassword and confirmNewPassword match, the password would be updated to the UPDATED PASSWORD.
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Updated"
  })
});