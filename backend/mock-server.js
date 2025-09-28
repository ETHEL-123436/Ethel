const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Mock data from the frontend
const mockData = {
  users: [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'passenger',
      kycStatus: 'approved',
      rating: 4.5,
      totalRides: 25,
      walletBalance: 5000
    },
    {
      id: 'driver1',
      name: 'Jean-Paul Mbarga',
      email: 'jp.mbarga@email.com',
      role: 'driver',
      kycStatus: 'approved',
      rating: 4.8,
      totalRides: 245,
      walletBalance: 125000
    }
  ],
  dashboardStats: {
    totalUsers: 1250,
    totalDrivers: 89,
    totalRides: 3456,
    totalRevenue: 1250000,
    activeRides: 12,
    pendingRefunds: 3
  },
  pendingRefunds: [
    {
      id: 'refund1',
      amount: 2500,
      reason: 'Trip cancelled by driver',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ],
  activityLogs: [
    {
      id: 'log1',
      action: 'User registered',
      user: 'john@example.com',
      timestamp: new Date().toISOString()
    },
    {
      id: 'log2',
      action: 'Ride completed',
      user: 'driver1',
      timestamp: new Date().toISOString()
    }
  ]
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date() });
});

// Admin routes
app.get('/api/admin/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    data: mockData.dashboardStats
  });
});

app.get('/api/admin/pending-refunds', (req, res) => {
  res.json({
    success: true,
    data: mockData.pendingRefunds
  });
});

app.get('/api/admin/activity-logs', (req, res) => {
  res.json({
    success: true,
    data: mockData.activityLogs
  });
});

app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    data: mockData.users
  });
});

// User routes
app.post('/api/v1/users/login', (req, res) => {
  const { email, password, role } = req.body;

  // Simple mock authentication
  if (email && password) {
    res.json({
      success: true,
      data: {
        id: 'user1',
        name: 'John Doe',
        email: email,
        role: role || 'passenger',
        token: 'mock_jwt_token_123456',
        kycStatus: 'approved'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Mock server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/v1/health');
  console.log('- GET /api/admin/dashboard-stats');
  console.log('- GET /api/admin/pending-refunds');
  console.log('- GET /api/admin/activity-logs');
  console.log('- GET /api/admin/users');
  console.log('- POST /api/v1/users/login');
});
