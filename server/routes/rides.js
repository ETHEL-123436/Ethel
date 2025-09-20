import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// @route   GET /api/rides/search
// @desc    Search for available rides
// @access  Private
router.get('/search', [
  query('originLng').isFloat().withMessage('Origin longitude is required'),
  query('originLat').isFloat().withMessage('Origin latitude is required'),
  query('destLng').optional().isFloat().withMessage('Invalid destination longitude'),
  query('destLat').optional().isFloat().withMessage('Invalid destination latitude'),
  query('departureDate').isISO8601().withMessage('Valid departure date is required'),
  query('seats').optional().isInt({ min: 1, max: 8 }).withMessage('Seats must be between 1 and 8'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('maxDistance').optional().isInt({ min: 100 }).withMessage('Max distance must be at least 100m')
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

    const searchParams = {
      originLng: parseFloat(req.query.originLng),
      originLat: parseFloat(req.query.originLat),
      destLng: req.query.destLng ? parseFloat(req.query.destLng) : null,
      destLat: req.query.destLat ? parseFloat(req.query.destLat) : null,
      departureDate: req.query.departureDate,
      seats: parseInt(req.query.seats) || 1,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      maxDistance: parseInt(req.query.maxDistance) || 5000
    };

    const rides = await Ride.searchRides(searchParams);

    res.json({
      success: true,
      data: {
        rides,
        count: rides.length
      }
    });

  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/rides
// @desc    Get user's rides (driver: offered rides, passenger: booked rides)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let rides;

    if (user.role === 'driver') {
      // Get rides offered by driver
      rides = await Ride.find({ driver: req.user.id })
        .populate('bookings')
        .sort({ departureTime: -1 });
    } else {
      // Get rides booked by passenger
      const bookings = await Booking.find({ passenger: req.user.id })
        .populate({
          path: 'ride',
          populate: {
            path: 'driver',
            select: 'firstName lastName rating profileImage'
          }
        })
        .sort({ createdAt: -1 });
      
      rides = bookings.map(booking => ({
        ...booking.ride.toObject(),
        bookingInfo: {
          id: booking._id,
          status: booking.status,
          seatsBooked: booking.seatsBooked,
          totalAmount: booking.totalAmount,
          bookingReference: booking.bookingReference
        }
      }));
    }

    res.json({
      success: true,
      data: { rides }
    });

  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/rides/:id
// @desc    Get ride details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'firstName lastName rating profileImage driverProfile.vehicleInfo')
      .populate({
        path: 'bookings',
        populate: {
          path: 'passenger',
          select: 'firstName lastName rating profileImage'
        }
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: { ride }
    });

  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/rides
// @desc    Create a new ride (drivers only)
// @access  Private
router.post('/', [
  body('origin.address').notEmpty().withMessage('Origin address is required'),
  body('origin.coordinates').isArray({ min: 2, max: 2 }).withMessage('Origin coordinates required'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  body('destination.coordinates').isArray({ min: 2, max: 2 }).withMessage('Destination coordinates required'),
  body('departureTime').isISO8601().withMessage('Valid departure time is required'),
  body('seatsAvailable').isInt({ min: 1, max: 8 }).withMessage('Seats must be between 1 and 8'),
  body('pricePerSeat').isFloat({ min: 0 }).withMessage('Price must be positive')
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
    if (user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can create rides'
      });
    }

    // Check if departure time is in the future
    const departureTime = new Date(req.body.departureTime);
    if (departureTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Departure time must be in the future'
      });
    }

    const rideData = {
      ...req.body,
      driver: req.user.id,
      vehicle: user.driverProfile.vehicleInfo || {}
    };

    const ride = new Ride(rideData);
    await ride.save();

    await ride.populate('driver', 'firstName lastName rating profileImage');

    // Emit real-time event for new ride
    req.io.emit('newRide', {
      ride: ride.toObject(),
      message: 'New ride available'
    });

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: { ride }
    });

  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/rides/:id
// @desc    Update ride (driver only)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is the driver
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride'
      });
    }

    // Don't allow updates if ride has bookings and is not just status change
    if (ride.bookings.length > 0 && Object.keys(req.body).some(key => key !== 'status')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify ride details when bookings exist'
      });
    }

    const allowedUpdates = [
      'departureTime', 'seatsAvailable', 'pricePerSeat', 'notes', 
      'preferences', 'status'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(ride, updates);
    await ride.save();

    // Notify passengers of ride updates
    if (ride.bookings.length > 0) {
      const bookings = await Booking.find({ ride: ride._id })
        .populate('passenger', 'firstName lastName');
      
      bookings.forEach(booking => {
        req.io.to(`user_${booking.passenger._id}`).emit('rideUpdated', {
          ride: ride.toObject(),
          message: 'Your booked ride has been updated'
        });
      });
    }

    res.json({
      success: true,
      message: 'Ride updated successfully',
      data: { ride }
    });

  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/rides/:id
// @desc    Cancel ride (driver only)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is the driver
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride'
      });
    }

    // Update ride status to cancelled
    ride.status = 'cancelled';
    await ride.save();

    // Cancel all bookings and process refunds
    const bookings = await Booking.find({ ride: ride._id, status: { $ne: 'cancelled' } })
      .populate('passenger', 'firstName lastName email');

    for (const booking of bookings) {
      await booking.cancel(req.user.id, 'Ride cancelled by driver');
      
      // Notify passenger
      req.io.to(`user_${booking.passenger._id}`).emit('rideCancelled', {
        booking: booking.toObject(),
        message: 'Your booked ride has been cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { 
        ride,
        cancelledBookings: bookings.length
      }
    });

  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/rides/nearby/drivers
// @desc    Get nearby available drivers
// @access  Private
router.get('/nearby/drivers', [
  query('lng').isFloat().withMessage('Longitude is required'),
  query('lat').isFloat().withMessage('Latitude is required'),
  query('radius').optional().isInt({ min: 1000 }).withMessage('Radius must be at least 1000m')
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

    const { lng, lat, radius = 10000 } = req.query;

    const drivers = await User.find({
      role: 'driver',
      'driverProfile.isAvailable': true,
      'driverProfile.currentLocation': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('firstName lastName rating profileImage driverProfile.currentLocation driverProfile.vehicleInfo');

    res.json({
      success: true,
      data: {
        drivers,
        count: drivers.length
      }
    });

  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;