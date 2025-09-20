import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
  body('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('seatsBooked').isInt({ min: 1, max: 8 }).withMessage('Seats must be between 1 and 8'),
  body('pickupLocation.address').optional().notEmpty().withMessage('Pickup address cannot be empty'),
  body('pickupLocation.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Invalid pickup coordinates')
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

    const { rideId, seatsBooked, pickupLocation, dropoffLocation, passengerNotes } = req.body;

    // Check if user is a passenger
    const user = await User.findById(req.user.id);
    if (user.role !== 'passenger') {
      return res.status(403).json({
        success: false,
        message: 'Only passengers can book rides'
      });
    }

    // Get ride details
    const ride = await Ride.findById(rideId).populate('driver', 'firstName lastName');
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if ride can be booked
    if (!ride.canBook(seatsBooked)) {
      return res.status(400).json({
        success: false,
        message: 'Ride cannot be booked (insufficient seats or ride not available)'
      });
    }

    // Check if passenger is not the driver
    if (ride.driver._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book your own ride'
      });
    }

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: req.user.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this ride'
      });
    }

    // Calculate total amount
    const baseAmount = ride.pricePerSeat * seatsBooked;
    const serviceFee = Math.round(baseAmount * 0.05 * 100) / 100; // 5% service fee
    const totalAmount = baseAmount + serviceFee;

    // Create booking
    const booking = new Booking({
      ride: rideId,
      passenger: req.user.id,
      seatsBooked,
      totalAmount,
      serviceFee,
      pickupLocation: pickupLocation || {
        address: ride.origin.address,
        coordinates: ride.origin.coordinates
      },
      dropoffLocation: dropoffLocation || {
        address: ride.destination.address,
        coordinates: ride.destination.coordinates
      },
      passengerNotes,
      status: 'pending_payment',
    });

    await booking.save();

    // Populate booking for response
    await booking.populate([
      { path: 'ride', populate: { path: 'driver', select: 'firstName lastName rating' } },
      { path: 'passenger', select: 'firstName lastName rating' }
    ]);

    // Notify driver of new booking request
    req.io.to(`user_${ride.driver._id}`).emit('newBookingRequest', {
      booking: booking.toObject(),
      message: `New booking request from ${user.firstName} ${user.lastName}`
    });

    // Send response with booking details
    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Please confirm the booking.',
      data: { booking }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let bookings;

    if (user.role === 'driver') {
      // Get bookings for driver's rides
      const rides = await Ride.find({ driver: req.user.id }).select('_id');
      const rideIds = rides.map(ride => ride._id);
      
      bookings = await Booking.find({ ride: { $in: rideIds } })
        .populate('passenger', 'firstName lastName rating profileImage')
        .populate('ride', 'origin destination departureTime status')
        .sort({ createdAt: -1 });
    } else {
      // Get passenger's bookings
      bookings = await Booking.find({ passenger: req.user.id })
        .populate({
          path: 'ride',
          populate: {
            path: 'driver',
            select: 'firstName lastName rating profileImage driverProfile.vehicleInfo'
          }
        })
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'ride',
        populate: {
          path: 'driver',
          select: 'firstName lastName rating profileImage phone driverProfile.vehicleInfo'
        }
      })
      .populate('passenger', 'firstName lastName rating profileImage phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    const isPassenger = booking.passenger._id.toString() === req.user.id;
    const isDriver = booking.ride.driver._id.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm booking (driver only)
// @access  Private
router.put('/:id/confirm', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ride')
      .populate('passenger', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the driver
    if (booking.ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can confirm bookings'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    // Update ride seats
    await booking.ride.bookSeats(booking.seatsBooked);

    // Add booking to ride's bookings array
    booking.ride.bookings.push(booking._id);
    await booking.ride.save();

    // Notify passenger
    req.io.to(`user_${booking.passenger._id}`).emit('bookingConfirmed', {
      booking: booking.toObject(),
      message: 'Your booking has been confirmed!'
    });

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', [
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ride')
      .populate('passenger', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isPassenger = booking.passenger._id.toString() === req.user.id;
    const isDriver = booking.ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Cancel booking
    await booking.cancel(req.user.id, req.body.reason || 'No reason provided');

    // Update ride seats if booking was confirmed
    if (booking.status === 'confirmed') {
      await booking.ride.cancelBooking(booking.seatsBooked);
    }

    // Notify the other party
    const notifyUserId = isPassenger ? booking.ride.driver : booking.passenger._id;
    const notifyMessage = isPassenger 
      ? `Booking cancelled by passenger ${booking.passenger.firstName}`
      : `Booking cancelled by driver`;

    req.io.to(`user_${notifyUserId}`).emit('bookingCancelled', {
      booking: booking.toObject(),
      message: notifyMessage
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/bookings/:id/rate
// @desc    Rate booking (passenger rates driver, driver rates passenger)
// @access  Private
router.post('/:id/rate', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment too long')
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

    const { rating, comment } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('ride')
      .populate('passenger', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    const isPassenger = booking.passenger._id.toString() === req.user.id;
    const isDriver = booking.ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking'
      });
    }

    // Update rating
    if (isPassenger) {
      // Passenger rating driver
      if (booking.rating.passengerRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this ride'
        });
      }

      booking.rating.passengerRating = {
        rating,
        comment,
        ratedAt: new Date()
      };

      // Update driver's overall rating
      const driver = await User.findById(booking.ride.driver);
      await driver.updateRating(rating);

    } else {
      // Driver rating passenger
      if (booking.rating.driverRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this passenger'
        });
      }

      booking.rating.driverRating = {
        rating,
        comment,
        ratedAt: new Date()
      };

      // Update passenger's overall rating
      await booking.passenger.updateRating(rating);
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const stats = await Booking.getStats(req.user.id, user.role);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;