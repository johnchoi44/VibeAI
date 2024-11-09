import React, { useState, useEffect } from 'react';
import axios from "axios";

function SpeechPage() {
    const [clonedVoices, setClonedVoices] = useState([]);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('');
    const [speechUrl, setSpeechUrl] = useState('');
    const [loading, setLoading] = useState(false); // New loading state

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
        console.log('Text:', text);
        console.log('Selected Voice ID:', selectedVoice);

        setLoading(true); // Set loading to true when starting the request
        setSpeechUrl(''); // Clear the previous URL

        try {
            const response = await axios.post('http://localhost:8080/generate-speech', 
                { text, voice: selectedVoice }, 
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log('Generated Speech URL:', response.data.speechUrl);
            setSpeechUrl(response.data.speechUrl);
        } catch (error) {
            console.error('Error generating speech:', error);
        } finally {
            setLoading(false); // Set loading to false when the request completes
        }
    };

    return (
        <div>
            <h1>Select a Voice</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="text">Enter Text:</label><br />
                <textarea 
                    id="text" 
                    name="text" 
                    rows="4" 
                    cols="50" 
                    placeholder="Enter the text you want to convert to speech"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                ></textarea><br /><br />
  
                <label htmlFor="voice">Select Voice:</label><br />
                <select 
                    id="voice" 
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
  
                <button type="submit" disabled={!selectedVoice}>Generate Speech</button>
            </form><br />

            {/* Show loading message while speech is being generated */}
            {loading && <p>Generating speech, please wait...</p>}
  
            {/* Display the generated speech when available */}
            {speechUrl && !loading && (
                <div>
                    <h1>Speech Generated</h1><br />
                    <p>Text: {text}</p><br />
                    <audio controls>
                        <source src={speechUrl} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio><br /><br />
                </div>
            )}

            <a href="/createmodel">
                <button>Create Voice Model</button>
            </a>
            <br /><br />
            <a href="/cloned-voices">
                <button>Manage Cloned Voices</button>
            </a> <br /><br />

            <a href="/">
                <button>Home</button>
            </a>
        </div>
    );
}

export default SpeechPage;
