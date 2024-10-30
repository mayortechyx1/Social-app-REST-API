import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import loginStatus from "../utils/loginStatus.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async(req, res, next)=> {
  const {username, email, password, fullName, bio} = req.body;

  if(!username || !email || !password || !fullName || !bio) {
    res.status(400);
    throw new Error("please enter all the fields")
  }
  // check if the user exists
  const userExists = await User.findOne({ 
    $or: [
      {email}, 
      {username}
    ] 
  });
  if (userExists) {
    res.status(400);
    throw new Error("username or email already exists")
  }

  const newUser = await User.create({username, email, password, fullName, bio});

  if (newUser) {
    generateToken(res, newUser.id)
    res.status(200).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName
    })
  }else {
    res.status(400);
    throw new Error("Invalid user details");
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

export const loginUser = asyncHandler(async(req, res, next)=> {
  const {email, username, password} = req.body;
  let userExists;
  if (email) {
    userExists =  await User.findOne({email});
  }else {
    userExists = await User.findOne({username});
  }

  if (userExists && password && await userExists.isPasswordCorrect(password)){
    loginStatus(req, res, userExists.id);
    generateToken(res, userExists.id)
    res.status(200).json({msg: "user logged in", user: userExists})
  } else {
    res.status(401);
    throw new Error("invalid email or password")
  }
})

// @desc    log out user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async(req, res, next)=>{
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none"
  }).status(200).json({message: "User logged out"})
});

// @desc    refetch current user
// @route   POST /api/auth/refetch
// @access  Private
export const refetchUser = asyncHandler(async(req, res, next)=> {
  const user = await User.findById(req.user.id);
  res.status(200).json(user)
});

