const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  getUserBookings,
  getRideBookings
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin'), getBookings)
  .post(createBooking);

router.route('/user/:userId')
  .get(getUserBookings);

router.route('/ride/:rideId')
  .get(getRideBookings);

router.route('/:id')
  .get(getBooking);

router.route('/:id/status')
  .put(updateBookingStatus);

module.exports = router;
