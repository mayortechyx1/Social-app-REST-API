import Story from "../models/Story.js";
import asyncHandler from "express-async-handler";
import { customError } from "../middleware/error.js";
import generateFileUrl from "../utils/generateFileUrl.js"
import User from "../models/User.js";
import { urlencoded } from "express";


export const createStory = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {text} = req.body;
  let image = "";

  if(!text) customError(res, "no text input", 404);

  if(req.file) image = generateFileUrl(req.file.filename);

  const newStory = await Story.create({
    user: loggedInUserId,
    text,
    image
  });

  res.status(201).json({message: "Story created successfully", newStory})
});

export const getStories = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const loggedInUser = await User.findById(loggedInUserId);

  const userFollowing = loggedInUser.following;

  const stories = await Story.find({user: {$in: userFollowing}}).populate("user", "username fullName profilePicture");
  if (!stories) customError(res, "No stories at the moment", 404);

  res.status(200).json({stories})
});

export const getUserStories = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;

  const userStories = await Story.find({user: loggedInUserId}).populate("user", "username fullName profilePicture");

  if(!userStories) customError(res, "you don't have any story", 404);

  res.status(200).json({userStories});

});

export const deleteStory = asyncHandler(async (req, res, next) => {
  const {storyId} = req.params;

  const story = await Story.findById(storyId);
  if (!story) customError(res, "Story not found!", 404);

  await story.deleteOne();
  res.status(200).json({message: "successfully deleted the story"});
});

export const deleteStories = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;

  await Story.deleteMany({user: loggedInUserId});
  
  res.status(200).json({message: "successfully deleted your stories"})
});