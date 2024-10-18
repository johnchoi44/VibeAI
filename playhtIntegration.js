const axios = require('axios');

const PlayHt = async (prompt) => {
    try {
        console.log('Sending request to Play.ht with prompt:', prompt);

        const url = 'https://api.play.ht/api/v2/tts';
        const data = {
            text: prompt,
            voice: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
            output_format: 'mp3',
            voice_engine: 'PlayHT2.0'
        };
        const headers = {
            accept: 'text/event-stream',
            'content-type': 'application/json',
            AUTHORIZATION: process.env.PLAY_HT_API_KEY,
            'X-USER-ID': process.env.PLAY_HT_X_USER_ID,
        };
        const response = await axios.post(url, data, { headers });

        console.log('Play.ht response:', response.data);

        const speech_url = `${response.data.split(`"url":"`)[1].split(`mp3`)[0]}mp3`;
        return speech_url;
    } catch (error) {
        console.error('Error generating speech:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate speech');
    }
};

module.exports = PlayHt;
