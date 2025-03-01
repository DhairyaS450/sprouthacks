const mongoose = require('mongoose');
require('dotenv').config();

async function fixUserIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-tracker');
    console.log('Connected to MongoDB');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Drop the token index
    await usersCollection.dropIndex('token_1');
    console.log('Successfully dropped token_1 index');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error fixing user index:', error);
    
    // Close the connection
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
  }
}

// Run the function
fixUserIndex(); 