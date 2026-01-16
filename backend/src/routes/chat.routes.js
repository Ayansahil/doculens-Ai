import express from 'express';
import { sendChatMessage, getChatHistory } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', sendChatMessage);
router.get('/history', getChatHistory);

export default router;
