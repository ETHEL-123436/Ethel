const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Ride is required']
  },
  seatsBooked: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'At least one seat must be booked']
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
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    }
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
    address: {
      type: String,
      required: [true, 'Dropoff address is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'expired'],
    default: 'pending'
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare cannot be negative']
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required']
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_money', 'other'],
    required: [true, 'Payment method is required']
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  cancellationReason: {
    type: String
  },
  cancellationTime: {
    type: Date
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

// Indexes for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ ride: 1, status: 1 });
bookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
bookingSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });

// Pre-save hook to update timestamps
bookingSchema.pre('save', function(next) {
  if (this.isModified('status') && ['cancelled', 'rejected', 'expired'].includes(this.status)) {
    this.cancellationTime = new Date();
  }
  next();
});

// Virtual for calculating the total fare
bookingSchema.virtual('totalFare').get(function() {
  return this.fare * this.seatsBooked;
});

// Create and export the Booking model
module.exports = mongoose.model('Booking', bookingSchema);
