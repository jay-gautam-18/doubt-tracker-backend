const ChatMessage = require('../models/ChatMessage');

exports.saveMessage = async ({ doubtId, sender, content }) => {
  const message = new ChatMessage({ doubtId, sender, content });
  await message.save();
  return message;
};

exports.getMessages = async (doubtId) => {
  return ChatMessage.find({ doubtId }).populate('sender', 'name role').sort({ createdAt: 1 });
}; 