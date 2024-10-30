import express from "express";
import { createPost, createPostWithImages, deletePost, dislikePost, getPosts, getUserPosts, likePost, searchPost, updatePost } from "../controllers/postController.js";
import upload from "../middleware/upload.js"

const router = express.Router();

// CREATE POST
router.post('/create', createPost);

// CREATE POST WITH IMAGES
router.post('/create/images', upload.array('images', 5), createPostWithImages);

// UPDATE POST
router.put('/update/:postId', updatePost);

// GET ALL POSTS
router.get('/all', getPosts);

// GET USER POSTS
router.get('/user', getUserPosts);

// DELETE POST
router.delete('/delete/:postId', deletePost);

// LIKE POST
router.post('/like/:postId', likePost);

// DISLIKE POST
router.post('/dislike/:postId', dislikePost);

// SEARCH POST
router.get('/search/:query', searchPost);


export default router;