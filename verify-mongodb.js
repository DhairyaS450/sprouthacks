require('dotenv').config();

// Basic verification script for MongoDB connection string
function verifyMongoDBConnectionString() {
  const connectionString = process.env.MONGODB_URI;
  
  if (!connectionString) {
    console.error('❌ No MONGODB_URI found in environment variables!');
    console.log('Please set MONGODB_URI in your .env file or Vercel environment variables.');
    return false;
  }
  
  console.log('Found MONGODB_URI in environment variables.');
  
  // Hide credentials in logs
  const sanitizedString = connectionString.replace(/\/\/([^:]+):[^@]+@/, '//***:***@');
  console.log(`Connection string format: ${sanitizedString}`);
  
  // Basic format check
  if (!connectionString.startsWith('mongodb+srv://') && !connectionString.startsWith('mongodb://')) {
    console.error('❌ Invalid MongoDB connection string format!');
    console.log('MongoDB connection string should start with mongodb+srv:// (preferred for Atlas) or mongodb://');
    return false;
  }
  
  // Check for Atlas format
  if (connectionString.startsWith('mongodb+srv://')) {
    console.log('✅ Using MongoDB Atlas connection string (mongodb+srv://)');
  } else {
    console.log('⚠️ Not using MongoDB Atlas SRV format - this may cause issues with Atlas. Consider switching to mongodb+srv://');
  }
  
  // Check for username/password
  if (!connectionString.includes('@')) {
    console.error('❌ No authentication credentials found in connection string!');
    console.log('MongoDB Atlas requires username and password in the connection string.');
    return false;
  }
  
  // Check for database name
  if (!connectionString.includes('?') || connectionString.lastIndexOf('/') > connectionString.lastIndexOf('?')) {
    const dbName = connectionString.substring(
      connectionString.lastIndexOf('/') + 1,
      connectionString.includes('?') ? connectionString.lastIndexOf('?') : undefined
    );
    
    if (dbName) {
      console.log(`✅ Database name specified: ${dbName}`);
    } else {
      console.warn('⚠️ No database name specified in connection string.');
    }
  } else {
    console.warn('⚠️ Could not determine database name from connection string.');
  }
  
  // Check for connection options
  if (connectionString.includes('retryWrites=true')) {
    console.log('✅ retryWrites=true option is set');
  } else {
    console.warn('⚠️ retryWrites=true option not found - recommend adding this for Atlas');
  }
  
  if (connectionString.includes('w=majority')) {
    console.log('✅ w=majority option is set');
  } else {
    console.warn('⚠️ w=majority option not found - recommend adding this for Atlas');
  }
  
  console.log('\nMongoDB connection string format appears valid.');
  console.log('For a complete connection test, run: node src/utils/testMongoConnection.js');
  
  return true;
}

// Run the verification
verifyMongoDBConnectionString(); 