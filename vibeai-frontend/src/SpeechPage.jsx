import React, { useState, useEffect } from 'react';
import axios from "axios";
import './speech.css';

function SpeechPage() {
    const [clonedVoices, setClonedVoices] = useState([]);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('');
    const [speechUrl, setSpeechUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchAPI = async () => {
        const response = await axios.get("http://localhost:8080/");
        setClonedVoices(response.data.clonedVoices);
        setAvailableVoices(response.data.availableVoices); 
    };

    useEffect(() => {
        fetchAPI();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSpeechUrl('');

        try {
            const response = await axios.post('http://localhost:8080/generate-speech', 
                { text, voice: selectedVoice }, 
                { headers: { 'Content-Type': 'application/json' } }
            );
            setSpeechUrl(response.data.speechUrl);
        } catch (error) {
            console.error('Error generating speech:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="speech-page">
            <h1 className="page-title">Select a Voice</h1>
            <form className="speech-form" onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="text">Enter Text:</label><br />
                <textarea 
                    id="text" 
                    className="text-input" 
                    name="text" 
                    rows="4" 
                    cols="50" 
                    placeholder="Enter the text you want to convert to speech"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                ></textarea><br /><br />
  
                <label className="form-label" htmlFor="voice">Select Voice:</label><br />
                <select 
                    id="voice" 
                    className="voice-select" 
                    name="voice" 
                    value={selectedVoice} 
                    onChange={(e) => setSelectedVoice(e.target.value)}
                >
                    <option value="">-- Select a Voice --</option>
                    {clonedVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>Cloned - {voice.name} - {voice.gender}</option>
                    ))}
                    {availableVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>{voice.name} ({voice.language} - {voice.gender} - {voice.accent})</option>
                    ))}
                </select><br /><br />
  
                <button className="speech-generate-button" type="submit" disabled={!selectedVoice}>Generate Speech</button>
            </form><br />

            {loading && <p className="loading-text">Generating speech, please wait...</p>}
  
            {speechUrl && !loading && (
                <div className="speech-output">
                    <h1 className="output-title">Speech Generated</h1><br />
                    <p className="output-text">Text: {text}</p><br />
                    <audio className="audio-player" controls>
                        <source src={speechUrl} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio><br /><br />
                </div>
            )}

            <div className="button-container">
                <a href="/">
                    <button className="nav-button">Home</button>
                </a>
                <a href="/createmodel">
                    <button className="nav-button">Create Voice Model</button>
                </a>
                <a href="/cloned-voices">
                    <button className="nav-button">Manage Cloned Voices</button>
                </a>

            </div>
        </div>
    );
}

export default SpeechPage;
