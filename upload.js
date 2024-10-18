const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create an Express app
const app = express();

// Set the storage location and filename for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be saved to the 'uploads' folder
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Set the filename (you can customize this as needed)
    cb(null, Date.now() + path.extname(file.originalname)); // Append file extension
  }
});

// Set up multer to handle file uploads
const upload = multer({ storage: storage });

// Create an uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Define a GET route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the audio upload server! Use POST /upload-audio to upload an audio file.');
});

// Set up a POST route to handle the file upload
app.post('/upload-audio', upload.single('audio'), (req, res) => {
  try {
    console.log('File uploaded successfully:', req.file);
    
    // You can now access the uploaded file via req.file
    const audioPath = req.file.path;

    res.send(`File uploaded successfully! File path: ${audioPath}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
