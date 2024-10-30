import asyncHandler from "express-async-handler"
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {customError} from "../middleware/error.js"

export const protect = asyncHandler(async(req, res, next)=> {
  const token = req.cookies.jwt;
  if (!token) customError(res, "Not authenticated, No token!", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next()      
  }catch (error) {
    console.log(error);
    customError(res, "User not authorized, Invalid token", 401);
  }
  });