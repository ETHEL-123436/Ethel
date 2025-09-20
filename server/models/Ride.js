import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    placeId: String
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    placeId: String
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date
  },
  seatsAvailable: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  seatsBooked: {
    type: Number,
    default: 0
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  route: {
    distance: Number, // in kilometers
    duration: Number, // in minutes
    polyline: String, // encoded polyline for route visualization
    waypoints: [{
      address: String,
      coordinates: [Number],
      order: Number
    }]
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
    maxDetour: {
      type: Number,
      default: 10 // in minutes
    },
    instantBooking: {
      type: Boolean,
      default: true
    }
  },
  vehicle: {
    make: String,
    model: String,
    color: String,
    plateNumber: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  recurringPattern: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    daysOfWeek: [Number], // 0-6, Sunday to Saturday
    endDate: Date
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
rideSchema.index({ "origin.coordinates": "2dsphere" });
rideSchema.index({ "destination.coordinates": "2dsphere" });
rideSchema.index({ departureTime: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ driver: 1 });

// Virtual for available seats
rideSchema.virtual('availableSeats').get(function() {
  return this.seatsAvailable - this.seatsBooked;
});

// Method to check if ride can be booked
rideSchema.methods.canBook = function(seatsRequested = 1) {
  return this.status === 'scheduled' && 
         this.availableSeats >= seatsRequested &&
         this.departureTime > new Date();
};

// Method to book seats
rideSchema.methods.bookSeats = function(seatsRequested) {
  if (this.canBook(seatsRequested)) {
    this.seatsBooked += seatsRequested;
    return this.save();
  }
  throw new Error('Cannot book seats for this ride');
};

// Method to cancel booking
rideSchema.methods.cancelBooking = function(seatsToCancel) {
  this.seatsBooked = Math.max(0, this.seatsBooked - seatsToCancel);
  return this.save();
};

// Static method to find rides near a location
rideSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    $or: [
      {
        "origin.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        }
      },
      {
        "destination.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        }
      }
    ],
    status: 'scheduled',
    departureTime: { $gt: new Date() }
  }).populate('driver', 'firstName lastName rating profileImage');
};

// Static method to search rides
rideSchema.statics.searchRides = function(searchParams) {
  const {
    originLng,
    originLat,
    destLng,
    destLat,
    departureDate,
    seats = 1,
    maxPrice,
    maxDistance = 5000, // in meters
    maxDuration,
    preferences = {}
  } = searchParams;

  const query = {
    status: 'scheduled',
    seatsAvailable: { $gte: seats },
    departureTime: {
      $gte: new Date(departureDate),
      $lt: new Date(new Date(departureDate).getTime() + 24 * 60 * 60 * 1000)
    },
    $and: []
  };

  // Add preferences to query if provided
  if (preferences.smokingAllowed !== undefined) {
    query['preferences.smokingAllowed'] = preferences.smokingAllowed;
  }
  if (preferences.petsAllowed !== undefined) {
    query['preferences.petsAllowed'] = preferences.petsAllowed;
  }
  if (maxPrice) {
    query.pricePerSeat = { $lte: parseFloat(maxPrice) };
  }
  if (maxDuration) {
    query['route.duration'] = { $lte: parseInt(maxDuration) };
  }

  // Add geospatial queries for origin and destination
  const geoQueries = [];
  
  if (originLng && originLat) {
    geoQueries.push({
      "origin.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(originLng), parseFloat(originLat)]
          },
          $maxDistance: maxDistance
        }
      }
    });
  }

  if (destLng && destLat) {
    geoQueries.push({
      "destination.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(destLng), parseFloat(destLat)]
          },
          $maxDistance: maxDistance
        }
      }
    });
  }

  // Add geospatial queries to the main query
  if (geoQueries.length > 0) {
    query.$and = [...(query.$and || []), ...geoQueries];
  }

  return this.find(query)
    .populate('driver', 'firstName lastName rating profileImage driverProfile.vehicleInfo')
    .sort({ departureTime: 1 });
};

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;