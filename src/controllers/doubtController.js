const Doubt = require('../models/Doubt');
const ChatMessage = require('../models/ChatMessage');

// Create a new doubt (student)
exports.createDoubt = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const doubt = new Doubt({
      title,
      description,
      user: req.user.userId,
    });
    await doubt.save();
    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all doubts (mentor: all, student: own) with pagination and filter
exports.getDoubts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = req.user.role === 'student' ? { user: req.user.userId } : {};
    if (status && status !== 'all') filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doubt.countDocuments(filter);
    const doubts = await Doubt.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({
      doubts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single doubt by ID
exports.getDoubtById = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id).populate('user', 'name email role');
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a doubt (student only, own doubt)
exports.updateDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    if (doubt.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description } = req.body;
    if (title) doubt.title = title;
    if (description) doubt.description = description;
    await doubt.save();
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a doubt (student only, own doubt)
exports.deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    if (doubt.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Delete all chat messages related to this doubt
    await ChatMessage.deleteMany({ doubtId: doubt._id });
    await Doubt.deleteOne({ _id: doubt._id });
    // Emit websocket event for real-time UI update
    const io = req.app.get('io');
    if (io) io.emit('doubt_deleted', { doubtId: req.params.id });
    res.json({ message: 'Doubt and related chats deleted' });
  } catch (error) {
    console.error('Error deleting doubt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark as resolved (student only, own doubt)
exports.markResolved = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    // Allow either the student who posted or any mentor
    if (
      doubt.user.toString() !== req.user.userId &&
      req.user.role !== 'mentor'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    doubt.status = 'resolved';
    await doubt.save();
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 