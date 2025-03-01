const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  impact: {
    type: String,
    default: ''
  },
  alternatives: [{
    name: String,
    link: String,
    description: String
  }]
});

const receiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  products: [productSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  carbonFootprint: {
    type: Number,
    default: 0
  },
  carbonFootprintDescription: {
    type: String,
    default: ''
  },
  analysisDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Receipt', receiptSchema); 
