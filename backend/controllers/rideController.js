const Ride = require('../models/rideModel');
const Booking = require('../models/bookingModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { calculateDistance } = require('../utils/geoutils');

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private (Driver)
exports.createRide = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.driver = req.user.id;

  // Check if user is a driver
  if (req.user.role !== 'driver') {
    return next(
      new ErrorResponse('Only drivers can create rides', 403)
    );
  }

  // Calculate distance and estimated duration (you'll need to implement this)
  const { startLocation, endLocation } = req.body;
  
  // In a real app, you would use a mapping service like Google Maps API
  // For now, we'll use a placeholder
  const distance = calculateDistance(
    startLocation.coordinates[1],
    startLocation.coordinates[0],
    endLocation.coordinates[1],
    endLocation.coordinates[0]
  );

  // Estimate duration (in minutes) - this is a simple estimation
  const estimatedDuration = Math.round(distance * 3); // Assuming 20 km/h average speed

  const ride = await Ride.create({
    ...req.body,
    distance,
    estimatedDuration,
    status: 'scheduled'
  });

  res.status(201).json({
    success: true,
    data: ride
  });
});

// @desc    Get all rides
// @route   GET /api/rides
// @access  Public
exports.getRides = asyncHandler(async (req, res, next) => {
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
  let query = Ride.find(JSON.parse(queryStr)).populate('driver', 'name email phone');

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
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Ride.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const rides = await query;

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
    count: rides.length,
    pagination,
    data: rides
  });
});

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
exports.getRide = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id)
    .populate('driver', 'name email phone')
    .populate('passengers.user', 'name email phone');

  if (!ride) {
    return next(
      new ErrorResponse(`Ride not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: ride
  });
});

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private (Driver)
exports.updateRide = asyncHandler(async (req, res, next) => {
  let ride = await Ride.findById(req.params.id);

  if (!ride) {
    return next(
      new ErrorResponse(`Ride not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ride owner
  if (ride.driver.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this ride`,
        401
      )
    );
  }

  // If ride is already completed or cancelled, don't allow updates
  if (['completed', 'cancelled'].includes(ride.status)) {
    return next(
      new ErrorResponse(
        `Cannot update a ride that is ${ride.status}`,
        400
      )
    );
  }

  // If updating status to completed, set end time to now
  if (req.body.status === 'completed') {
    req.body.endTime = Date.now();
  }

  ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: ride
  });
});

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private (Driver/Admin)
exports.deleteRide = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return next(
      new ErrorResponse(`Ride not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ride owner or admin
  if (ride.driver.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this ride`,
        401
      )
    );
  }

  // Instead of deleting, we'll mark as cancelled
  ride.status = 'cancelled';
  ride.isActive = false;
  await ride.save();

  // Also cancel all associated bookings
  await Booking.updateMany(
    { ride: ride._id, status: { $in: ['pending', 'confirmed'] } },
    { 
      status: 'cancelled',
      cancellationReason: 'Ride was cancelled by the driver',
      cancellationTime: Date.now()
    }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get rides within a radius
// @route   GET /api/rides/radius/:lat/:lng/:distance (distance in km)
// @access  Public
exports.getRidesInRadius = asyncHandler(async (req, res, next) => {
  const { lat, lng, distance } = req.params;
  const EARTH_RADIUS_KM = 6378;
  // Calc radius using radians
  // Divide distance by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / EARTH_RADIUS_KM;

  const rides = await Ride.find({
    'startLocation.coordinates': {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    },
    status: 'scheduled',
    availableSeats: { $gt: 0 },
    startTime: { $gt: new Date() }
  });

  res.status(200).json({
    success: true,
    count: rides.length,
    data: rides
  });
});

// @desc    Get rides by driver
// @route   GET /api/rides/driver/:driverId
// @access  Private
exports.getRidesByDriver = asyncHandler(async (req, res, next) => {
  const rides = await Ride.find({ driver: req.params.driverId })
    .sort('-startTime')
    .populate('passengers.user', 'name email phone');

  res.status(200).json({
    success: true,
    count: rides.length,
    data: rides
  });
});
