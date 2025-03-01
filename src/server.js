require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const maxDuration = 60; // 5 minutes

// Import routes
const receiptRoutes = require('./routes/receiptRoutes');
const userRoutes = require('./routes/userRoutes');

// Import seed data functions
const { seedDefaultUser, seedLeaderboardUsers } = require('./utils/seedData');

// Import Cloudinary configuration
const { isCloudinaryConfigured } = require('./utils/cloudinaryConfig');

// Import uploads directory utility
const { ensureUploadsDirectory } = require('./utils/ensureUploadsDir');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
ensureUploadsDirectory();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Check Cloudinary configuration
if (isCloudinaryConfigured()) {
  console.log('Cloudinary is configured and ready for file uploads');
} else {
  console.log('Cloudinary is not configured. Using local file storage for uploads.');
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-tracker';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Seed the database with default data
    seedDefaultUser().then(() => {
      seedLeaderboardUsers();
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing without MongoDB connection. Some features may not work.');
  });

// Routes
app.use('/api/receipts', receiptRoutes);
app.use('/api/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
});

// Upload route
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/upload.html'));
});

// Receipt detail route
app.get('/receipts/:id', async (req, res) => {
  try {
    // Redirect to the HTML page with the ID as a query parameter
    res.redirect(`/html/receipt-detail.html?id=${req.params.id}`);
  } catch (error) {
    console.error('Error redirecting to receipt detail:', error);
    res.status(500).sendFile(path.join(__dirname, 'public/html/error.html'));
  }
});

// Error page route
app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/error.html'));
});

// 404 route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/html/error.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public/html/error.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 