import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// @route   PUT /api/locations/update
// @desc    Update driver's current location
// @access  Private (Drivers only)
router.put('/update', [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
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
        message: 'Only drivers can update location'
      });
    }

    const { latitude, longitude } = req.body;
    
    await user.updateLocation(longitude, latitude);

    // Emit location update via socket
    req.io.emit('driverLocationUpdate', {
      driverId: user._id,
      location: { latitude, longitude },
      isAvailable: user.driverProfile.isAvailable
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: {
          latitude,
          longitude
        }
      }
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/locations/nearby-drivers
// @desc    Get nearby available drivers
// @access  Private
router.get('/nearby-drivers', [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isInt({ min: 100 }).withMessage('Radius must be at least 100m')
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

    const { latitude, longitude, radius = 10000 } = req.query;

    const drivers = await User.find({
      role: 'driver',
      'driverProfile.isAvailable': true,
      'driverProfile.currentLocation': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('firstName lastName rating profileImage driverProfile.currentLocation driverProfile.vehicleInfo');

    // Calculate distance for each driver
    const driversWithDistance = drivers.map(driver => {
      const distance = driver.distanceTo(parseFloat(longitude), parseFloat(latitude));
      return {
        ...driver.toObject(),
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    });

    res.json({
      success: true,
      data: {
        drivers: driversWithDistance,
        count: driversWithDistance.length
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

// @route   POST /api/locations/saved
// @desc    Save a location for user
// @access  Private
router.post('/saved', [
  body('name').notEmpty().withMessage('Location name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required'),
  body('type').optional().isIn(['home', 'work', 'other']).withMessage('Invalid location type')
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

    const { name, address, coordinates, type = 'other' } = req.body;

    const user = await User.findById(req.user.id);
    
    // Check if location already exists
    const existingLocation = user.savedLocations.find(
      loc => loc.name.toLowerCase() === name.toLowerCase() || 
             (loc.type === type && type !== 'other')
    );

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: 'Location with this name or type already exists'
      });
    }

    // Add new saved location
    user.savedLocations.push({
      name,
      address,
      coordinates,
      type
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: {
        savedLocations: user.savedLocations
      }
    });

  } catch (error) {
    console.error('Save location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/locations/saved
// @desc    Get user's saved locations
// @access  Private
router.get('/saved', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedLocations');

    res.json({
      success: true,
      data: {
        savedLocations: user.savedLocations || []
      }
    });

  } catch (error) {
    console.error('Get saved locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/locations/saved/:id
// @desc    Update saved location
// @access  Private
router.put('/saved/:id', [
  body('name').optional().notEmpty().withMessage('Location name cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty'),
  body('coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required'),
  body('type').optional().isIn(['home', 'work', 'other']).withMessage('Invalid location type')
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
    const location = user.savedLocations.id(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Saved location not found'
      });
    }

    // Update location fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        location[key] = req.body[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        savedLocations: user.savedLocations
      }
    });

  } catch (error) {
    console.error('Update saved location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/locations/saved/:id
// @desc    Delete saved location
// @access  Private
router.delete('/saved/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const location = user.savedLocations.id(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Saved location not found'
      });
    }

    location.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Location deleted successfully',
      data: {
        savedLocations: user.savedLocations
      }
    });

  } catch (error) {
    console.error('Delete saved location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;