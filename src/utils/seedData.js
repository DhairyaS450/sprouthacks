const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-tracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing without MongoDB connection');
  });

// Create default user
async function seedDefaultUser() {
  try {
    // Check if default user exists
    const existingUser = await User.findById('65e5f8d0e4b0a1b2c3d4e5f6');
    
    if (existingUser) {
      console.log('Default user already exists');
      return existingUser;
    }
    
    // Create new user with specific ID
    const defaultUser = new User({
      _id: '65e5f8d0e4b0a1b2c3d4e5f6',
      username: 'EcoUser',
      email: 'user@ecotracker.com',
      password: 'password123', // In a real app, this would be hashed
      ecoPoints: 150
    });
    
    await defaultUser.save();
    console.log('Default user created successfully');
    return defaultUser;
  } catch (error) {
    console.error('Error creating default user:', error);
    
    // Return a mock user for demo purposes
    return {
      _id: '65e5f8d0e4b0a1b2c3d4e5f6',
      username: 'EcoUser',
      email: 'user@ecotracker.com',
      ecoPoints: 150
    };
  }
}

// Create some sample users for the leaderboard
async function seedLeaderboardUsers() {
  try {
    const count = await User.countDocuments();
    
    // Only seed if we have fewer than 5 users
    if (count >= 5) {
      console.log('Leaderboard users already exist');
      return;
    }
    
    const leaderboardUsers = [
      {
        username: 'GreenGuru',
        email: 'guru@ecotracker.com',
        password: 'password123',
        ecoPoints: 230
      },
      {
        username: 'EcoWarrior',
        email: 'warrior@ecotracker.com',
        password: 'password123',
        ecoPoints: 185
      },
      {
        username: 'SustainableShopper',
        email: 'shopper@ecotracker.com',
        password: 'password123',
        ecoPoints: 120
      },
      {
        username: 'PlanetProtector',
        email: 'protector@ecotracker.com',
        password: 'password123',
        ecoPoints: 95
      }
    ];
    
    // Check if each user exists before creating
    for (const userData of leaderboardUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created leaderboard user: ${userData.username}`);
      } else {
        console.log(`Leaderboard user ${userData.username} already exists`);
      }
    }
    
    console.log('Leaderboard users setup completed');
  } catch (error) {
    console.error('Error creating leaderboard users:', error);
  }
}

// Export functions to be used in server.js
module.exports = {
  seedDefaultUser,
  seedLeaderboardUsers
}; 