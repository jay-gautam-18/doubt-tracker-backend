const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/:doubtId', authMiddleware, chatController.getChatHistory);

module.exports = router; 