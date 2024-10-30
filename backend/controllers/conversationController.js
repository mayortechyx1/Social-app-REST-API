import asyncHandler from "express-async-handler";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js"
import {customError} from "../middleware/error.js";
import User from "../models/User.js";

export const createNewConversation = asyncHandler(async (req, res, next) => {
  const {secondUserId} = req.body;
  const firstUserId = req.user.id;

  if(!secondUserId) customError(res, "Second User Required!", 400);

  if(firstUserId === secondUserId) customError(res, "first and second User can't be the same", 400)
  
  const secondUser = await User.findById(secondUserId);
  if (!secondUser) customError(res, "Second User not found", 404)

  const conversations = await Conversation.find({participants : {$in: [firstUserId]}}); 

  const conversation = conversations.find(conv=>conv.participants.includes(secondUserId));
  // console.log(conversation)
  if(conversation) customError(res, "this conversation exists already", 400);

  const newConversation = await Conversation.create({
    participants: [firstUserId, secondUserId]
  });

  res.status(201).json({newConversation});  
});

export const getUserConversations = asyncHandler(async (req, res, next) => {
  const firstUserId = req.user.id;

  const conversations = await Conversation.find({participants : {$in: [firstUserId]}}); 

  res.status(200).json({conversations})
});

export const getTwoUsersConversation = asyncHandler(async (req, res, next) => {
  const {secondUserId} = req.params;
  const firstUserId = req.user.id;

  const conversation = await Conversation.findOne({participants: [firstUserId, secondUserId]})

  res.status(200).json({conversation});

});

export const deleteConversation = asyncHandler(async (req, res, next) => {
  const {conversationId} = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) customError(res, "Conversation not found", 404);

  await conversation.deleteOne();
  await Message.deleteMany({conversation: conversationId});
  res.status(200).json({message: "Conversation deleted successfully"});
});
