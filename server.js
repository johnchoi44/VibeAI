const axios = require('axios');
const { exec } = require('child_process');
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
        <h1>Play.ht Feature for Tech2Speech Integration</h1>
        <form action="/generate-speech" method="POST">
            <label for="text">Enter Text:</label><br>
            <textarea id="text" name="text" rows="4" cols="50" placeholder="Enter the text you want to convert to speech"></textarea><br><br>
            <button type="submit">Generate Speech</button>
        </form>
    `);
});

// Route to handle the form submission and Play.ht integration
app.post('/generate-speech', async (req, res) => {
    const { text, voice } = req.body;  // Get the text and selected voice from the form
    console.log('Received text:', text);
    console.log('Selected voice ID:', voice);  // Log the selected voice for debugging

    try {
        // Call the PlayHt function with the selected voice
        const speechUrl = await PlayHt(text, voice);  // Pass the voice to PlayHt function
        console.log('Generated speech URL:', speechUrl);

        res.send(`
            <h1>Speech Generated</h1>
            <p>Text: ${text}</p>
            <audio controls>
                <source src="${speechUrl}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
            <br>
            <a href="/voices">Go back to select another voice</a>
        `);
    } catch (error) {
        console.error('Error generating speech:', error);
        if (!res.headersSent) {
            res.status(500).send('Error generating speech. Please try again later.');
        }
    }
});


app.get('/voices', async (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api.play.ht/api/v2/voices',
        headers: {
            accept: 'application/json',
            AUTHORIZATION: process.env.PLAY_HT_API_KEY,
            'X-USER-ID': process.env.PLAY_HT_X_USER_ID,
        },
    };

    try {
        const response = await axios.request(options);
        const voices = response.data;

        // Build a form with a dropdown of voices
        let voicesHtml = `
            <h1>Select a Voice</h1>
            <form action="/generate-speech" method="POST">
                <label for="text">Enter Text:</label><br>
                <textarea id="text" name="text" rows="4" cols="50" placeholder="Enter the text you want to convert to speech"></textarea><br><br>

                <label for="voice">Select Voice:</label><br>
                <select id="voice" name="voice">
        `;

        // Populate the dropdown with the available voices
        voices.forEach(voice => {
            voicesHtml += `
                <option value="${voice.id}">${voice.name} (${voice.language} - ${voice.gender} - ${voice.accent})</option>
            `;
        });

        voicesHtml += `
                </select><br><br>
                <button type="submit">Generate Speech</button>
            </form>
            <br><a href="/">Go back</a>
        `;

        res.send(voicesHtml);

    } catch (error) {
        console.error('Error fetching voices:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching voices');
    }
});



app.get('/cvoices', async (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api.play.ht/api/v2/cloned-voices',
        headers: {
            accept: 'application/json',
            AUTHORIZATION: process.env.PLAY_HT_API_KEY,
            'X-USER-ID': process.env.PLAY_HT_X_USER_ID,
        },
    };

    try {
        const response = await axios.request(options);

        // Extract the list of voices from the response
        const voices = response.data;

        // Generate an HTML string to display the voices
        let voicesHtml = `
            <h1>Available Voices</h1>
            <ul>
        `;

        voices.forEach(voice => {
            voicesHtml += `
                <li>
                    <strong>Name:</strong> ${voice.name}<br>
                    <strong>Language:</strong> ${voice.language}<br>
                    <strong>Gender:</strong> ${voice.gender}<br><br>
                </li>
            `;
        });

        voicesHtml += '</ul><br><a href="/">Go back</a>';

        // Send the generated HTML to the client
        res.send(voicesHtml);

    } catch (error) {
        console.error('Error fetching voices:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching voices');
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
            console.error(`Port ${port} is already in use. Killing the process and retrying...`);

            // Kill the process that is using the port (for macOS/Linux)
            exec(`kill -9 $(lsof -t -i:${port})`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error killing process: ${error.message}`);
                    return;
                }

                console.log(`Process using port ${port} killed. Restarting server...`);
                startServer(port);  // Restart the server on the same port
            });
        } else {
            console.error('Server error:', err);
        }
    });
};

// Start the server on the default port
startServer(defaultPort);
