import Post from "../models/Post.js";
import User from "../models/User.js"
import asyncHandler from "express-async-handler";
import generateFileUrl from "../utils/generateFileUrl.js"

export const createPost = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {caption} = req.body;

  const loggedInUser = await User.findById(loggedInUserId)

  const newPost = await Post.create({
    user: loggedInUserId,
    caption
  });

  loggedInUser.posts.push(newPost.id)
  await loggedInUser.save();

  res.status(201).json({message: "Post created successfully", post: newPost})
}); 

export const createPostWithImages = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {caption} = req.body;
  const files = req.files
  

  const loggedInUser = await User.findById(loggedInUserId);
  const imageUrls = files.map(file=>generateFileUrl(file.filename))

  const newPost = await Post.create({
    user: loggedInUserId,
    caption,
    image: imageUrls
  })
  
  loggedInUser.posts.push(newPost.id);
  await loggedInUser.save();
  res.status(201).json({message: "post with images created successfully", post: newPost})

});

export const updatePost = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {caption} = req.body;
  const {postId} = req.params;
  
  const loggedInUser = await User.findById(loggedInUserId);

  if(!loggedInUser.posts.includes(postId)) {
    res.status(401)
    throw new Error("Post not found, either the post does not exist or you didnt post this")
  }

  const postToUpdate = await Post.findById(postId)
  postToUpdate.caption = caption || postToUpdate.caption;
  await postToUpdate.save();

  res.status(200).json({message: "post updated successfully", post: postToUpdate})
});

export const getPosts = asyncHandler(async (req, res, next) => {
  const loggedInUser = await User.findById(req.user.id);

  const blockedUsersIds = loggedInUser.blockList.map(id=>id.toString());

  const allPosts = await Post.find({user: {$nin: blockedUsersIds}}).populate("user", "username fullName profilePicture");

  res.status(200).json({message: "all posts", allPosts})
});

export const getUserPosts = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const userPosts = await Post.find({user: loggedInUserId});

  res.status(200).json({userPosts})
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {postId} = req.params;

  const loggedInUser = await User.findById(loggedInUserId);
  if(!loggedInUser.posts.includes(postId)) {
    res.status(401)
    throw new Error("Post not found, either the post does not exist or you didnt post this")
  }

  const postToDelete = await Post.findById(postId);
  if(!postToDelete) {
    res.status(404);
    throw new Error('Post not found');
  }
  loggedInUser.posts = loggedInUser.posts.filter(id=>id.toString()!==postId);
  await loggedInUser.save()
  await postToDelete.deleteOne();

  res.status(200).json({message: "Post deleted successfully"})

});

export const likePost = asyncHandler(async (req, res, next) => {
  const {postId} = req.params;
  const loggedInUserId = req.user.id;

  const postToLike = await Post.findById(postId);
  if(!postToLike) {
    res.status(404);
    throw new Error('Post not found');
  }
  if(postToLike.likes.includes(loggedInUserId)) {
    res.status(400);
    throw new Error('already liked this post')
  }

  postToLike.likes.push(loggedInUserId);
  await postToLike.save();

  res.status(200).json({message: "successfully liked the post", postToLike})
});

export const dislikePost = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {postId} = req.params;
  const postToDislike = await Post.findById(postId);

  if(!postToDislike) {
    res.status(404);
    throw new Error('Post not found')
  }

  if(!postToDislike.likes.includes(loggedInUserId)){
    res.status(400);
    throw new Error('you have not liked the post')
  }

  postToDislike.likes = postToDislike.likes.filter(userId=>userId.toString()!==loggedInUserId);
  await postToDislike.save();

  res.status(200).json({message: "post disliked successfully", postToDislike})
});

export const searchPost = asyncHandler(async (req, res, next) => {
  const {query} = req.params;
  console.log(query)

  const posts = await Post.find({
    $or: [
      {caption: {$regex : new RegExp(query, "i")}}
    ]
  }).populate("user", "username fullName profilePicture");

  res.status(200).json(posts)
});