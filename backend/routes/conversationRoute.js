import express from 'express';
import { createNewConversation, deleteConversation, getTwoUsersConversation, getUserConversations } from '../controllers/conversationController.js';

const router  = express.Router();

// CREAT A NEW CONVERSATION
router.post('/create/', createNewConversation);

// GET CONVERSATIONS OF USER - GET ALL CHATS OF THE USER
router.get('/', getUserConversations);

// GET TWO USERS CONVERSATION - GET A PARTCULAR CHAT OR CONVERSATION
router.get('/:secondUserId/', getTwoUsersConversation);

// DELETE CONVERSATION
router.delete('/delete/:conversationId/', deleteConversation);

export default router;