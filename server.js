const express = require('express');
const dotenv = require('dotenv');
const PlayHt = require('./playhtIntegration');
dotenv.config();

const app = express();
const defaultPort = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files like CSS (optional)
app.use(express.static('public'));

// Route for the homepage
app.get('/', (req, res) => {
    res.send(`
        <h1>Test Play.ht Integration</h1>
        <form action="/generate-speech" method="POST">
            <label for="text">Enter Text:</label><br>
            <textarea id="text" name="text" rows="4" cols="50" placeholder="Enter the text you want to convert to speech"></textarea><br><br>
            <button type="submit">Generate Speech</button>
        </form>
    `);
});

// Route to handle the form submission and Play.ht integration
app.post('/generate-speech', async (req, res) => {
    const { text } = req.body;
    console.log('Received text:', text);  // Log the received text
    
    try {
        // Call the PlayHt function to generate speech
        const speechUrl = await PlayHt(text);
        console.log('Generated speech URL:', speechUrl);  // Log the URL
        
        // Send the response only once
        return res.send(`
            <h1>Speech Generated</h1>
            <p>Text: ${text}</p>
            <audio controls>
                <source src="${speechUrl}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
            <br>
            <a href="/">Go back</a>
        `);
    } catch (error) {
        // Ensure that this is the only response in case of an error
        console.error('Error occurred in /generate-speech route:', error);
        
        // If an error occurs, make sure we only send one response
        if (!res.headersSent) {  // Check if headers have already been sent
            return res.status(500).send('Error generating speech. Please try again later.');
        }
    }
});


// Function to start the server
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${server.address().port}`);
    });

    // Handle error if the port is already in use
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Trying another port...`);
            // Start on a random available port
            startServer(0);
        } else {
            console.error('Server error:', err);
        }
    });
};

// Start the server on the default port
startServer(defaultPort);
