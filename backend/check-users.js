const mongoose = require('mongoose');
const User = require('./models/userModel');

mongoose.connect('mongodb://localhost:27017/camride').then(async () => {
  const adminUsers = await User.find({role: 'admin'}).limit(5);
  console.log('Admin users found:', adminUsers.length);
  adminUsers.forEach(u => console.log(u.email, u.role));

  const allUsers = await User.countDocuments();
  console.log('Total users:', allUsers);

  process.exit(0);
}).catch(console.error);
