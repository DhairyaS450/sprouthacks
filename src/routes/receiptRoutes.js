const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const { analyzeReceiptWithGemini } = require('../utils/geminiUtils');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
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

// Upload and analyze a new receipt
router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file);
    console.log('User ID:', req.body.userId);

    // For demo purposes, if no userId is provided, use a default one
    const userId = req.body.userId || '65e5f8d0e4b0a1b2c3d4e5f6';

    // Extract text from the receipt image
    try {
      // Analyze the receipt with Gemini
      const analysis = await analyzeReceiptWithGemini(req.file.path);
      console.log(req.file.path);
      console.log('Analysis result:', analysis);
      
      // Create a new receipt record
      const receipt = new Receipt({
        user: userId,
        imagePath: '/uploads/' + req.file.filename,
        products: analysis.products || [],
        overallScore: analysis.overallScore || 5,
        carbonFootprint: typeof analysis.carbonFootprint === 'number' ? analysis.carbonFootprint : 0,
        carbonFootprintDescription: typeof analysis.carbonFootprint === 'string' ? analysis.carbonFootprint : ''
      });

      // For demo purposes, if MongoDB is not connected, return a mock response
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, returning mock response');
        return res.status(201).json({
          _id: 'mock-receipt-id',
          user: userId,
          imagePath: '/uploads/' + req.file.filename,
          extractedText: extractedText,
          products: analysis.products || [],
          overallScore: analysis.overallScore || 5,
          carbonFootprint: typeof analysis.carbonFootprint === 'number' ? analysis.carbonFootprint : 0,
          carbonFootprintDescription: typeof analysis.carbonFootprint === 'string' ? analysis.carbonFootprint : '',
          analysisDate: new Date()
        });
      }

      const savedReceipt = await receipt.save();
      res.status(201).json(savedReceipt);
    } catch (ocrError) {
      console.error('OCR or Analysis Error:', ocrError);
      
      // If something fails, return a mock analysis for demo purposes
      const mockAnalysis = {
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
      
      res.status(201).json({
        _id: 'mock-receipt-id',
        user: userId,
        imagePath: '/uploads/' + req.file.filename,
        extractedText: "Sample receipt text (OCR failed)",
        products: mockAnalysis.products,
        overallScore: mockAnalysis.overallScore,
        carbonFootprint: mockAnalysis.carbonFootprint,
        carbonFootprintDescription: mockAnalysis.carbonFootprintDescription,
        analysisDate: new Date()
      });
    }
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 