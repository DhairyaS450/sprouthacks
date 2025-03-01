# EcoReceipt - Sustainable Shopping Assistant

EcoReceipt is a web application that helps users make more sustainable shopping choices by analyzing their receipts and providing eco-friendly alternatives.

## Features

- Upload and analyze shopping receipts
- Get sustainability scores for products
- Discover eco-friendly alternatives
- Track your sustainability journey with a dashboard
- Compete on the eco-leaderboard

## Technologies Used

- Node.js and Express
- MongoDB for database
- Google's Gemini AI for sustainability analysis
- Tesseract.js for OCR (Optical Character Recognition)
- Bootstrap for UI
- Cloudinary for file storage in production

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/eco-receipt.git
   cd eco-receipt
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your credentials:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - (Optional) Cloudinary credentials if you want to test cloud storage locally

5. Start the development server
   ```
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## Deployment to Vercel

### Prerequisites

- Vercel account
- MongoDB Atlas account (for cloud database)
- Google Gemini API key
- Cloudinary account (for file storage)

### Deployment Steps

1. Install Vercel CLI
   ```
   npm install -g vercel
   ```

2. Login to Vercel
   ```
   vercel login
   ```

3. Deploy to Vercel
   ```
   vercel
   ```

4. Set up environment variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

5. Redeploy with production settings
   ```
   vercel --prod
   ```

## Cloudinary Integration

EcoReceipt uses Cloudinary for file storage in production environments. This ensures that receipt uploads work properly in serverless environments like Vercel.

### How It Works

1. The application checks for Cloudinary credentials at startup
2. If credentials are found, all file uploads are stored in Cloudinary
3. If credentials are not found, the application falls back to local storage (for development)

### Setting Up Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. From your dashboard, get your cloud name, API key, and API secret
3. Add these credentials to your environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Testing Cloudinary Locally

To test Cloudinary integration in your local development environment:

1. Add your Cloudinary credentials to your `.env` file
2. Restart the development server
3. Upload a receipt - it should now be stored in your Cloudinary account
4. You can verify this by checking the Cloudinary Media Library in your dashboard

## License

This project was created for SproutHacks and is available under the MIT License.

## Acknowledgements

- Created for SproutHacks
- Powered by Google's Gemini AI
- OCR functionality provided by Tesseract.js
- File storage powered by Cloudinary
