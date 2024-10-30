import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import {customError} from "../middleware/error.js";

export const createComment = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {postId} = req.params;
  const {text} = req.body;
  
  if(!text) {
    res.status(400);
    throw new Error('no text input')
  }
  const post = await Post.findById(postId);
  if(!post) {
    res.status(404);
    throw new Error('Post not found')
  } 
  const newComment = await Comment.create({
    user: loggedInUserId,
    post: postId,
    text
  });

  post.comments.push(newComment.id);
  await post.save();
  
  res.status(201).json({message: "Comment added to the Post", newComment})
});

export const createCommentReply = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {commentId} = req.params
  const {text} = req.body;
  if(!text) {
    res.status(400);
    throw new Error('no text input')
  }

  const comment = await Comment.findById(commentId);

  if(!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  const reply = {
    user: loggedInUserId,
    text
  }

  comment.replies.push(reply);
  comment.save();

  res.status(201).json({message: "Reply created successfully", reply})
});

export const updateComment = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user.id;
  const {commentId} = req.params;
  const {text} = req.body;
  if(!text) {
    res.status(400);
    throw new Error('no text input')
  }

  const commentToUpdate = await Comment.findById(commentId);

  if(!commentToUpdate) {
    res.status(404);
    throw new Error('Comment not found')
  }

  if(commentToUpdate.user.toString()!==loggedInUserId) {
    res.status(401);
    throw new Error('you can\'t edit someone else comment');
  }

  commentToUpdate.text = text;
  await commentToUpdate.save()

  res.status(200).json({message: "successfully updated the comment", commentToUpdate});

});

export const updateCommentReply = asyncHandler(async (req, res, next) => {
  const loggedInUserId =  req.user.id;
  const {commentId, replyId} = req.params;
  const {text} = req.body;

  const comment = await Comment.findById(commentId);
  if(!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  
  const replyIndex = comment.replies.findIndex(reply=>reply.id.toString()===replyId);

  if(replyIndex===-1) {
    res.status(404);
    throw new Error('reply not found')
  }

  // console.log(comment.replies[replyIndex].user.toString(), loggedInUserId)
  if(comment.replies[replyIndex].user.toString() !== loggedInUserId) {
    res.status(401);
    throw new Error('you can\'t edit someone else reply')
  }

  comment.replies[replyIndex].text = text;

  await comment.save();

  res.status(200).json({message: "reply updated successfully", comment})
});

export const getPostComments = asyncHandler(async (req, res, next) => {
  const {postId} = req.params;
  
  const post = await Post.findById(postId);
  if(!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const postComments = await Comment.find({post: postId}).populate("user replies.user", "username fullName profilePicture");

  res.status(200).json({postComments})
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const {commentId} = req.params;
  const loggedInUserId = req.user.id;

  const commentToDelete = await Comment.findById(commentId);
  if (!commentToDelete) {
    res.status(404);
    throw new Error('Comment not found')
  }
  
  const postId = commentToDelete.post;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found')
  }
  // only the post or comment user is authorized to delete the comment
  if(loggedInUserId!==commentToDelete.user.toString() && loggedInUserId!==post.user.toString()) {
    res.status(401);
    throw new Error('not authorized to delete this comment')
  }
  
  post.comments = post.comments.filter(comId=>comId.toString()!==commentId)

  await post.save();
  await commentToDelete.deleteOne();

  res.status(200).json({message: "successfully deleted the comment"})
});

export const deleteCommentReply = asyncHandler(async (req, res, next) => {
  const {commentId, replyId} = req.params;
  const loggedInUserId = req.user.id;

  const comment = await Comment.findById(commentId);
  if(!comment) {
    customError(res, "Comment not found", 404);
  }
  
  const replyIndex = comment.replies.findIndex(reply=>reply._id.toString()===replyId);
  if(replyIndex===-1) customError(res, "Reply not found!", 404)
  
  const reply = comment.replies[replyIndex];


  const post = await Post.findById(comment.post);
    
  if(loggedInUserId!==reply.user.toString() && loggedInUserId!== post.user.toString()) customError(res, "Not authorized to delete this reply", 401)
    
  comment.replies = comment.replies.filter(reply=>reply.id.toString()!==replyId)
  

  await comment.save()
  res.status(200).json({message: "reply successfully deleted", comment})
});

export const likeComment = asyncHandler(async (req, res, next) => {
  const {commentId} = req.params;
  const loggedInUserId = req.user.id;

  const comment = await Comment.findById(commentId);
  if(!comment) customError(res, "Comment not found", 404);

  if(comment.likes.includes(loggedInUserId)) customError(res, "already liked this comment", 400)
  
  comment.likes.push(loggedInUserId);

  await comment.save();

  res.status(200).json({message: "successfully liked comment"})
});

export const dislikeComment = asyncHandler(async (req, res, next )=> {
  const {commentId} = req.params;
  const loggedInUserId = req.user.id;

  const comment = await Comment.findById(commentId);
  if(!comment) customError(res, "Comment not found", 404);

  if(!comment.likes.includes(loggedInUserId)) customError(res, "Comment wasn't liked")

  comment.likes = comment.likes.filter(userId=>userId.toString()!==loggedInUserId);

  await comment.save();

  res.status(200).json({message: "successfully disliked comment"})
});

export const likeCommentReply = asyncHandler(async (req, res, next) => {
  const {commentId, replyId} = req.params;
  const loggedInUserId = req.user.id;

  const comment = await Comment.findById(commentId);
  if(!comment) customError(res, "Comment not found", 404);

  const reply = comment.replies.id(replyId);
  if(!reply) customError(res, "Reply not found", 404)

  if(reply.likes.includes(loggedInUserId)) customError(res, "already liked this reply", 400);

  reply.likes.push(loggedInUserId);

  await comment.save();

  res.status(200).json({message: "successfully liked this reply"})
});

export const dislikeCommentReply = asyncHandler(async (req, res, next) => {
  const {commentId, replyId} = req.params;
  const loggedInUserId =req.user.id;

  const comment = await Comment.findById(commentId);
  if(!comment) customError(res, "Comment not found", 404);

  const reply = comment.replies.id(replyId);
  if(!reply) customError(res, "Reply not found!", 404);

  if (!reply.likes.includes(loggedInUserId)) customError(res, "reply wasn't liked!", 400)
  
  reply.likes = reply.likes.filter(userId=>userId.toString()!==loggedInUserId);

  await comment.save();

  res.status(200).json({message: "successfully disliked the reply"})
});
