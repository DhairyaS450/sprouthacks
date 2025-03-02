const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeProductWithGemini } = require('../utils/geminiUtils');
const { cloudinaryUpload, isCloudinaryConfigured, cloudinary } = require('../utils/cloudinaryConfig');

// Define uploads directory path
const uploadsDir = path.join(__dirname, '../public/uploads');

// Set up multer for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'product-' + Date.now() + '-' + file.originalname);
  }
});

const localUpload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jfif|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png) are allowed!'));
  }
});

// Determine which upload middleware to use based on environment
const getUploadMiddleware = () => {
  if (isCloudinaryConfigured()) {
    console.log('Using Cloudinary for product image uploads');
    return cloudinaryUpload;
  } else {
    console.log('Using local storage for product image uploads');
    return localUpload;
  }
};

// Analyze product from image
router.post('/analyze', getUploadMiddleware().single('image'), async (req, res) => {
  try {
    console.log('Product image uploaded, analyzing...');
    
    let imagePath;
    if (req.file.path) {
      // Local file path
      imagePath = req.file.path;
    } else if (req.file.secure_url) {
      // Cloudinary URL
      imagePath = req.file.secure_url;
    } else {
      throw new Error('No file path or URL available');
    }
    
    // For demo purposes, return mock data immediately
    // In production, you would call the Gemini API here
    // const mockProductAnalysis = getMockProductAnalysis();
    
    // res.json(mockProductAnalysis);
    
    // Uncomment this for real implementation with Gemini API
    
    // Process the product analysis asynchronously
    const analysis = await analyzeProductWithGemini(imagePath);
    
    if (!analysis) {
      throw new Error('Failed to analyze product');
    }
    
    res.json(analysis);
    
  } catch (error) {
    console.error('Error analyzing product:', error);
    res.status(500).json({ 
      error: 'Failed to analyze product', 
      message: error.message 
    });
  }
});

/**
 * Generate a mock product analysis for demo purposes
 * @returns {Object} - Mock product analysis results
 */
function getMockProductAnalysis() {
  // Randomly select one of several mock products
  const mockProducts = [
    {
      name: "Plastic Water Bottle",
      sustainabilityScore: 3,
      impact: "Single-use plastic water bottles have a significant environmental impact due to plastic pollution and high carbon footprint from production and transportation.",
      alternatives: [
        {
          name: "Reusable Stainless Steel Water Bottle",
          link: "https://www.amazon.com/s?k=stainless+steel+water+bottle",
          description: "Reusable bottles reduce plastic waste and have a lower lifetime carbon footprint."
        },
        {
          name: "Glass Water Bottle with Silicone Sleeve",
          link: "https://www.amazon.com/s?k=glass+water+bottle+with+sleeve",
          description: "Glass is infinitely recyclable and doesn't leach chemicals into your water."
        }
      ]
    },
    {
      name: "Conventional Bananas",
      sustainabilityScore: 6,
      impact: "Conventional bananas use pesticides and have a carbon footprint from transportation, but are still relatively low-impact compared to many foods.",
      alternatives: [
        {
          name: "Organic Fair Trade Bananas",
          link: "https://www.amazon.com/s?k=organic+fair+trade+bananas",
          description: "Organic farming reduces pesticide use, while fair trade ensures better conditions for workers."
        }
      ]
    },
    {
      name: "Paper Towels",
      sustainabilityScore: 4,
      impact: "Paper towels create significant waste and require trees, water, and energy to produce. They're used once and then discarded.",
      alternatives: [
        {
          name: "Reusable Bamboo Towels",
          link: "https://www.amazon.com/s?k=reusable+bamboo+towels",
          description: "These can be washed and reused multiple times, reducing waste and saving money."
        },
        {
          name: "Swedish Dishcloths",
          link: "https://www.amazon.com/s?k=swedish+dishcloths",
          description: "Biodegradable, highly absorbent, and can replace up to 17 rolls of paper towels."
        }
      ]
    },
    {
      name: "Laundry Detergent (Plastic Bottle)",
      sustainabilityScore: 3,
      impact: "Traditional liquid detergents come in plastic bottles and often contain chemicals harmful to aquatic life. They're heavy to transport, increasing carbon emissions.",
      alternatives: [
        {
          name: "Eco-Friendly Laundry Detergent Sheets",
          link: "https://www.amazon.com/s?k=laundry+detergent+sheets+eco+friendly",
          description: "Lightweight, zero-plastic packaging, and biodegradable formulas reduce environmental impact."
        },
        {
          name: "Refillable Laundry Detergent",
          link: "https://www.amazon.com/s?k=refillable+laundry+detergent",
          description: "Reduces plastic waste by allowing you to refill the same container."
        }
      ]
    }
  ];
  
  // Return a random product from the mock list
  return mockProducts[Math.floor(Math.random() * mockProducts.length)];
}

module.exports = router; 