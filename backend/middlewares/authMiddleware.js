import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import ErrorHandler from "./errorMiddlewares.js";

// FOR AUTHENTICATION
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    // Token missing → user is already logged out
    return res.status(200).json({
      success: true,
      message: "There is no user",
    });
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);

  next();
});

// FOR AUTHORIZATION
export const isAuthorized = (...roles)=>{
  return(req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return next(new ErrorHandler(`${req.user.role} cannot access this resource`, 400))
    }

    // either allow the user to go next
    next();
  }
}