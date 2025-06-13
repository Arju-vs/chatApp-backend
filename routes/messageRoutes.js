import express from 'express';
import { getFilteredUsers, getMessages, markMsgesAsSeen, sendMessage } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const messageRouter = express.Router()
messageRouter.get('/users', protectRoute, getFilteredUsers);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMsgesAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage)

export default messageRouter