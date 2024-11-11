const axios = require('axios');
const { exec } = require('child_process');
const session = require('express-session')
const express = require('express');
const dotenv = require('dotenv');
const PlayHt = require('./playhtIntegration');
const PlayHTSDK = require('playht')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MediaRecorder = require('opus-media-recorder')

dotenv.config();

const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

const apiKey = 'cm352t7890033l20cvxmi4trw';

const convertOpusToOgg = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inputPath} -acodec libvorbis ${outputPath}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error converting file: ${stderr}`);
            } else {
                resolve(outputPath);
            }
        });
    });
};

app.use(cors());
app.use(express.json());
app.use('/upload', express.static('upload'));

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

        res.send({ clonedVoices: cvoices, availableVoices: voices });

    } catch (error) {
        console.error('Error fetching voices:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching voices');
    }
});

app.post('/generate-speech', async (req, res) => {
    const { text, voice } = req.body;
    console.log('Received text:', text);
    console.log('Selected voice ID:', voice);

    try {
        // call the PlayHt function with the selected voice
        const speechUrl = await PlayHt(text, voice);  // Assume this function returns the URL of the generated speech
        console.log('Generated speech URL:', speechUrl);

        // send both text and URL as a JSON response
        res.json({ text, speechUrl });
    } catch (error) {
        console.error('Error generating speech:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error generating speech. Please try again later.' });
        }
    }
});

app.post('/createvoice', upload.single('mp3file'), async (req, res) => {
    const { modelName, language, gender } = req.body; // get model name and gender from the form
    const mp3FilePath = req.file ? req.file.path : null; // get the uploaded mp3 file

    if (!mp3FilePath) {
        return res.status(400).send('No MP3 file uploaded');
    }

    console.log('Model name:', modelName);
    console.log('Language', language);
    console.log('Gender:', gender);

    const oggFilePath = path.join(path.dirname(mp3FilePath), `${path.basename(mp3FilePath, '.opus')}.ogg`);

    try {
        const convertedPath = await convertOpusToOgg(mp3FilePath, oggFilePath);


        const fileBlob = fs.readFileSync(convertedPath);
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
        res.json(voices);
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

// code for Musicfy API

app.get('/api/voices', (req, res) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    fetch('https://api.musicfy.lol/v1/voices?voice_types=parody', options)
        .then(response => response.json())
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/api/convert-voice', upload.single('file'), (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received voice ID:', req.body.voice_id);

    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.body.voice_id) {
        console.error('Voice ID missing');
        return res.status(400).json({ error: 'Voice ID missing' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });
    formData.append('voice_id', req.body.voice_id);

    const options = {
        method: 'POST',
        body: formData,
        headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${apiKey}`
        }
    };

    fetch('https://api.musicfy.lol/v1/convert-voice', options)
        .then(response => response.json())
        .then(data => {
            console.log('Data received from Muscify:', data);
            if (data && data[0] && data[0].file_url) {
                res.json(data);
            } else {
                res.status(400).json({ error: 'file_url not found in response', details: data });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// function to start the server
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

    // handle error if the port is already in use
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Killing the process and retrying...`);

            // lill the process that is using the port (for macOS/Linux)
            exec(`kill -9 $(lsof -t -i:${port})`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error killing process: ${error.message}`);
                    console.log(`Please exit and rerun the server`)
                    return;
                }

                console.log(`Process using port ${port} killed. Restarting server...`);
                startServer(port);  // restart the server on the same port
            });
        } else {
            console.error('Server error:', err);
        }
    });
};

// start the server on the default port
startServer(8080);