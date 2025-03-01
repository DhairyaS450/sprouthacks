# EcoReceipt - AI-Powered Sustainability Tracker

A web application that allows users to upload receipts (images or text) and uses Google's Gemini AI to analyze purchases for sustainability impact, offering eco-friendly product alternatives.

Created during the SproutHacks 2025 hackathon in 36 hours.

## Features

- **Receipt Upload & OCR Extraction**: Upload an image/PDF of a receipt and extract text using OCR
- **Sustainability Analysis**: Gemini AI identifies non-sustainable purchases and gives a sustainability rating
- **Eco-Friendly Product Recommendations**: Suggests sustainable alternatives with links to purchase
- **User Profile & History**: View past receipt analyses and track sustainability progress
- **Gamification**: Earn "eco points" for sustainable purchases and compete on the leaderboard
- **Carbon Footprint Calculation**: Estimate CO₂ impact of purchases

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI**: Google Gemini API
- **OCR**: Tesseract.js
- **Authentication**: (Basic implementation for demo)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/eco-tracker.git
   cd eco-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Start the application:
   ```
   npm start
   ```

5. For development with auto-restart:
   ```
   npm run dev
   ```

## Project Structure

```
eco-tracker/
├── src/
│   ├── controllers/    # Route controllers
│   ├── models/         # MongoDB models
│   ├── public/         # Static assets
│   │   ├── css/        # Stylesheets
│   │   ├── js/         # Client-side JavaScript
│   │   └── uploads/    # Uploaded receipts
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── views/          # EJS templates
│   └── server.js       # Main application file
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## API Endpoints

- `GET /api/users/:id` - Get user profile
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `GET /api/users/leaderboard/top` - Get top users by eco points
- `GET /api/receipts/user/:userId` - Get all receipts for a user
- `GET /api/receipts/:id` - Get a specific receipt
- `POST /api/receipts/upload` - Upload and analyze a new receipt

## Future Enhancements

- Mobile app version
- Social sharing features
- Integration with grocery store loyalty programs
- Barcode scanning for in-store sustainability checks
- Monthly sustainability reports and challenges

## License

This project is licensed under the MIT License - see the LICENSE file for details.
