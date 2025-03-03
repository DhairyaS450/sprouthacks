const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: { 
      unique: true,
      partialFilterExpression: { username: { $exists: true } }
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: { 
      unique: true,
      partialFilterExpression: { email: { $exists: true } }
    }
  },
  password: {
    type: String,
    required: true
  },
  ecoPoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  preferences: {
    type: Map,
    of: String,
    default: {}
  },
  token: {
    type: String,
    default: null,
    sparse: true // This allows multiple null values
  }
});

// Add save pre-hook to handle potential duplicate key errors gracefully
userSchema.pre('save', async function(next) {
  try {
    // Check if this is a new user
    if (this.isNew) {
      // Check for existing users with same username or email
      const existingUser = await mongoose.model('User').findOne({
        $or: [
          { username: this.username },
          { email: this.email }
        ]
      }).lean();
      
      if (existingUser) {
        if (existingUser.username === this.username) {
          return next(new Error('Username already exists'));
        }
        if (existingUser.email === this.email) {
          return next(new Error('Email already exists'));
        }
      }
    }
    next();
  } catch (error) {
    // If there's an error, continue without validation
    // This helps prevent timeouts in serverless environments
    console.warn('User validation error:', error);
    next();
  }
});

module.exports = mongoose.model('User', userSchema); 