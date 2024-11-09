import React, { useState } from 'react';
import axios from 'axios';

const SpeechGenerate = () => {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState('');
    const [speechUrl, setSpeechUrl] = useState('');
    const [error, setError] = useState('');

    const handleGenerateSpeech = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:8080/generate-speech', { text, voice });
            setSpeechUrl(response.data.speechUrl);
            setError('');
        } catch (err) {
            setError('Error generating speech. Please try again later.');
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <h1>Generate Speech</h1>
            <form onSubmit={handleGenerateSpeech}>
                <label>
                    Enter Text:
                    <textarea value={text} onChange={(e) => setText(e.target.value)} />
                </label>
                <label>
                    Select Voice:
                    <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                        {/* You can replace these options with actual voice options */}
                        <option value="voice1">Voice 1</option>
                        <option value="voice2">Voice 2</option>
                    </select>
                </label>
                <button type="submit">Generate Speech</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {speechUrl && (
                <div>
                    <h2>Speech Generated</h2>
                    <audio controls src={speechUrl}>
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
};

export default SpeechGenerate;
