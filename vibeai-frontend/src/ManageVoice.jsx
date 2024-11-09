import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ManageVoice() {
    const [voices, setVoices] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch cloned voices from the backend
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
            // Send a POST request to delete the selected voice model
            await axios.post('http://localhost:8080/delete-voice', { cloneId });
            
            // Remove the deleted voice from the state to update the list
            setVoices((prevVoices) => prevVoices.filter((voice) => voice.id !== cloneId));
        } catch (error) {
            console.error('Error deleting cloned voice:', error);
            setError('Error deleting cloned voice');
        }
    };

    return (
        <div>
            <h1>Cloned Voices</h1>

            {/* Error Message */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* List of Cloned Voices */}
            <ul>
                {voices.map((voice) => (
                    <li key={voice.id}>
                        <strong>Name:</strong> {voice.name} ({voice.gender})<br />
                        <button onClick={() => handleDelete(voice.id)}>Delete Model</button>
                    </li>
                ))}
            </ul>

            <br />
            {/* Go Back Button */}
            <button onClick={() => navigate('/speechtotext')}>Go Back</button>
        </div>
    );
}

export default ManageVoice;
