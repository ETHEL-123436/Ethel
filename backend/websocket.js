const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users and their socket IDs
const connectedUsers = new Map();
const userSockets = new Map(); // userId -> socketId mapping
const socketUsers = new Map(); // socketId -> userId mapping

// Authentication middleware for Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.id;
    socket.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected with socket ${socket.id}`);

  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    role: socket.userRole,
    connectedAt: new Date()
  });

  userSockets.set(socket.userId, socket.id);
  socketUsers.set(socket.id, socket.userId);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining a conversation thread
  socket.on('join-thread', (threadId) => {
    socket.join(`thread_${threadId}`);
    console.log(`User ${socket.userId} joined thread ${threadId}`);
  });

  // Handle leaving a conversation thread
  socket.on('leave-thread', (threadId) => {
    socket.leave(`thread_${threadId}`);
    console.log(`User ${socket.userId} left thread ${threadId}`);
  });

  // Handle sending messages
  socket.on('send-message', async (messageData) => {
    try {
      console.log('Message received:', messageData);

      const { threadId, content, type = 'text', metadata } = messageData;

      // Create message object
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threadId,
        senderId: socket.userId,
        content,
        type,
        metadata,
        timestamp: new Date(),
        status: 'sent'
      };

      // Store message in database (you would implement this)
      // await saveMessageToDatabase(message);

      // Broadcast message to all users in the thread
      socket.to(`thread_${threadId}`).emit('message-received', message);

      // Send confirmation back to sender
      socket.emit('message-sent', {
        ...message,
        status: 'delivered'
      });

      console.log(`Message sent in thread ${threadId} by user ${socket.userId}`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', {
        error: 'Failed to send message',
        originalMessage: messageData
      });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (threadId) => {
    socket.to(`thread_${threadId}`).emit('user-typing', {
      userId: socket.userId,
      threadId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (threadId) => {
    socket.to(`thread_${threadId}`).emit('user-typing', {
      userId: socket.userId,
      threadId,
      isTyping: false
    });
  });

  // Handle message read receipts
  socket.on('mark-read', ({ threadId, messageIds }) => {
    socket.to(`thread_${threadId}`).emit('messages-read', {
      userId: socket.userId,
      threadId,
      messageIds,
      readAt: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);

    // Remove from connected users
    connectedUsers.delete(socket.userId);
    userSockets.delete(socket.userId);
    socketUsers.delete(socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.userId}:`, error);
  });
});

// API endpoints for messaging
app.post('/api/messages/send', async (req, res) => {
  try {
    const { threadId, content, type = 'text', metadata } = req.body;
    const userId = req.user?.id; // Assuming you have user middleware

    if (!userId || !threadId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      threadId,
      senderId: userId,
      content,
      type,
      metadata,
      timestamp: new Date(),
      status: 'sent'
    };

    // Broadcast to all users in the thread via Socket.IO
    io.to(`thread_${threadId}`).emit('message-received', message);

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message via API:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get connected users (for debugging)
app.get('/api/messaging/connected-users', (req, res) => {
  const users = Array.from(connectedUsers.values()).map(user => ({
    userId: user.userId,
    role: user.role,
    connectedAt: user.connectedAt
  }));

  res.json({ connectedUsers: users });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size
  });
});

// Only start server if this file is run directly (not imported as module)
if (require.main === module) {
  const PORT = process.env.WEBSOCKET_PORT || 5001;

  server.listen(PORT, () => {
    console.log(`Standalone WebSocket server running on port ${PORT}`);
    console.log(`Socket.IO server ready for connections`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });
}

module.exports = { app, server, io };
