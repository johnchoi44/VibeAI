const axios = require('axios');

const PlayHt = async (prompt, voice) => {
    try {
        console.log('Sending request to Play.ht with prompt:', prompt);
        console.log('Using voice:', voice);  // Log the voice being used

        const url = 'https://api.play.ht/api/v2/tts';
        const data = {
            text: prompt,
            voice: voice,  // Use the selected voice here
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


const createModel = async (modelName) => {
    try {
        const option = {
            method: 'POST',
            url: 'https://api.play.ht/api/v2/cloned-voices/instant',
            headers: {
                aceept: 'application/json',
                'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
                AUTHORIZATION: process.env.PLAY_HT_API_KEY,
                'X-USER-ID': process.env.PLAY_HT_X_USER_ID
            },
            data: `-----011000010111000001101001\r\nContent-Disposition: form-data; name="voice_name"\r\n\r\n${modelName}\r\n-----011000010111000001101001--`
        }
        const response = await axios.request(option)
    } catch (error) {
        console.error('Error generating speech:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate speech');
    }
};



module.exports = PlayHt;
