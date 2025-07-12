const Comment = require('../models/Comment');
const Doubt = require('../models/Doubt');

// Post a comment (mentor)
exports.postComment = async (req, res) => {
  try {
    const { doubtId, content } = req.body;
    if (!doubtId || !content) {
      return res.status(400).json({ message: 'doubtId and content are required' });
    }
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    const comment = new Comment({
      doubtId,
      content,
      createdBy: req.user.userId,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all comments for a doubt
exports.getComments = async (req, res) => {
  try {
    const { doubtId } = req.query;
    if (!doubtId) return res.status(400).json({ message: 'doubtId is required' });
    const comments = await Comment.find({ doubtId }).populate('createdBy', 'name email role').sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 