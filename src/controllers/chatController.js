const chatService = require('../services/chatService');

exports.getChatHistory = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const messages = await chatService.getMessages(doubtId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
}; 