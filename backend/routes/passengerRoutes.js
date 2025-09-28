const express = require('express');
const router = express.Router();
const {
  submitPassengerVerification,
  getPassengerVerificationStatus,
  uploadPassengerDocument,
  exnessVerification,
  getPassengerVerificationHistory
} = require('../controllers/passengerController');
const { protect, authorize } = require('../middleware/auth');

// All passenger routes require authentication
router.use(protect);

// Passenger verification routes
router.post('/verify', authorize('passenger', 'user'), submitPassengerVerification);
router.get('/verification-status', authorize('passenger', 'user'), getPassengerVerificationStatus);
router.post('/upload-document', authorize('passenger', 'user'), uploadPassengerDocument);
router.post('/exness-verify', authorize('passenger', 'user'), exnessVerification);
router.get('/verification-history', authorize('passenger', 'user'), getPassengerVerificationHistory);

module.exports = router;
