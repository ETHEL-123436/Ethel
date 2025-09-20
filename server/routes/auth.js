import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (called after Clerk signup)
// @access  Public
router.post('/register', [
  body('clerkId').notEmpty().withMessage('Clerk ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('role').isIn(['passenger', 'driver']).withMessage('Role must be passenger or driver')
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

    const { clerkId, email, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ clerkId }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const userData = {
      clerkId,
      email,
      firstName,
      lastName,
      phone,
      role,
      isVerified: true // Since Clerk handles verification
    };

    // Initialize role-specific profiles
    if (role === 'driver') {
      userData.driverProfile = {
        isAvailable: false,
        currentLocation: {
          type: 'Point',
          coordinates: [0, 0]
        },
        earnings: {
          total: 0,
          pending: 0
        }
      };
    } else {
      userData.passengerProfile = {
        preferences: {
          smokingAllowed: false,
          petsAllowed: false,
          musicPreference: 'medium'
        }
      };
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          rating: user.rating
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
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

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
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

// @route   POST /api/auth/sync-clerk
// @desc    Sync user data with Clerk (webhook handler)
// @access  Public (but should be secured with webhook signature)
router.post('/sync-clerk', async (req, res) => {
  try {
    const { type, data } = req.body;

    switch (type) {
      case 'user.created':
        // Handle new user creation from Clerk
        const { id: clerkId, email_addresses, first_name, last_name, phone_numbers } = data;
        
        const existingUser = await User.findOne({ clerkId });
        if (!existingUser) {
          // Create placeholder user - they'll complete registration later
          const newUser = new User({
            clerkId,
            email: email_addresses[0]?.email_address,
            firstName: first_name || 'User',
            lastName: last_name || '',
            phone: phone_numbers[0]?.phone_number || '',
            role: 'passenger', // Default role
            isVerified: true
          });
          await newUser.save();
        }
        break;

      case 'user.updated':
        // Handle user updates from Clerk
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            email: data.email_addresses[0]?.email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone_numbers[0]?.phone_number
          }
        );
        break;

      case 'user.deleted':
        // Handle user deletion from Clerk
        await User.findOneAndUpdate(
          { clerkId: data.id },
          { isActive: false }
        );
        break;
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Clerk sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync error'
    });
  }
});

export default router;