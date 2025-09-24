const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: [true, 'Start location address is required']
    }
  },
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: [true, 'End location address is required']
    }
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [1, 'Available seats must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  passengers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: String
    },
    dropoffLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: String
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    fare: {
      type: Number,
      required: true
    }
  }],
  distance: {
    type: Number,
    required: [true, 'Distance is required']
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required']
  },
  polyline: {
    type: String,
    required: [true, 'Polyline is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
rideSchema.index({ 'startLocation.coordinates': '2dsphere' });
rideSchema.index({ 'endLocation.coordinates': '2dsphere' });

// Virtual for available seats calculation
rideSchema.virtual('remainingSeats').get(function() {
  return this.availableSeats - this.passengers.filter(p => p.status === 'confirmed').length;
});

// Pre-save hook to update status based on timestamps
rideSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.endTime && this.endTime < now) {
    this.status = 'completed';
  } else if (this.startTime < now) {
    this.status = 'in_progress';
  }
  
  next();
});

// Create and export the Ride model
module.exports = mongoose.model('Ride', rideSchema);
