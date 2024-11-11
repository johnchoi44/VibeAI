import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './managevoice.css';

function ManageVoice() {
    const [voices, setVoices] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVoices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/cloned-voices');
                setVoices(response.data);
            } catch (error) {
                console.error('Error fetching cloned voices:', error);
                setError('Error fetching cloned voices');
            }
        };

        fetchVoices();
    }, []);

    const handleDelete = async (cloneId) => {
        try {
            await axios.post('http://localhost:8080/delete-voice', { cloneId });
            setVoices((prevVoices) => prevVoices.filter((voice) => voice.id !== cloneId));
        } catch (error) {
            console.error('Error deleting cloned voice:', error);
            setError('Error deleting cloned voice');
        }
    };

    return (
        <div className="manage-voice-page">
            <div className='manage-voice-container'>
                <h1 className="page-title">Cloned Voices</h1>

                {error && <p className="error-message">{error}</p>}

                <ul className="voice-list">
                    {voices.map((voice) => (
                        <li key={voice.id} className="voice-item">
                            <strong className="voice-name">Name:</strong> {voice.name} ({voice.gender})<br />
                            <button onClick={() => handleDelete(voice.id)} className="delete-button">Delete Model</button>
                        </li>
                    ))}
                </ul>

                <button onClick={() => navigate('/speechtotext')} className="back-button">Go Back</button>
            </div>
        </div>
    );
}

export default ManageVoice;
