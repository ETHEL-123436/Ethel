import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Ride from './models/Ride.js';
import Booking from './models/Booking.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connection configuration
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  w: 'majority',
  wtimeout: 10000,
  retryWrites: true,
  retryReads: true,
  autoIndex: true, // Enable in development
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
};

// Connect to MongoDB
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rideconnect';
  
  try {
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Ride.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared all collections');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Create test users
const createUsers = async () => {
  const users = [
    {
      clerkId: 'user_2QbX4wLmR9KzXpQdF8XvAeF0Pq3',
      email: 'passenger@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'passenger',
      isVerified: true,
    },
    {
      clerkId: 'user_2QbX4wLmR9KzXpQdF8XvAeF0Pq4',
      email: 'driver@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1987654321',
      role: 'driver',
      isVerified: true,
      driverProfile: {
        licenseNumber: 'DL12345678',
        car: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Silver',
          licensePlate: 'ABC1234',
          capacity: 4,
        },
      },
    },
  ];

  try {
    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers.map(u => u.email));
    return createdUsers;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
};

// Create test rides
const createRides = async (driver) => {
  const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

  const rides = [
    {
      driver: driver._id,
      origin: {
        address: '123 Main St, Anytown, USA',
        coordinates: [-74.006, 40.7128], // Example coordinates (NYC)
      },
      destination: {
        address: '456 Oak Ave, Somewhere, USA',
        coordinates: [-74.5, 40.8],
      },
      departureTime: new Date(tomorrow.setHours(8, 0, 0, 0)), // 8:00 AM tomorrow
      seatsAvailable: 3,
      pricePerSeat: 15.50,
      status: 'scheduled',
      estimatedDuration: 30, // minutes
      distance: 15, // miles
      amenities: ['AC', 'Music', 'Charging'],
    },
    {
      driver: driver._id,
      origin: {
        address: '789 Pine St, Anytown, USA',
        coordinates: [-74.1, 40.7],
      },
      destination: {
        address: '321 Elm St, Somewhere, USA',
        coordinates: [-74.6, 40.9],
      },
      departureTime: new Date(tomorrow.setHours(17, 30, 0, 0)), // 5:30 PM tomorrow
      seatsAvailable: 2,
      pricePerSeat: 12.75,
      status: 'scheduled',
      estimatedDuration: 25,
      distance: 12,
      amenities: ['AC', 'WiFi'],
    },
  ];

  try {
    const createdRides = await Ride.insertMany(rides);
    console.log('Created rides');
    return createdRides;
  } catch (error) {
    console.error('Error creating rides:', error);
    throw error;
  }
};

// Create test bookings
const createBookings = async (passenger, rides) => {
  const bookings = [
    {
      ride: rides[0]._id,
      passenger: passenger._id,
      seatsBooked: 1,
      totalAmount: 15.50,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'mtn',
      pickupLocation: {
        address: '123 Main St, Anytown, USA',
        coordinates: [-74.006, 40.7128],
      },
      dropoffLocation: {
        address: '456 Oak Ave, Somewhere, USA',
        coordinates: [-74.5, 40.8],
      },
    },
  ];

  try {
    const createdBookings = await Booking.insertMany(bookings);
    console.log('Created bookings');
    return createdBookings;
  } catch (error) {
    console.error('Error creating bookings:', error);
    throw error;
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearData();
    
    const users = await createUsers();
    const passenger = users.find(u => u.role === 'passenger');
    const driver = users.find(u => u.role === 'driver');
    
    const rides = await createRides(driver);
    await createBookings(passenger, rides);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
