import mongoose from 'mongoose';
import { calculateDistance } from './schemas/geospatial.js';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['passenger', 'driver', 'admin'],
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Driver-specific fields
  driverProfile: {
    licenseNumber: String,
    licenseExpiry: Date,
    vehicleInfo: {
      make: String,
      model: String,
      year: Number,
      color: String,
      plateNumber: String,
      seats: {
        type: Number,
        min: 1,
        max: 8
      }
    },
    documentsVerified: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    earnings: {
      total: {
        type: Number,
        default: 0
      },
      pending: {
        type: Number,
        default: 0
      }
    }
  },
  // Passenger-specific fields
  passengerProfile: {
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    preferences: {
      smokingAllowed: {
        type: Boolean,
        default: false
      },
      petsAllowed: {
        type: Boolean,
        default: false
      },
      musicPreference: {
        type: String,
        enum: ['none', 'low', 'medium', 'high'],
        default: 'medium'
      }
    }
  },
  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  // Saved locations
  savedLocations: [{
    name: String,
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'other'
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ "driverProfile.currentLocation": "2dsphere" });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to update driver location
userSchema.methods.updateLocation = function(longitude, latitude) {
  if (this.role === 'driver') {
    this.driverProfile.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    return this.save();
  }
  throw new Error('Only drivers can update location');
};

// Method to calculate distance to another point
userSchema.methods.distanceTo = function(longitude, latitude) {
  if (this.role === 'driver' && this.driverProfile.currentLocation) {
    return calculateDistance(
      this.driverProfile.currentLocation.coordinates,
      [longitude, latitude]
    );
  }
  return null;
};

// Method to update rating
userSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;