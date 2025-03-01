const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
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

module.exports = mongoose.model('User', userSchema); 