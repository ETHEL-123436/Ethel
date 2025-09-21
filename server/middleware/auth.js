// middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Decode JWT (for Clerk integration, replace with proper verification in production)
    const decoded = jwt.decode(token);

    if (!decoded?.sub) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: decoded.sub });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    req.user = {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware factory to check if user has specific role(s)
 */
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRoles = Array.isArray(roles) ? roles : [roles];

      if (!userRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Specific role middlewares
const requireDriver = requireRole('driver');
const requirePassenger = requireRole('passenger');

/**
 * Middleware to check if user is admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user || (user.role !== 'admin' && !user.email.includes('admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Middleware to check if user is admin or driver
 */
const requireAdminOrDriver = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'driver') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Admin or driver access required'
  });
};

export {
  authenticateToken,
  requireRole,
  requireDriver,
  requirePassenger,
  requireAdmin,
  requireAdminOrDriver
};
