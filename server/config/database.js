import mongoose from 'mongoose';

// Connection configuration
const connectionOptions = {
  // Connection options
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
  // Connection pooling options
  maxPoolSize: 10,                  // Maximum number of connections in the connection pool
  serverSelectionTimeoutMS: 5000,   // Time to wait for server selection
  socketTimeoutMS: 45000,           // Close sockets after 45 seconds of inactivity
  family: 4,                       // Use IPv4, skip trying IPv6
  
  // Write concern
  w: 'majority',
  wtimeout: 10000,                 // 10 second write concern timeout
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Index creation
  autoIndex: process.env.NODE_ENV !== 'production', // Auto create indexes in development
  
  // Timeouts
  connectTimeoutMS: 10000,          // 10 seconds to connect to the database
  heartbeatFrequencyMS: 10000,      // How often to send heartbeat
};

// Cache the database connection to enable reuse
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If we have a cached connection, return it
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  try {
    if (!cached.promise) {
      // Create a new connection if one doesn't exist
      const opts = {
        ...connectionOptions,
        bufferCommands: false, // Disable mongoose buffering
      };

      // Store the connection promise in the cache
      cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    }

    // Wait for the connection to be established
    const conn = await cached.promise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
    // Store the connection in the cache
    cached.conn = conn;
    return conn;
    
  } catch (error) {
    console.error('Database connection error:', error);
    // Clear the promise cache if the connection fails
    cached.promise = null;
    throw error; // Re-throw to be handled by the application
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ clerkId: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ 'driverProfile.currentLocation': '2dsphere' });

    // Ride indexes
    await mongoose.connection.db.collection('rides').createIndex({ 'origin.coordinates': '2dsphere' });
    await mongoose.connection.db.collection('rides').createIndex({ 'destination.coordinates': '2dsphere' });
    await mongoose.connection.db.collection('rides').createIndex({ departureTime: 1 });
    await mongoose.connection.db.collection('rides').createIndex({ status: 1 });
    await mongoose.connection.db.collection('rides').createIndex({ driver: 1 });

    // Booking indexes
    await mongoose.connection.db.collection('bookings').createIndex({ ride: 1 });
    await mongoose.connection.db.collection('bookings').createIndex({ passenger: 1 });
    await mongoose.connection.db.collection('bookings').createIndex({ status: 1 });
    await mongoose.connection.db.collection('bookings').createIndex({ bookingReference: 1 }, { unique: true });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.log('Index creation warning:', error.message);
  }
};

export default connectDB;