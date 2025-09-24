// Debug script to help identify server startup issues

// 1. Check environment variables
console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? '*** MongoDB URI is set ***' : 'MongoDB URI is NOT set!');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '*** JWT Secret is set ***' : 'JWT Secret is NOT set!');

// 2. Test MongoDB connection
console.log('\n=== Testing MongoDB Connection ===');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

async function testConnection() {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully!');
    
    // List all databases
    const adminDb = mongoose.connection.getClient().db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('\n📊 Available databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('\nTroubleshooting tips:');
      console.log('1. Is MongoDB running? Check Windows Services (services.msc)');
      console.log('2. Try connecting with MongoDB Compass using: mongodb://localhost:27017/');
      console.log('3. Check if the MongoDB service is running on the default port (27017)');
    }
    return false;
  }
}

// 3. Test Express app setup
async function testExpress() {
  try {
    const express = require('express');
    const app = express();
    
    // Basic middleware
    app.use(require('cors')());
    app.use(express.json());
    
    // Test route
    app.get('/test', (req, res) => {
      res.json({ message: 'Test route works!' });
    });
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`\n✅ Express server is running on port ${PORT}`);
      console.log(`   Test it by visiting: http://localhost:${PORT}/test`);
      
      // Close the server after a short delay
      setTimeout(() => {
        server.close();
        console.log('\n🔌 Test server closed.');
      }, 2000);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Express setup error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('\n=== Starting Debug Tests ===');
  
  const mongoSuccess = await testConnection();
  const expressSuccess = await testExpress();
  
  console.log('\n=== Test Results ===');
  console.log(`- MongoDB Connection: ${mongoSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`- Express Setup: ${expressSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (mongoSuccess && expressSuccess) {
    console.log('\n🎉 All tests passed! Try starting the server with: node server.js');
  } else {
    console.log('\n🔧 Some tests failed. Please check the error messages above.');
  }
}

runTests();
