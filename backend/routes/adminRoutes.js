const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  getActivityLogs,
  getDashboardStats,
  updateUserRole,
  updateUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/userModel');
const ActivityLog = require('../models/activityLogModel');

// Re-route into other resource routers
// router.use('/:userId/bookings', bookingRouter);

// Admin protected routes - must be admin to access
router.use(protect);
router.use(authorize('admin'));

// User management routes
router
  .route('/users')
  .get(advancedResults(User), getUsers);

router
  .route('/users/:id')
  .get(getUser);

router
  .route('/users/:id/role')
  .put(updateUserRole);

router
  .route('/users/:id/status')
  .put(updateUserStatus);

// Activity logs
router
  .route('/activity-logs')
  .get(advancedResults(ActivityLog, 'user'), getActivityLogs);

// Dashboard
router
  .route('/dashboard-stats')
  .get(getDashboardStats);

module.exports = router;
