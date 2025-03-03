require('dotenv').config();
const mongoose = require('mongoose');

// This script is used to test the MongoDB Atlas connection
async function testMongoConnection() {
  console.log('Testing MongoDB Atlas connection...');
  
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-tracker';
  
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`); // Hide credentials in logs
  console.log('If you are using MongoDB Atlas, make sure your connection string starts with mongodb+srv://');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Check if we can perform a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in the database:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Disconnect when done
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // Provide troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your MongoDB Atlas connection string in .env file');
    console.log('2. Make sure your IP whitelist in MongoDB Atlas includes 0.0.0.0/0');
    console.log('3. Check that your MongoDB Atlas username and password are correct');
    console.log('4. Ensure your MongoDB Atlas cluster is running and not in maintenance mode');
    console.log('5. Verify that your database user has appropriate permissions');
    
    return false;
  }
}

// Run the test
testMongoConnection()
  .then(successful => {
    if (successful) {
      console.log('MongoDB connection test completed successfully!');
    } else {
      console.log('MongoDB connection test failed. See errors above.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error during connection test:', err);
    process.exit(1);
  }); 