import express from "express";
import { createMessage, deleteMessage, getMessages, updateMessage } from "../controllers/messageController.js";

const router = express.Router();

// CREATE A MESSAGE
router.post('/create/', createMessage);

// GET MESSAGES
router.get('/:conversationId', getMessages);

// UPDATE MESSAGE
router.put('/update/:messageId', updateMessage);

// DELETE MESSAGE
router.delete('/delete/:messageId', deleteMessage);


export default router;