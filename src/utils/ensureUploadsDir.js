const fs = require('fs');
const path = require('path');

/**
 * Ensures that the uploads directory exists
 * This is important for local file storage
 */
function ensureUploadsDirectory() {
  const uploadsDir = path.join(__dirname, '../public/uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory at:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully');
  } else {
    console.log('Uploads directory already exists at:', uploadsDir);
  }
}

module.exports = { ensureUploadsDirectory }; 