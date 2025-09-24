const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting MongoDB connection test...');
console.log('Connection string:', process.env.MONGO_URI || 'Not found in .env');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camride', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB!');
  
  // List all databases
  const adminDb = mongoose.connection.getClient().db('admin');
  return adminDb.admin().listDatabases()
    .then(dbs => {
      console.log('\n📊 Available databases:');
      dbs.databases.forEach(db => console.log(`- ${db.name}`));
    });
})
.catch(err => {
  console.error('❌ Connection error:', err.message);
  if (err.name === 'MongoServerSelectionError') {
    console.log('\nTroubleshooting tips:');
    console.log('1. Is MongoDB running? Check Windows Services (services.msc)');
    console.log('2. Try connecting with MongoDB Compass using: mongodb://localhost:27017/');
    console.log('3. Check if the MongoDB service is running on the default port (27017)');
  }
})
.finally(() => {
  mongoose.connection.close();
  console.log('\nConnection closed.');
});
