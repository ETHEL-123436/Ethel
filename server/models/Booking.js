import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mtn', 'orange', 'card'],
    default: 'mtn'
  },
  pickupLocation: {
    address: String,
    coordinates: [Number], // [longitude, latitude]
    notes: String
  },
  dropoffLocation: {
    address: String,
    coordinates: [Number], // [longitude, latitude]
    notes: String
  },
  passengerNotes: {
    type: String,
    maxlength: 500
  },
  driverNotes: {
    type: String,
    maxlength: 500
  },
  bookingReference: {
    type: String,
    unique: true
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  rating: {
    passengerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    },
    driverRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ ride: 1 });
bookingSchema.index({ passenger: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ createdAt: -1 });

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'RC' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Add timeline entry when status changes
bookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Status changed to ${this.status}`
    });
  }
  next();
});

// Method to calculate refund amount based on cancellation time
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const rideTime = new Date(this.ride.departureTime);
  const hoursUntilRide = (rideTime - now) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  
  if (hoursUntilRide >= 24) {
    refundPercentage = 0.9; // 90% refund
  } else if (hoursUntilRide >= 12) {
    refundPercentage = 0.7; // 70% refund
  } else if (hoursUntilRide >= 6) {
    refundPercentage = 0.5; // 50% refund
  } else if (hoursUntilRide >= 2) {
    refundPercentage = 0.25; // 25% refund
  }
  // No refund if less than 2 hours
  
  return Math.round(this.totalAmount * refundPercentage * 100) / 100;
};

// Method to cancel booking
bookingSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    cancelledAt: new Date(),
    reason,
    refundAmount: this.calculateRefund(),
    refundStatus: 'pending'
  };
  return this.save();
};

// Static method to get booking statistics
bookingSchema.statics.getStats = function(userId, role) {
  const matchStage = role === 'driver' 
    ? { $lookup: { from: 'rides', localField: 'ride', foreignField: '_id', as: 'rideInfo' } }
    : { passenger: mongoose.Types.ObjectId(userId) };
    
  return this.aggregate([
    { $match: matchStage },
    ...(role === 'driver' ? [{ $match: { 'rideInfo.driver': mongoose.Types.ObjectId(userId) } }] : []),
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalEarnings: { $sum: '$totalAmount' },
        averageRating: { $avg: '$rating.passengerRating.rating' }
      }
    }
  ]);
};

export default mongoose.model('Booking', bookingSchema);