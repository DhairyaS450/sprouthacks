require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const receiptRoutes = require('./routes/receiptRoutes');
const userRoutes = require('./routes/userRoutes');

// Import seed data functions
const { seedDefaultUser, seedLeaderboardUsers } = require('./utils/seedData');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-tracker')
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