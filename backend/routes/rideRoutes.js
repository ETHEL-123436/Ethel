const express = require('express');
const router = express.Router();
const {
  getRides,
  getRide,
  createRide,
  updateRide,
  deleteRide,
  getRidesInRadius,
  getRidesByDriver
} = require('../controllers/rideController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.route('/')
  .get(getRides)
  .post(protect, authorize('driver', 'admin'), createRide);

router.route('/radius/:lat/:lng/:distance')
  .get(getRidesInRadius);

router.route('/driver/:driverId')
  .get(protect, getRidesByDriver);

router.route('/:id')
  .get(getRide)
  .put(protect, authorize('driver', 'admin'), updateRide)
  .delete(protect, authorize('driver', 'admin'), deleteRide);

module.exports = router;
