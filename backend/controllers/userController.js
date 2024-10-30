import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Post from "../models/Post.js"
import Story from "../models/Story.js"
import Comment from "../models/Comment.js"
import generateFileUrl from "../utils/generateFileUrl.js";

export const getUser = asyncHandler(async (req, res, next) => {
  const {userId} = req.body;
  
  const user = await User.findOne({_id: userId}).select("-password");
  if(!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const updateData = req.body

  const userToUpdate = await User.findById(userId);

  if (!userToUpdate) {
    res.status(404);
    throw new Error('User not found');
  }

  Object.assign(userToUpdate, updateData);

  const updatedUser = await userToUpdate.save()

  if(updatedUser) {
    res.status(200).json({msg: "user updated"})
  }else {
    res.status(400)
    throw new Error('invalid data')
  }
});

export const followUser = asyncHandler(async (req, res, next) => {
  const userToFollowId = req.params.userId;
  const loggedInUserId = req.user.id
  
  const userToFollow = await User.findById(userToFollowId);
  const loggedInUser = await User.findById(loggedInUserId);

  if(!userToFollow) {
    res.status(404);
    throw new Error('User not found')
  }

  if (userToFollowId === loggedInUserId) {
    res.status(500);
    throw new Error('you cannot follow yourself')
  }
  
  if (loggedInUser.following.includes(userToFollowId)) {
    res.status(400);
    throw new Error('Already following this user!')
  }  

  loggedInUser.following.push(userToFollowId);
  userToFollow.followers.push(loggedInUserId);

  await loggedInUser.save();
  await userToFollow.save();

  res.status(200).json({msg: `followed user(${userToFollow.fullName}) sucessfully`})
});

export const unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollowId = req.params.userId;
  const loggedInUserId = req.user.id
  
  const userToUnfollow = await User.findById(userToUnfollowId);
  const loggedInUser = await User.findById(loggedInUserId);

  if(!userToUnfollow) {
    res.status(404);
    throw new Error('User not found')
  }

  if (userToUnfollowId === loggedInUserId) {
    res.status(500);
    throw new Error('you cannot unfollow yourself')
  }
  // paused here, not done
  if (!loggedInUser.following.includes(userToUnfollowId)) {
    res.status(400);
    throw new Error('Not following this user!')
  }  

  loggedInUser.following = loggedInUser.following.filter(id=>id.toString()!==userToUnfollowId);
  userToUnfollow.followers = userToUnfollow.followers.filter(id=>id.toString()!==loggedInUserId)

  await loggedInUser.save();
  await userToUnfollow.save();

  res.status(200).json({msg: `unfollowed user(${userToUnfollow.fullName}) sucessfully`})
}); 

export const blockUser = asyncHandler(async (req, res, next) => {
  const userToBlockId = req.params.userId;
  const loggedInUserId = req.user.id
  
  const userToBlock = await User.findById(userToBlockId);
  const loggedInUser = await User.findById(loggedInUserId);

  if(!userToBlock) {
    res.status(404);
    throw new Error('User not found')
  }

  if (userToBlockId === loggedInUserId) {
    res.status(500);
    throw new Error('you cannot block yourself')
  }
  
  if (loggedInUser.blockList.includes(userToBlockId)) {
    res.status(400);
    throw new Error('This user is already blocked!')
  }  

  loggedInUser.blockList.push(userToBlockId);
  loggedInUser.following = loggedInUser.following.filter(id=>id.toString()!==userToBlockId);
  userToBlock.followers = userToBlock.followers.filter(id=>id.toString()!==loggedInUserId)
  

  await loggedInUser.save();
  await userToBlock.save();

  res.status(200).json({msg: `successfully blocked user(${userToBlock.fullName})`})
});

export const unblockUser = asyncHandler(async (req, res, next) => {
  const userToUnblockId = req.params.userId;
  const loggedInUserId = req.user.id
  
  const userToUnblock = await User.findById(userToUnblockId);
  const loggedInUser = await User.findById(loggedInUserId);

  if(!userToUnblock) {
    res.status(404);
    throw new Error('User not found')
  }

  if (userToUnblockId === loggedInUserId) {
    res.status(500);
    throw new Error('you cannot unblock yourself')
  }
  
  if (!loggedInUser.blockList.includes(userToUnblockId)) {
    res.status(400);
    throw new Error('This user is not blocked!')
  }  

  loggedInUser.blockList = loggedInUser.blockList.filter(id=>id.toString()!==userToUnblockId);
  // loggedInUser.following = loggedInUser.following.filter(id=>id.toString()!==userToBlockId);
  // userToBlock.followers = userToBlock.followers.filter(id=>id.toString()!==loggedInUserId)  

  await loggedInUser.save();
  await userToUnblock.save();

  res.status(200).json({msg: `successfully unblocked user(${userToUnblock.fullName})`})
});

export const getBlockedUsers = asyncHandler(async (req, res, next) => {  
  const loggedInUser =await User.findById(req.user.id).populate("blockList", "username fullName profilePicture");
  if(!loggedInUser) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(loggedInUser.blockList);
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const userToDelete = await User.findById(userId);
  if(!userToDelete) {
    res.status(404);
    throw new Error('User not found');
  }
  // Post
  await Post.deleteMany({user: userId}) //deleting all the user's posts
  await Post.deleteMany({"comments.user" : userId }) //deleting the user's comments from other users' posts--- not needed
  await Post.deleteMany({"comments.replies.user" : userId})//deleting the user's replies to other users' post---- mot needed
  await Post.updateMany({likes: userId}, {$pull: {likes: userId}}) //deleting the user's likes from other users' post (1)
  await Post.updateMany({}, {$pull: {likes: userId}}) //deleting the user's likes from posts  (2) prefering this one
  // User
  await User.updateMany({_id: {$in: userToDelete.following}}, {$pull : {followers : userId}}) //in user array and remove the user from their followers
  // Comment
  await Comment.deleteMany({user: userId}); //deleting all user's comments
  await Comment.updateMany({}, {$pull: {likes: userId}});//deleting the user's likes from other users comments
  await Comment.updateMany({"replies.likes": userId}, {$pull:  {"replies.likes": userId}}) //deleting the user's likes from replies
  // Story
  await Story.deleteMany({user: userId}); //deleting all the user's stories

  // deleting the user's replies(comments) to other users' comment--the code below or -- preferably(chatGpt)-  await Comment.updateMany({ "replies.user": userId }, { $pull: { replies: { user: userId } } });
  const replyComments = await Comment.find({"replies.user": userId})
  await Promise.all(
    replyComments.map(async(comment)=> {
      comment.replies = comment.replies.filter(reply=>reply.user.toString()!==userId)
      await Comment.save()
    })
  )
  await userToDelete.deleteOne();
  res.status(200).json({message: `the user(${userToDelete.fullName}) with it's associations have been deleted`})

});

export const searchUser = asyncHandler(async (req, res, next) => {
  const {query} = req.params;

  const users = await User.find({$or: [
    {username: {$regex: new RegExp(query, 'i')}},
    {fullName: {$regex: new RegExp(query, 'i')}}
  ]})

  res.status(200).json(users)
})

export const uploadProfilePicture = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  let fileUrl = "";
  if(req.file) fileUrl = generateFileUrl(req.file.filename);

  const user = await User.findById(userId);
  // console.log(fileUrl);
    if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  // const oldProfilePicture = user.profilePicture;

  user.profilePicture = fileUrl;

  // console.log(oldProfilePicture, user.profilePicture)
  await user.save();
  res.status(200).json({message: "successfully updated profile picture", user});
});

export const uploadCoverPicture = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  let fileUrl = "";
  if(req.file) fileUrl = generateFileUrl(req.file.filename)

  const user = await User.findById(userId);
  // console.log(fileUrl);
    if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  // const oldcoverPicture = user.coverPicture;

  user.coverPicture = fileUrl;

  // console.log(oldProfilePicture, user.profilePicture)
  await user.save();
  res.status(200).json({message: "successfully updated cover picture", user});
});
