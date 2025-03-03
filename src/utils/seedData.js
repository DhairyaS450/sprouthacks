const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Create default user
async function seedDefaultUser() {
  try {
    console.log('Attempting to seed default user...');
    
    // Use a timeout promise to avoid hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 30000);
    });
    
    // Check if default user exists with a timeout
    const existingUserPromise = User.findById('65e5f8d0e4b0a1b2c3d4e5f6').lean().exec();
    let existingUser;
    
    try {
      existingUser = await Promise.race([existingUserPromise, timeoutPromise]);
    } catch (error) {
      console.warn('Timeout or error checking for default user:', error.message);
      return getMockDefaultUser();
    }
    
    if (existingUser) {
      console.log('Default user already exists');
      return existingUser;
    }
    
    // Create new user with specific ID
    const defaultUser = new User({
      _id: '65e5f8d0e4b0a1b2c3d4e5f6',
      username: 'EcoUser',
      email: 'user@EcoReceipt.com',
      password: 'password123', // In a real app, this would be hashed
      ecoPoints: 150
    });
    
    // Save with timeout
    try {
      await Promise.race([defaultUser.save(), timeoutPromise]);
      console.log('Default user created successfully');
      return defaultUser;
    } catch (error) {
      console.warn('Timeout or error saving default user:', error.message);
      return getMockDefaultUser();
    }
  } catch (error) {
    console.error('Error creating default user:', error);
    return getMockDefaultUser();
  }
}

// Create some sample users for the leaderboard
async function seedLeaderboardUsers() {
  try {
    console.log('Attempting to seed leaderboard users...');
    
    // Use a timeout promise to avoid hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 30000);
    });
    
    // Check count with timeout
    let count;
    try {
      const countPromise = User.countDocuments().exec();
      count = await Promise.race([countPromise, timeoutPromise]);
    } catch (error) {
      console.warn('Timeout or error checking user count:', error.message);
      // Continue with seeding as we can't determine count
      count = 0;
    }
    
    // Only seed if we have fewer than 5 users
    if (count >= 5) {
      console.log('Leaderboard users already exist');
      return;
    }
    
    const leaderboardUsers = [
      {
        username: 'GreenGuru',
        email: 'guru@EcoReceipt.com',
        password: 'password123',
        ecoPoints: 230
      },
      {
        username: 'EcoWarrior',
        email: 'warrior@EcoReceipt.com',
        password: 'password123',
        ecoPoints: 185
      },
      {
        username: 'SustainableShopper',
        email: 'shopper@EcoReceipt.com',
        password: 'password123',
        ecoPoints: 120
      },
      {
        username: 'PlanetProtector',
        email: 'protector@EcoReceipt.com',
        password: 'password123',
        ecoPoints: 95
      }
    ];
    
    // Create users in parallel rather than serially to improve performance
    const userCreationPromises = leaderboardUsers.map(async (userData) => {
      try {
        // Check if user exists with timeout
        const findPromise = User.findOne({ username: userData.username }).lean().exec();
        const existingUser = await Promise.race([findPromise, timeoutPromise]);
        
        if (!existingUser) {
          const user = new User(userData);
          await Promise.race([user.save(), timeoutPromise]);
          console.log(`Created leaderboard user: ${userData.username}`);
        } else {
          console.log(`Leaderboard user ${userData.username} already exists`);
        }
      } catch (error) {
        console.warn(`Error with leaderboard user ${userData.username}:`, error.message);
      }
    });
    
    // Execute all user creation promises in parallel
    await Promise.allSettled(userCreationPromises);
    console.log('Leaderboard users setup completed');
  } catch (error) {
    console.error('Error creating leaderboard users:', error);
  }
}

// Helper function to get a mock default user
function getMockDefaultUser() {
  console.log('Returning mock default user');
  return {
    _id: '65e5f8d0e4b0a1b2c3d4e5f6',
    username: 'EcoUser',
    email: 'user@EcoReceipt.com',
    ecoPoints: 150
  };
}

// Export functions to be used in server.js
module.exports = {
  seedDefaultUser,
  seedLeaderboardUsers
}; 