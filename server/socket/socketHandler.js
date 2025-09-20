const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Decode JWT token (simplified for Clerk integration)
      const decoded = jwt.decode(token);
      
      if (!decoded || !decoded.sub) {
        return next(new Error('Invalid token'));
      }

      // Find user by Clerk ID
      const user = await User.findOne({ clerkId: decoded.sub });
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.clerkId = user.clerkId;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join role-based rooms
    socket.join(`role_${socket.userRole}`);

    // Handle driver location updates
    socket.on('updateLocation', async (data) => {
      try {
        if (socket.userRole !== 'driver') {
          return socket.emit('error', { message: 'Only drivers can update location' });
        }

        const { latitude, longitude } = data;
        
        if (!latitude || !longitude) {
          return socket.emit('error', { message: 'Invalid location data' });
        }

        // Update driver location in database
        const user = await User.findById(socket.userId);
        if (user) {
          await user.updateLocation(longitude, latitude);
          
          // Broadcast location to passengers in nearby area
          socket.broadcast.emit('driverLocationUpdate', {
            driverId: socket.userId,
            location: { latitude, longitude },
            isAvailable: user.driverProfile.isAvailable
          });
        }

      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle driver availability toggle
    socket.on('toggleAvailability', async (data) => {
      try {
        if (socket.userRole !== 'driver') {
          return socket.emit('error', { message: 'Only drivers can toggle availability' });
        }

        const { isAvailable } = data;
        
        const user = await User.findById(socket.userId);
        if (user) {
          user.driverProfile.isAvailable = isAvailable;
          await user.save();

          socket.emit('availabilityUpdated', { isAvailable });
          
          // Notify nearby passengers if driver becomes available
          if (isAvailable && user.driverProfile.currentLocation) {
            socket.broadcast.emit('driverAvailable', {
              driverId: socket.userId,
              location: user.driverProfile.currentLocation,
              driverInfo: {
                name: `${user.firstName} ${user.lastName}`,
                rating: user.rating.average,
                vehicle: user.driverProfile.vehicleInfo
              }
            });
          }
        }

      } catch (error) {
        console.error('Availability toggle error:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    // Handle ride tracking for active bookings
    socket.on('joinRideTracking', (data) => {
      const { rideId } = data;
      if (rideId) {
        socket.join(`ride_${rideId}`);
        console.log(`User ${socket.userId} joined ride tracking for ${rideId}`);
      }
    });

    socket.on('leaveRideTracking', (data) => {
      const { rideId } = data;
      if (rideId) {
        socket.leave(`ride_${rideId}`);
        console.log(`User ${socket.userId} left ride tracking for ${rideId}`);
      }
    });

    // Handle real-time ride updates during trip
    socket.on('rideUpdate', (data) => {
      const { rideId, update } = data;
      if (rideId && update) {
        // Broadcast update to all users tracking this ride
        socket.to(`ride_${rideId}`).emit('rideUpdateReceived', {
          from: socket.userId,
          update,
          timestamp: new Date()
        });
      }
    });

    // Handle chat messages between driver and passengers
    socket.on('sendMessage', (data) => {
      const { rideId, message, recipientId } = data;
      
      if (recipientId) {
        // Direct message to specific user
        socket.to(`user_${recipientId}`).emit('messageReceived', {
          from: socket.userId,
          message,
          rideId,
          timestamp: new Date()
        });
      } else if (rideId) {
        // Broadcast to all users in the ride
        socket.to(`ride_${rideId}`).emit('messageReceived', {
          from: socket.userId,
          message,
          rideId,
          timestamp: new Date()
        });
      }
    });

    // Handle emergency alerts
    socket.on('emergencyAlert', async (data) => {
      try {
        const { rideId, location, message } = data;
        
        console.log(`Emergency alert from user ${socket.userId}:`, data);
        
        // Notify all users in the ride
        if (rideId) {
          socket.to(`ride_${rideId}`).emit('emergencyAlert', {
            from: socket.userId,
            location,
            message,
            timestamp: new Date()
          });
        }

        // Notify admin/support (you can implement admin notification system)
        socket.to('role_admin').emit('emergencyAlert', {
          userId: socket.userId,
          rideId,
          location,
          message,
          timestamp: new Date()
        });

        // Here you could also trigger SMS/email notifications
        // or integrate with emergency services APIs

      } catch (error) {
        console.error('Emergency alert error:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle typing indicators for chat
    socket.on('typing', (data) => {
      const { rideId, recipientId } = data;
      
      if (recipientId) {
        socket.to(`user_${recipientId}`).emit('userTyping', {
          userId: socket.userId,
          rideId
        });
      } else if (rideId) {
        socket.to(`ride_${rideId}`).emit('userTyping', {
          userId: socket.userId,
          rideId
        });
      }
    });

    socket.on('stopTyping', (data) => {
      const { rideId, recipientId } = data;
      
      if (recipientId) {
        socket.to(`user_${recipientId}`).emit('userStoppedTyping', {
          userId: socket.userId,
          rideId
        });
      } else if (rideId) {
        socket.to(`ride_${rideId}`).emit('userStoppedTyping', {
          userId: socket.userId,
          rideId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Update driver availability if they were online
      if (socket.userRole === 'driver') {
        try {
          const user = await User.findById(socket.userId);
          if (user && user.driverProfile.isAvailable) {
            user.driverProfile.isAvailable = false;
            await user.save();
            
            // Notify that driver is no longer available
            socket.broadcast.emit('driverUnavailable', {
              driverId: socket.userId
            });
          }
        } catch (error) {
          console.error('Error updating driver availability on disconnect:', error);
        }
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const connectedSockets = io.sockets.sockets.size;
    console.log(`Active socket connections: ${connectedSockets}`);
  }, 300000); // Every 5 minutes
};

module.exports = socketHandler;