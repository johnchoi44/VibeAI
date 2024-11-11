import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './aisongcovergenerator.css';

const AISongCoverGenerator = () => {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [file, setFile] = useState(null);
    const [audioUrl, setAudioUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/api/voices')
            .then(response => response.json())
            .then(data => setVoices(data))
            .catch(err => console.error('Error fetching voices:', err));
    }, []);

    const handleVoiceChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setSelectedVoice({
            id: selectedOption.value,
            artist: selectedOption.textContent
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleGenerateCover = () => {
        if (!file || !selectedVoice.id) {
            alert('Please select a file and a voice.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('voice_id', selectedVoice.id);

        fetch('http://localhost:8080/api/convert-voice', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0 && data[0].file_url) {
                    setAudioUrl(data[0].file_url);
                    setError('');
                } else {
                    setError('Audio file not generated.');
                    console.error('File URL not found in server response:', data);
                }
            })
            .catch(err => {
                console.error('Error during voice conversion:', err);
                setError('Error during voice conversion.');
            });
    };

    return (
        <div className="song-cover-page">
            <div className="song-cover-container">
                <h1 className="page-title">AI Song Cover Generator</h1>
                <div className="input-container">
                    <select
                        id="voiceDropdown"
                        className="voice-dropdown"
                        onChange={handleVoiceChange}
                    >
                        <option value="">Select a voice</option>
                        {voices.map(voice => (
                            <option key={voice.id} value={voice.id}>{voice.artist}</option>
                        ))}
                    </select>

                    {selectedVoice && selectedVoice.artist && (
                        <div id="selectedVoice" className="selected-voice">
                            Selected Voice: {selectedVoice.artist}
                        </div>
                    )}
                    <input
                        type="file"
                        id="fileInput"
                        className="file-input"
                        accept="audio/*"
                        onChange={handleFileChange}
                    />
                </div>
                <button
                    id="submitButton"
                    className="submit-button"
                    onClick={handleGenerateCover}
                >
                    Generate Cover
                </button>

                {error && <div id="responseOutput" className="error-message">{error}</div>}

                {audioUrl && (
                    <div className="audio-output">
                        <audio id="audioPlayer" className="audio-player" controls src={audioUrl} />
                        <a
                            id="downloadLink"
                            className="download-link"
                            href={audioUrl}
                            download
                        >
                            Download
                        </a>
                    </div>
                )}

                {/* Go Back Button */}
                <Link to="/generate">
                    <button className="back-button">Go Back</button>
                </Link>
            </div>
        </div>
    );
};

export default AISongCoverGenerator;
