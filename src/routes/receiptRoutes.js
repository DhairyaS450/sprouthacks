const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const { analyzeReceiptWithGemini } = require('../utils/geminiUtils');
const { cloudinaryUpload, isCloudinaryConfigured, cloudinary } = require('../utils/cloudinaryConfig');

// Define uploads directory path (directory creation is handled in server.js)
const uploadsDir = path.join(__dirname, '../public/uploads');

// Set up multer for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const localUpload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jfif|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png) and PDFs are allowed!'));
  }
});

// Determine which upload middleware to use based on environment
const getUploadMiddleware = () => {
  if (isCloudinaryConfigured()) {
    console.log('Using Cloudinary for file uploads');
    return cloudinaryUpload;
  } else {
    console.log('Using local storage for file uploads');
    return localUpload;
  }
};

// Get all receipts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.params.userId }).sort({ analysisDate: -1 });
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific receipt
router.get('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ message: error.message });
  }
});

// Step 1: Upload a receipt and create a pending record
router.post('/upload', (req, res, next) => {
  const uploadMiddleware = getUploadMiddleware();
  uploadMiddleware.single('receipt')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file);
    console.log('User ID:', req.body.userId);

    // For demo purposes, if no userId is provided, use a default one
    const userId = req.body.userId || '65e5f8d0e4b0a1b2c3d4e5f6';

    // Determine the file path and image URL based on storage method
    let filePath;
    let imagePath;
    
    if (isCloudinaryConfigured() && req.file.path && req.file.path.includes('cloudinary')) {
      // Cloudinary storage
      filePath = req.file.path;
      imagePath = req.file.path;
    } else if (isCloudinaryConfigured() && req.file.secure_url) {
      // Cloudinary with multer-storage-cloudinary
      filePath = req.file.path || req.file.secure_url;
      imagePath = req.file.secure_url;
    } else {
      // Local storage
      filePath = req.file.path;
      imagePath = '/uploads/' + req.file.filename;
    }

    // Create a new receipt record with pending status
    const pendingReceipt = new Receipt({
      user: userId,
      imagePath: imagePath,
      products: [],
      overallScore: 0,
      carbonFootprint: 0,
      carbonFootprintDescription: '',
      status: 'pending',
      analysisDate: new Date()
    });

    // For demo purposes, if MongoDB is not connected, return a mock response
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, returning mock response');
      return res.status(201).json({
        _id: 'mock-receipt-id',
        user: userId,
        imagePath: imagePath,
        status: 'pending',
        message: 'Receipt uploaded successfully. Analysis in progress.',
        analysisDate: new Date()
      });
    }

    const savedReceipt = await pendingReceipt.save();
    
    // Start analysis in the background (non-blocking)
    processReceiptAnalysis(savedReceipt._id, filePath).catch(err => {
      console.error('Background analysis error:', err);
    });

    // Return immediately with the pending receipt
    res.status(201).json({
      ...savedReceipt.toObject(),
      message: 'Receipt uploaded successfully. Analysis in progress.'
    });
    
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Step 2: Check the status of a receipt analysis
router.get('/status/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    if (receipt.status === 'pending') {
      return res.json({
        status: 'pending',
        message: 'Analysis in progress. Please check back in a moment.'
      });
    } else if (receipt.status === 'completed') {
      return res.json({
        status: 'completed',
        receipt: receipt
      });
    } else {
      return res.json({
        status: 'failed',
        message: 'Analysis failed. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error checking receipt status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Background processing function (not exposed as an endpoint)
async function processReceiptAnalysis(receiptId, filePath) {
  try {
    console.log(`Starting background analysis for receipt ${receiptId}`);
    
    // Get the receipt from the database
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) {
      console.error(`Receipt ${receiptId} not found`);
      return;
    }
    
    // Analyze the receipt with Gemini
    let analysis;
    try {
      analysis = await analyzeReceiptWithGemini(filePath);
      console.log('Analysis result:', analysis);
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      // Use mock analysis if real analysis fails
      analysis = getMockAnalysis();
    }
    
    // Update the receipt with the analysis results
    receipt.products = analysis.products || [];
    receipt.overallScore = analysis.overallScore || 5;
    receipt.carbonFootprint = typeof analysis.carbonFootprint === 'number' ? analysis.carbonFootprint : 0;
    receipt.carbonFootprintDescription = typeof analysis.carbonFootprint === 'string' ? analysis.carbonFootprint : '';
    receipt.status = 'completed';
    
    await receipt.save();
    console.log(`Analysis completed for receipt ${receiptId}`);
  } catch (error) {
    console.error(`Error in background processing for receipt ${receiptId}:`, error);
    // Try to update the receipt status to failed
    try {
      await Receipt.findByIdAndUpdate(receiptId, { status: 'failed' });
    } catch (updateError) {
      console.error('Error updating receipt status:', updateError);
    }
  }
}

// Helper function for mock analysis when needed
function getMockAnalysis() {
  return {
    products: [
      {
        name: "Organic Bananas",
        price: 2.99,
        sustainabilityScore: 8,
        impact: "Organic bananas are grown without synthetic pesticides and fertilizers, reducing environmental impact.",
        alternatives: [
          {
            name: "Local Seasonal Fruit",
            link: "https://www.amazon.com/s?k=local+seasonal+fruit",
            description: "Choosing local seasonal fruit reduces transportation emissions."
          }
        ]
      },
      {
        name: "Plastic Water Bottles (24-pack)",
        price: 5.99,
        sustainabilityScore: 2,
        impact: "Single-use plastic bottles contribute significantly to plastic pollution and have a high carbon footprint.",
        alternatives: [
          {
            name: "Reusable Water Bottle",
            link: "https://www.amazon.com/s?k=reusable+water+bottle",
            description: "A reusable bottle eliminates the need for single-use plastics."
          },
          {
            name: "Water Filter Pitcher",
            link: "https://www.amazon.com/s?k=water+filter+pitcher",
            description: "Filter tap water at home instead of buying bottled water."
          }
        ]
      }
    ],
    overallScore: 5,
    carbonFootprint: 3.5,
    carbonFootprintDescription: "Estimated carbon footprint based on product types and quantities."
  };
}

module.exports = router; 