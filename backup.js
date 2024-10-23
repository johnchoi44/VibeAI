const axios = require('axios');

const PlayHt = async (prompt, voice) => {
    try {
        console.log('Sending request to Play.ht with prompt:', prompt);
        console.log('Using voice:', voice);  // Log the voice being used

        const url = 'https://api.play.ht/api/v2/tts';
        const data = {
            text: prompt,
            voice: voice.id,  // Use the selected voice here
            output_format: 'mp3',
            voice_engine: 'PlayHT2.0'
        };
        const headers = {
            accept: 'application/json',
            'content-type': 'application/json',
            AUTHORIZATION: process.env.PLAY_HT_API_KEY,
            'X-USER-ID': process.env.PLAY_HT_X_USER_ID,
        };

        const response = await axios.post(url, data, { headers });
        console.log('Play.ht response:', response.data);

        const speech_url = response.data.audio_url;  // Get the audio URL from the API response
        return speech_url;
    } catch (error) {
        console.error('Error generating speech:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate speech');
    }
};

module.exports = PlayHt;
