require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const receiptRoutes = require('./routes/receiptRoutes');
const userRoutes = require('./routes/userRoutes');

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
  .then(() => console.log('Connected to MongoDB'))
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 