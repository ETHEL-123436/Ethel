const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/userModel');
const ActivityLog = require('../models/activityLogModel');
const Ride = require('../models/rideModel');
const Booking = require('../models/bookingModel');

// @desc    Get refund requests
// @route   GET /api/admin/refund-requests
// @access  Private/Admin
exports.getRefundRequests = asyncHandler(async (req, res, next) => {
  // Transform the advancedResults to match the expected frontend structure
  const transformedResponse = {
    success: true,
    data: {
      data: res.advancedResults.data,
      total: res.advancedResults.pagination ? res.advancedResults.total || res.advancedResults.count : res.advancedResults.data.length,
      page: res.advancedResults.pagination?.page || 1,
      limit: res.advancedResults.pagination?.limit || res.advancedResults.data.length,
      totalPages: res.advancedResults.pagination ? Math.ceil(res.advancedResults.total / res.advancedResults.limit) : 1
    }
  };

  res.status(200).json(transformedResponse);
});

// @desc    Get all users with filtering and pagination
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  // Transform the advancedResults to match the expected frontend structure
  const transformedResponse = {
    success: true,
    data: {
      data: res.advancedResults.data,
      total: res.advancedResults.pagination ? res.advancedResults.total || res.advancedResults.count : res.advancedResults.data.length,
      page: res.advancedResults.pagination?.page || 1,
      limit: res.advancedResults.pagination?.limit || res.advancedResults.data.length,
      totalPages: res.advancedResults.pagination ? Math.ceil(res.advancedResults.total / res.advancedResults.limit) : 1
    }
  };

  res.status(200).json(transformedResponse);
});

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user activity logs
// @route   GET /api/v1/admin/activity-logs
// @access  Private/Admin
exports.getActivityLogs = asyncHandler(async (req, res, next) => {
  // Transform the advancedResults to match the expected frontend structure
  const transformedResponse = {
    success: true,
    data: {
      data: res.advancedResults.data,
      total: res.advancedResults.pagination ? res.advancedResults.total || res.advancedResults.count : res.advancedResults.data.length,
      page: res.advancedResults.pagination?.page || 1,
      limit: res.advancedResults.pagination?.limit || res.advancedResults.data.length,
      totalPages: res.advancedResults.pagination ? Math.ceil(res.advancedResults.total / res.advancedResults.limit) : 1
    }
  };
  
  res.status(200).json(transformedResponse);
});

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const [totalUsers, totalDrivers, totalRides, totalBookings, totalRevenue, activeUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'driver' }),
    Ride.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fare' } } }
    ]).then(result => (result[0]?.total || 0)),
    User.countDocuments({ status: 'active' })
  ]);

  const stats = {
    totalUsers,
    totalDrivers,
    totalRides,
    totalBookings,
    totalRevenue,
    activeUsers,
    pendingKYC: await User.countDocuments({ role: 'driver', status: 'pending' }),
    openDisputes: await ActivityLog.countDocuments({ action: 'dispute_opened' }),
    pendingRefunds: await Booking.countDocuments({ paymentStatus: 'refunded' }),
    recentActivities: await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email role'),
    userGrowth: [], // This would need more complex aggregation for time-series data
    revenueByMonth: [], // This would need more complex aggregation for monthly data
    rideStats: {
      completed: await Ride.countDocuments({ status: 'completed' }),
      cancelled: await Ride.countDocuments({ status: 'cancelled' }),
      inProgress: await Ride.countDocuments({ status: 'in_progress' })
    }
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  // Validate role
  const validRoles = ['user', 'driver', 'admin', 'passenger'];
  if (!validRoles.includes(role)) {
    return next(
      new ErrorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400)
    );
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the action
  await ActivityLog.logActivity(
    req.user.id,
    'role_updated',
    {
      targetUserId: user._id,
      newRole: role,
      previousRole: user.role
    },
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user status (including KYC)
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  // Validate status
  const validStatuses = ['active', 'suspended', 'banned', 'pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return next(
      new ErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400)
    );
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the action
  await ActivityLog.logActivity(
    req.user.id,
    'status_updated',
    {
      targetUserId: user._id,
      newStatus: status,
      previousStatus: user.status
    },
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    data: user
  });
});
