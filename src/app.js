const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimiter = require('./middlewares/rateLimiter');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const chatService = require('./services/chatService');
const User = require('./models/User');
const Doubt = require('./models/Doubt');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://doubt-tracker-app.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.set('io', io);

// Socket.IO chat logic
io.on('connection', (socket) => {
  socket.on('join_doubt', (doubtId) => {
    socket.join(doubtId);
  });

  socket.on('chat_message', async ({ doubtId, sender, content }) => {
    // Populate sender info
    const senderUser = await User.findById(sender).select('name role');
    const message = await chatService.saveMessage({ doubtId, sender, content });
    io.to(doubtId).emit('chat_message', {
      _id: message._id,
      doubtId: message.doubtId,
      sender: { _id: senderUser._id, name: senderUser.name, role: senderUser.role },
      content: message.content,
      createdAt: message.createdAt
    });
  });

  // Real-time: broadcast new doubt to all mentors
  socket.on('new_doubt', async (doubtId) => {
    const doubt = await Doubt.findById(doubtId).populate('user', 'name email role');
    io.emit('new_doubt', doubt); // All mentors will filter on frontend
  });

  // Real-time: broadcast status update
  socket.on('doubt_status_update', async ({ doubtId, status }) => {
    const doubt = await Doubt.findById(doubtId).populate('user', 'name email role');
    io.emit('doubt_status_update', { doubtId, status, doubt });
  });
});

// Middleware
app.use(morgan('dev'));
app.use(cors(
  {
  origin: 'https://doubt-tracker-app.vercel.app',
  credentials: true
}
));
app.use(express.json());
app.use(rateLimiter);

// Connect Database
connectDB();

// Placeholder for routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  res.send('DevHelp Doubt Tracker API');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

