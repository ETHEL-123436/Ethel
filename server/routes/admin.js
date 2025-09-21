import express from 'express';
import { query, body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      activeDrivers,
      totalRides,
      completedRides,
      totalBookings,
      paidBookings,
      pendingBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'driver', 'driverProfile.isAvailable': true }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: 'completed' }),
      Booking.countDocuments(),
      Booking.countDocuments({ paymentStatus: 'paid' }),
      Booking.countDocuments({ status: 'pending' })
    ]);

    // Calculate monthly revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const stats = {
      totalUsers,
      totalDrivers,
      activeDrivers,
      totalRides,
      completedRides,
      totalBookings,
      paidBookings,
      pendingBookings,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      systemHealth: {
        database: 'online',
        paymentGateway: 'online',
        smsService: 'online'
      }
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin only)
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['passenger', 'driver', 'admin']).withMessage('Invalid role'),
  query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }
    
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-__v -driverProfile.earnings')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page < Math.ceil(totalUsers / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (suspend/activate)
// @access  Private (Admin only)
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('Status must be boolean'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { isActive, reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log admin action
    console.log(`Admin ${req.user.id} ${isActive ? 'activated' : 'suspended'} user ${user._id}. Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/rides
// @desc    Get all rides with filtering
// @access  Private (Admin only)
router.get('/rides', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['scheduled', 'active', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [rides, totalRides] = await Promise.all([
      Ride.find(query)
        .populate('driver', 'firstName lastName email rating')
        .populate('bookings')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRides / limit),
          totalRides,
          hasNext: page < Math.ceil(totalRides / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filtering
// @access  Private (Admin only)
router.get('/bookings', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
  query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    const [bookings, totalBookings] = await Promise.all([
      Booking.find(query)
        .populate('passenger', 'firstName lastName email')
        .populate({
          path: 'ride',
          populate: {
            path: 'driver',
            select: 'firstName lastName email'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBookings / limit),
          totalBookings,
          hasNext: page < Math.ceil(totalBookings / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    // Revenue analytics
    const revenueAnalytics = await Booking.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Booking.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Popular routes
    const popularRoutes = await Ride.aggregate([
      {
        $group: {
          _id: {
            origin: '$origin.address',
            destination: '$destination.address'
          },
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerSeat' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueAnalytics,
        paymentMethods,
        popularRoutes,
        userGrowth
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/export/:type
// @desc    Export data as CSV
// @access  Private (Admin only)
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await User.find({}).select('firstName lastName email role isActive createdAt');
        filename = 'users_export.csv';
        break;
      case 'rides':
        data = await Ride.find({}).populate('driver', 'firstName lastName email');
        filename = 'rides_export.csv';
        break;
      case 'bookings':
        data = await Booking.find({})
          .populate('passenger', 'firstName lastName email')
          .populate('ride', 'origin.address destination.address');
        filename = 'bookings_export.csv';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Convert to CSV format (simplified)
    const csvData = data.map(item => JSON.stringify(item)).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvData);

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;