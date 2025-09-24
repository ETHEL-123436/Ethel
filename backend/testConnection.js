const mongoose = require('mongoose');
require('dotenv').config();

// Connection configuration
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected!');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Create a test collection and insert a document
    console.log('Creating test collection and inserting document...');
    const result = await db.collection('test').insertOne({
      message: 'Database connection test successful!',
      timestamp: new Date(),
      app: 'Cam-Ride',
      environment: process.env.NODE_ENV || 'development'
    });
    
    console.log('✅ Test document inserted successfully!');
    console.log('Document ID:', result.insertedId);
    
    // Verify the document was inserted
    const doc = await db.collection('test').findOne({ _id: result.insertedId });
    console.log('✅ Document verified:', JSON.stringify(doc, null, 2));
    
    // List all collections in the database
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Collections in database:', collections.map(c => c.name));
    
    // List all databases (admin only)
    try {
      const adminDb = mongoose.connection.getClient().db('admin');
      const dbs = await adminDb.admin().listDatabases();
      console.log('\n📊 Available databases:', dbs.databases.map(db => db.name));
    } catch (adminError) {
      console.log('\nℹ️ Could not list all databases (admin privileges may be required)');
    }
    
    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // More detailed error information
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error:', error.codeName);
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB. Please check:');
      console.error('1. Is MongoDB running?');
      console.error('2. Is the connection string correct?');
      console.error('3. Are there any firewall rules blocking the connection?');
    }
    
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) { // 1 = connected
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed.');
    }
    process.exit(0);
  }
};

// Run the test
connectDB();
