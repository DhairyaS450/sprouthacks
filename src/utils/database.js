const mongoose = require('mongoose');
require('dotenv').config();

let cachedConnection = null;

/**
 * Centralized MongoDB connection function optimized for serverless environments like Vercel
 * Uses connection pooling and caching for better performance with serverless functions
 */
async function connectToDatabase() {
  // If we already have a connection, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }
  
  console.log('Creating new MongoDB connection');
  
  // Get MongoDB connection string from environment variables
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-tracker';
  
  // Log that we're connecting (but hide credentials)
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
  
  try {
    // Connect to MongoDB with optimized settings for serverless environments
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });
    
    console.log('MongoDB connection established successfully');
    
    // Cache the connection
    cachedConnection = conn;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cachedConnection = null;
    });
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectToDatabase }; 