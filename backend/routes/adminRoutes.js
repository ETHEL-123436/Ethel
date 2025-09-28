const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  getActivityLogs,
  getDashboardStats,
  updateUserRole,
  updateUserStatus,
  getRefundRequests
} = require('../controllers/adminController');
const {
  getKYCDocuments,
  getKYCDocument,
  updateKYCDocument,
  deleteKYCDocument,
  getKYCStats
} = require('../controllers/kycController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/userModel');
const ActivityLog = require('../models/activityLogModel');
const Booking = require('../models/bookingModel');
const KYCDocument = require('../models/kycDocumentModel');

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
  .get(advancedResults(ActivityLog, 'userId'), getActivityLogs);

// Dashboard
router
  .route('/dashboard-stats')
  .get(getDashboardStats);

// Refund requests
router
  .route('/refund-requests')
  .get(advancedResults(Booking, 'user'), getRefundRequests);

// KYC Document routes
router
  .route('/kyc-documents')
  .get(advancedResults(KYCDocument, 'userId'), getKYCDocuments);

router
  .route('/kyc-documents/:id')
  .get(getKYCDocument)
  .put(updateKYCDocument)
  .delete(deleteKYCDocument);

router
  .route('/kyc-stats')
  .get(getKYCStats);

module.exports = router;
