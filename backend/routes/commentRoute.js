import express from 'express';
import { createComment, createCommentReply, deleteComment, deleteCommentReply, dislikeComment, dislikeCommentReply, getPostComments, likeComment, likeCommentReply, updateComment, updateCommentReply } from '../controllers/commentController.js';

const router = express.Router();

// CREATE COMMENT 
router.post('/create/:postId', createComment);

// CREATE COMMENT REPLY
router.post('/reply/:commentId', createCommentReply);

// UPDATE COMMENT
router.put('/update/:commentId', updateComment);

// UPDATE COMMENT REPLY
router.put("/update/:commentId/replies/:replyId", updateCommentReply);

// GET COMMENTS UNDER A POST
router.get('/post/:postId', getPostComments);

// DELETE COMMENT
router.delete('/delete/:commentId', deleteComment)

// DELETE COMMENT REPLY
router.delete('/delete/:commentId/replies/:replyId', deleteCommentReply);

// LIKE A COMMENT
router.post('/like/:commentId/', likeComment);

// DISLIKE A COMMENT
router.post('/dislike/:commentId/', dislikeComment);

// LIKE A COMMENT REPLY
router.post('/:commentId/replies/like/:replyId', likeCommentReply)

// DISLIKE A COMMENT REPLY
router.post('/:commentId/replies/dislike/:replyId', dislikeCommentReply);

export default router;