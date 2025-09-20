import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import { requireDriver } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('savedLocations');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
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

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'profileImage'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle role-specific updates
    if (user.role === 'driver' && req.body.driverProfile) {
      const driverUpdates = req.body.driverProfile;
      Object.keys(driverUpdates).forEach(key => {
        if (key !== 'earnings' && key !== 'documentsVerified') {
          user.driverProfile[key] = driverUpdates[key];
        }
      });
    }

    if (user.role === 'passenger' && req.body.passengerProfile) {
      const passengerUpdates = req.body.passengerProfile;
      Object.keys(passengerUpdates).forEach(key => {
        user.passengerProfile[key] = passengerUpdates[key];
      });
    }

    // Update notification preferences
    if (req.body.notifications) {
      user.notifications = { ...user.notifications, ...req.body.notifications };
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/driver/availability
// @desc    Toggle driver availability
// @access  Private (Drivers only)
router.put('/driver/availability', requireDriver, [
  body('isAvailable').isBoolean().withMessage('Availability must be boolean')
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

    const { isAvailable } = req.body;
    
    const user = await User.findById(req.user.id);
    user.driverProfile.isAvailable = isAvailable;
    await user.save();

    // Emit availability change via socket
    req.io.emit('driverAvailabilityChanged', {
      driverId: user._id,
      isAvailable,
      location: user.driverProfile.currentLocation
    });

    res.json({
      success: true,
      message: `Driver ${isAvailable ? 'available' : 'unavailable'}`,
      data: {
        isAvailable
      }
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/driver/vehicle
// @desc    Update driver vehicle information
// @access  Private (Drivers only)
router.put('/driver/vehicle', requireDriver, [
  body('make').optional().notEmpty().withMessage('Vehicle make cannot be empty'),
  body('model').optional().notEmpty().withMessage('Vehicle model cannot be empty'),
  body('year').optional().isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Valid year required'),
  body('color').optional().notEmpty().withMessage('Vehicle color cannot be empty'),
  body('plateNumber').optional().notEmpty().withMessage('Plate number cannot be empty'),
  body('seats').optional().isInt({ min: 1, max: 8 }).withMessage('Seats must be between 1 and 8')
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

    const user = await User.findById(req.user.id);
    
    // Update vehicle info
    const vehicleUpdates = req.body;
    Object.keys(vehicleUpdates).forEach(key => {
      user.driverProfile.vehicleInfo[key] = vehicleUpdates[key];
    });

    await user.save();

    res.json({
      success: true,
      message: 'Vehicle information updated successfully',
      data: {
        vehicleInfo: user.driverProfile.vehicleInfo
      }
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get public user profile
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName rating profileImage role driverProfile.vehicleInfo');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats/dashboard
// @desc    Get user dashboard statistics
// @access  Private
router.get('/stats/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let stats = {};

    if (user.role === 'driver') {
      // Driver statistics

      const rides = await Ride.find({ driver: req.user.id });
      const rideIds = rides.map(ride => ride._id);
      
      const bookings = await Booking.find({ 
        ride: { $in: rideIds },
        paymentStatus: 'paid'
      });

      stats = {
        totalRides: rides.length,
        activeRides: rides.filter(ride => ride.status === 'scheduled').length,
        completedRides: rides.filter(ride => ride.status === 'completed').length,
        totalEarnings: user.driverProfile.earnings.total,
        pendingEarnings: user.driverProfile.earnings.pending,
        totalPassengers: bookings.reduce((sum, booking) => sum + booking.seatsBooked, 0),
        rating: user.rating.average,
        ratingCount: user.rating.count
      };

    } else {
      // Passenger statistics
      
      const bookings = await Booking.find({ passenger: req.user.id });
      const completedBookings = bookings.filter(booking => booking.status === 'completed');
      const totalSpent = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

      stats = {
        totalRides: bookings.length,
        completedRides: completedBookings.length,
        upcomingRides: bookings.filter(booking => 
          booking.status === 'confirmed' && 
          new Date(booking.ride.departureTime) > new Date()
        ).length,
        totalSpent,
        moneySaved: Math.round(totalSpent * 0.3), // Estimated savings vs other transport
        rating: user.rating.average,
        ratingCount: user.rating.count
      };
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;