const Booking = require('../models/bookingModel');
const Ride = require('../models/rideModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { calculateDistance } = require('../utils/geoutils');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { rideId, seatsBooked, pickupLocation, dropoffLocation } = req.body;
  
  // Get the ride
  const ride = await Ride.findById(rideId);
  
  if (!ride) {
    return next(new ErrorResponse(`Ride not found with id of ${rideId}`, 404));
  }
  
  // Check if ride is available for booking
  if (ride.status !== 'scheduled') {
    return next(new ErrorResponse('This ride is not available for booking', 400));
  }
  
  // Check if there are enough available seats
  const availableSeats = ride.availableSeats - ride.passengers.filter(p => p.status === 'confirmed').length;
  if (seatsBooked > availableSeats) {
    return next(new ErrorResponse(`Only ${availableSeats} seats available`, 400));
  }
  
  // Calculate fare based on distance (simplified)
  const distance = calculateDistance(
    pickupLocation.coordinates[1],
    pickupLocation.coordinates[0],
    dropoffLocation.coordinates[1],
    dropoffLocation.coordinates[0]
  );
  
  const fare = Math.round(distance * 1.5); // Simple fare calculation
  
  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    ride: rideId,
    seatsBooked,
    pickupLocation,
    dropoffLocation,
    fare: fare * seatsBooked,
    distance,
    estimatedDuration: Math.round(distance * 2), // Estimated minutes
    paymentMethod: req.body.paymentMethod || 'cash'
  });
  
  // Add passenger to ride
  ride.passengers.push({
    user: req.user.id,
    pickupLocation,
    dropoffLocation,
    status: 'pending',
    fare: fare * seatsBooked
  });
  
  await ride.save();
  
  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email')
    .populate('ride', 'startLocation endLocation startTime');
    
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is booking owner or admin
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this booking`,
        401
      )
    );
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Get the ride
  const ride = await Ride.findById(booking.ride);
  
  if (!ride) {
    return next(new ErrorResponse('Associated ride not found', 404));
  }
  
  // Check if user is authorized
  const isDriver = ride.driver.toString() === req.user.id;
  const isPassenger = booking.user.toString() === req.user.id;
  
  if (!isDriver && !isPassenger && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to update this booking', 401)
    );
  }
  
  // Update booking status
  const { status, cancellationReason } = req.body;
  
  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled', 'rejected'],
    confirmed: ['completed', 'cancelled'],
    cancelled: [],
    rejected: [],
    completed: []
  };
  
  if (!validTransitions[booking.status]?.includes(status)) {
    return next(
      new ErrorResponse(`Invalid status transition from ${booking.status} to ${status}`, 400)
    );
  }
  
  // Update booking
  booking.status = status;
  if (cancellationReason) booking.cancellationReason = cancellationReason;
  if (status === 'cancelled' || status === 'rejected') {
    booking.cancellationTime = Date.now();
  }
  
  await booking.save();
  
  // Update passenger status in ride
  const passengerIndex = ride.passengers.findIndex(
    p => p.user.toString() === booking.user.toString()
  );
  
  if (passengerIndex !== -1) {
    ride.passengers[passengerIndex].status = status;
    await ride.save();
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Get bookings by user
// @route   GET /api/bookings/user/:userId
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res, next) => {
  // Check if user is requesting their own bookings or is admin
  if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to access these bookings', 401)
    );
  }
  
  const bookings = await Booking.find({ user: req.params.userId })
    .populate('ride', 'startLocation endLocation startTime driver')
    .sort('-createdAt');
    
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get bookings for a ride
// @route   GET /api/bookings/ride/:rideId
// @access  Private
exports.getRideBookings = asyncHandler(async (req, res, next) => {
  // Check if user is the driver of this ride or admin
  const ride = await Ride.findById(req.params.rideId);
  
  if (!ride) {
    return next(
      new ErrorResponse(`Ride not found with id of ${req.params.rideId}`, 404)
    );
  }
  
  if (ride.driver.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to view these bookings', 401)
    );
  }
  
  const bookings = await Booking.find({ ride: req.params.rideId })
    .populate('user', 'name email phone')
    .sort('-createdAt');
    
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});
