import express from 'express';
import { createStory, deleteStories, deleteStory, getStories, getUserStories } from '../controllers/storyController.js';
import upload from "../middleware/upload.js"

const router = express.Router();

// CREATE A STORY
router.post('/create/', upload.single("image"), createStory);

// GET ALL STORIES
router.get('/all/', getStories);

// GET USER STORIES
router.get('/user/', getUserStories);

// DELETE A STORY
router.delete('/delete/:storyId/', deleteStory);

// DELETE ALL STORIES
router.delete('/delete-stories/', deleteStories);


export default router;