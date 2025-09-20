const mongoose = require('mongoose');
const User = require('../models/User');
const Ride = require('../models/Ride');
const connectDB = require('../config/database');
require('dotenv').config();

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Ride.deleteMany({});
    
    console.log('Existing data cleared');

    // Create sample users
    const sampleUsers = [
      {
        clerkId: 'user_sample_driver_1',
        email: 'driver1@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1234567890',
        role: 'driver',
        isVerified: true,
        rating: { average: 4.9, count: 45 },
        driverProfile: {
          licenseNumber: 'DL123456789',
          licenseExpiry: new Date('2025-12-31'),
          vehicleInfo: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Silver',
            plateNumber: 'ABC123',
            seats: 4
          },
          documentsVerified: true,
          isAvailable: true,
          currentLocation: {
            type: 'Point',
            coordinates: [-74.006, 40.7128] // NYC coordinates
          },
          earnings: { total: 2500, pending: 150 }
        }
      },
      {
        clerkId: 'user_sample_driver_2',
        email: 'driver2@example.com',
        firstName: 'Mike',
        lastName: 'Chen',
        phone: '+1234567891',
        role: 'driver',
        isVerified: true,
        rating: { average: 4.8, count: 32 },
        driverProfile: {
          licenseNumber: 'DL987654321',
          licenseExpiry: new Date('2026-06-30'),
          vehicleInfo: {
            make: 'Honda',
            model: 'Civic',
            year: 2019,
            color: 'Blue',
            plateNumber: 'XYZ789',
            seats: 4
          },
          documentsVerified: true,
          isAvailable: true,
          currentLocation: {
            type: 'Point',
            coordinates: [-74.0059, 40.7589] // NYC coordinates
          },
          earnings: { total: 1800, pending: 120 }
        }
      },
      {
        clerkId: 'user_sample_passenger_1',
        email: 'passenger1@example.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+1234567892',
        role: 'passenger',
        isVerified: true,
        rating: { average: 4.7, count: 28 },
        passengerProfile: {
          emergencyContact: {
            name: 'John Wilson',
            phone: '+1234567893',
            relationship: 'Father'
          },
          preferences: {
            smokingAllowed: false,
            petsAllowed: true,
            musicPreference: 'low'
          }
        }
      }
    ];

    const users = await User.insertMany(sampleUsers);
    console.log('Sample users created');

    // Create sample rides
    const sampleRides = [
      {
        driver: users[0]._id, // Sarah Johnson
        origin: {
          address: 'Downtown Plaza, New York, NY',
          coordinates: [-74.006, 40.7128],
          placeId: 'ChIJOwg_06VPwokRYv534QaPC8g'
        },
        destination: {
          address: 'JFK International Airport, Queens, NY',
          coordinates: [-73.7781, 40.6413],
          placeId: 'ChIJR0lA1VBmwokR8BGfSBOyT-w'
        },
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        seatsAvailable: 3,
        pricePerSeat: 25,
        status: 'scheduled',
        route: {
          distance: 32.5,
          duration: 45,
          polyline: 'encoded_polyline_string_here'
        },
        preferences: {
          smokingAllowed: false,
          petsAllowed: true,
          maxDetour: 10,
          instantBooking: true
        },
        vehicle: users[0].driverProfile.vehicleInfo,
        notes: 'Comfortable ride to JFK. Can make one stop along the way.'
      },
      {
        driver: users[1]._id, // Mike Chen
        origin: {
          address: 'Columbia University, New York, NY',
          coordinates: [-73.9626, 40.8075],
          placeId: 'ChIJcSZPllz2wokRTFSOSmd_H-M'
        },
        destination: {
          address: 'Times Square, New York, NY',
          coordinates: [-73.985, 40.758],
          placeId: 'ChIJmQJIxlVYwokRLgeuocVOGVU'
        },
        departureTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        seatsAvailable: 2,
        pricePerSeat: 15,
        status: 'scheduled',
        route: {
          distance: 12.8,
          duration: 25,
          polyline: 'encoded_polyline_string_here'
        },
        preferences: {
          smokingAllowed: false,
          petsAllowed: false,
          maxDetour: 5,
          instantBooking: true
        },
        vehicle: users[1].driverProfile.vehicleInfo,
        notes: 'Quick ride to Times Square. No stops.'
      }
    ];

    await Ride.insertMany(sampleRides);
    console.log('Sample rides created');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();