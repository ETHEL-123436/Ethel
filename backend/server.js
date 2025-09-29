require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes (we'll create these next)
const userRoutes = require('./routes/userRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const kycRoutes = require('./routes/kycRoutes');

// Import WebSocket functionality
const websocketServer = require('./websocket');

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://10.168.27.112:8081', 'http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store the io instance in the websocket module
websocketServer.io = io;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://10.168.27.112:8081', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Disable caching for API routes
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

app.use(express.json({ limit: '50mb' })); // Increase limit for JSON payloads

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/kyc', express.json({ limit: '100mb' }), kycRoutes); // Higher limit specifically for KYC uploads
app.use('/api/admin', adminRoutes);
app.use('/api/passenger', passengerRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, token failed'
    });
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Session expired, please log in again'
    });
  }

  // Default to 500 server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000; // Server port configuration
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for mobile access

server.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
  console.log(`WebSocket server ready for real-time messaging`);
  console.log(`Access from mobile: http://${require('os').networkInterfaces()['Wi-Fi 2']?.find(iface => iface.family === 'IPv4')?.address || 'YOUR_IP'}:${PORT}`);
});
