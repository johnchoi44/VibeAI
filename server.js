const axios = require('axios');
const { exec } = require('child_process');
const express = require('express');
const dotenv = require('dotenv');
const PlayHt = require('./playhtIntegration');
const PlayHTSDK = require('playht')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const defaultPort = process.env.PORT || 3000;

// middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// serve static files like css
app.use(express.static('public'));

// set multer for file uploads
const upload = multer({ dest: 'upload/'})

app.get('/', async (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api.play.ht/api/v2/voices',
        headers: {
            accept: 'application/json',
            AUTHORIZATION: process.env.PLAY_HT_API_KEY,
            'X-USER-ID': process.env.PLAY_HT_X_USER_ID,
        },
    };

    const options2 = {
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
        const response2 = await axios.request(options2);
        const voices = response.data;
        const cvoices = response2.data;

        // build a form with a dropdown of voices
        let voicesHtml = `
            <h1>Select a Voice</h1>
            <form action="/generate-speech" method="POST">
                <label for="text">Enter Text:</label><br>
                <textarea id="text" name="text" rows="4" cols="50" placeholder="Enter the text you want to convert to speech"></textarea><br><br>

                <label for="voice">Select Voice:</label><br>
                <select id="voice" name="voice">
        `;

        // populate the dropdown with the available voices
        cvoices.forEach(voice => {
            voicesHtml += `
                <option value="${voice.id}">Cloned - ${voice.name} - ${voice.gender}</option>
            `;
        });

        voices.forEach(voice => {
            voicesHtml += `
                <option value="${voice.id}">${voice.name} (${voice.language} - ${voice.gender} - ${voice.accent}</option>
            `;
        });

        voicesHtml += `
                </select><br><br>
                <button type="submit">Generate Speech</button>
            </form>
            <a href="/createmodel">
                <button>Create Voice Model</button>
            </a>
            <br><br>
            <a href="/cloned-voices">
                <button>Manage Cloned Voices</button>
            </a>
        `;

        res.send(voicesHtml);

    } catch (error) {
        console.error('Error fetching voices:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching voices');
    }
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
            <a href="/">Go back to select another voice</a>
        `);
    } catch (error) {
        console.error('Error generating speech:', error);
        if (!res.headersSent) {
            res.status(500).send('Error generating speech. Please try again later.');
        }
    }
});

app.get('/createmodel', (req, res) => {
    // build a form with file upload and input and model name and gender
    let cloneHtml = `
        <h1>Upload MP3 File to Clone a Voice</h1>
        <form action="/createvoice" method="POST" enctype="multipart/form-data">
            <label for="modelName">Model Name:</label>
            <input type="text" id="modelName" name="modelName" placehlder="Enter model name" required><br><br>

            <label for="language">Select Langauge:</label>
            <select id="language" name="language" required>
                <option value="en-US">English</option>
                <option value="ko-KR">Korean</option>
                <option value="zh-CN">Chinese</option>
                <option value="es-ES">Spanish</option>
            </select><br><br>

            <label for="gender">Gender:</label>
            <select id="gender" name="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select><br><br>

            <label for="mp3file">Upload MP3 File:</label>
            <input type="file" id="mp3file" name="mp3file" accept=".mp3" required><br><br>

            <button type="submit">Create Model</button>
        </form>
        <br><a href="/">Go back</a>
    `;

    res.send(cloneHtml);
});

// route to handle voice cloning
app.post('/createvoice', upload.single('mp3file'), async (req, res) => {
    const { modelName, language, gender } = req.body; // get model name and gender from the form
    const mp3FilePath = req.file ? req.file.path : null; // get the uploaded mp3 file

    if (!mp3FilePath) {
        return res.status(400).send('No MP3 file uploaded');
    }

    console.log('Model name:', modelName);
    console.log('Language', language);
    console.log('Gender:', gender);

    try {
        const fileBlob = fs.readFileSync(mp3FilePath);
        const clonedVoice = await PlayHTSDK.clone(modelName, fileBlob, gender);

        console.log('Cloned voice info\n', JSON.stringify(clonedVoice, null, 2));

        res.send(`
            <h1>Voice Model Created Successfully</h1>
            <p>Model Name: ${modelName}</p>
            <p>Language: ${language}</p>
            <p>Gender: ${gender}</p>
            <p>Cloned Voice ID: ${clonedVoice.id}</p>
            <br>
            <a href="/createmodel">Create Another Voice Model</a>
            <br><a href="/">Go Generate Speech</a>
        `);
    } catch (error) {
        console.error('Error creating voice model:', error);
        if (!res.headersSent) {
            res.status(500).send('Error creating model. Please try again later.');
        }
    }
});

app.get('/cloned-voices', async (req, res) => {
    try {
        // fetch cloned voices
        const voices = await PlayHTSDK.listVoices({ isCloned: true });

        // Generate HTML to display voices with delete buttons
        let voicesHtml = `
            <h1>Cloned Voices</h1>
            <ul>
        `;

        voices.forEach(voice => {
            voicesHtml += `
                <li>
                    <strong>Name:</strong> ${voice.name} (${voice.language} - ${voice.gender})<br>
                    <form action="/delete-voice" method="POST">
                        <input type="hidden" name="cloneId" value="${voice.id}">
                        <button type="submit">Delete Model</button>
                    </form>
                </li><br>
            `;
        });

        voicesHtml += '</ul><br><a href="/">Go back</a>';

        // Send the generated HTML to the client
        res.send(voicesHtml);
    } catch (error) {
        console.error('Error fetching cloned voices:', error);
        res.status(500).send('Error fetching cloned voices');
    }
});

app.post('/delete-voice', async (req, res) => {
    const { cloneId } = req.body;  // Get the cloneId from the form submission

    try {
        // Delete the selected voice model
        const message = await PlayHTSDK.deleteClone(cloneId);
        console.log('deleteClone result message:', message);

        // Redirect back to the list of cloned voices after deletion
        res.redirect('/cloned-voices');
    } catch (error) {
        console.error('Error deleting cloned voice:', error);
        res.status(500).send('Error deleting cloned voice');
    }
});


// Function to start the server
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${server.address().port}`);
    });

    PlayHTSDK.init({
        apiKey: process.env.PLAY_HT_API_KEY,
        userId: process.env.PLAY_HT_X_USER_ID,
        defaultVoiceId: 's3://voice-cloning-zero-shot/d82d246c-148b-457f-9668-37b789520891/adolfosaad/manifest.json',
        defaultVoiceEngine: 'PlayHT2.0',
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
