import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";
import { customError } from "../middleware/error.js";
import Conversation from "../models/Conversation.js";

export const createMessage = asyncHandler(async (req, res, next) => {
  const {text, conversationId} = req.body;
  const sender = req.user.id;

  if(!text || !conversationId) customError(res, "Please enter all fields", 400);

  const conv = await Conversation.findById(conversationId);
  if(!conv) customError(res, "Conversation not found", 404);

  if(conv.participants[0].toString() !== sender) customError(res, "Not your conversation", 400);

  const newMessage = await Message.create({
    conversation: conversationId,
    sender,
    text
  });

  res.status(201).json({newMessage});
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const {conversationId} = req.params;
  
  const conv = await Conversation.findById(conversationId);
  if(!conv) customError(res, "Conversation not found", 404);
  if(conv.participants[0].toString() !== req.user.id) customError(res, "Not your conversation", 400);

  const messages = await Message.find({conversation: conversationId});

  res.status(200).json({numOfMsgs: `${messages.length} messages`, messages});
});

export const updateMessage = asyncHandler(async (req, res, next) => {
  const {messageId} = req.params;
  const {text} = req.body;
  if(!text) customError(res, "no text input", 400);
  
  const message = await Message.findById(messageId);
  if(!message) customError(res, "message not found", 404);

  const conv = await Conversation.findById(message.conversation);
  if(!conv) customError(res, "Conversation not found", 404);

  if(conv.participants[0].toString() !==req.user.id) customError(res, "Not your Conversation", 400);
  
  message.text = text;
  await message.save();

  res.status(200).json({message})
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  const {messageId} = req.params;

  const message = await Message.findById(messageId);
  if(!message) customError(res, "message not found", 404);

  const conv = await Conversation.findById(message.conversation);
  if(!conv) customError(res, "Conversation not found", 404);
  if(conv.participants[0].toString() !==req.user.id) customError(res, "Not your Conversation", 400);

  await message.deleteOne();

  res.status(200).json({msg: "successfully deleted the message"})  
});