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

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
  res.render('index');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Upload route
app.get('/upload', (req, res) => {
  res.render('upload');
});

// Receipt detail route
app.get('/receipts/:id', async (req, res) => {
  try {
    const Receipt = require('./models/Receipt');
    const receipt = await Receipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).render('error', { 
        message: 'Receipt not found',
        error: { status: 404, stack: '' }
      });
    }
    
    // Helper function to determine score color
    const getScoreColor = (score) => {
      if (score >= 7) return 'success';
      if (score >= 4) return 'warning';
      return 'danger';
    };
    
    res.render('receipt-detail', { 
      receipt,
      getScoreColor
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).render('error', { 
      message: 'Error fetching receipt',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Error page route
app.get('/error', (req, res) => {
  res.render('error', { 
    message: req.query.message || 'An error occurred',
    error: { status: req.query.status || 500, stack: '' }
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: { status: 404, stack: '' }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: err.message || 'Something broke!',
    error: { status: 500, stack: process.env.NODE_ENV === 'development' ? err.stack : '' }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 