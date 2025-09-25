const User = require('../models/userModel');
const Ride = require('../models/rideModel');
const Booking = require('../models/bookingModel');
const ActivityLog = require('../models/activityLogModel');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users with filtering and pagination
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = ActivityLog.find(JSON.parse(queryStr)).populate('user', 'name email role');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await ActivityLog.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: results.length,
    pagination,
    data: results
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const [totalUsers, totalDrivers, totalRides, totalRevenue] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'driver' }),
    Ride.countDocuments(),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fare' } } }
    ]).then(result => result[0]?.total || 0)
  ]);

  const stats = {
    totalUsers,
    totalDrivers,
    totalRides,
    totalRevenue,
    pendingKYC: await User.countDocuments({ role: 'driver', status: 'pending' }),
    openDisputes: await ActivityLog.countDocuments({ action: 'dispute_opened' }),
    pendingRefunds: await Booking.countDocuments({ paymentStatus: 'refunded' })
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
