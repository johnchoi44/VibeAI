import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ourmodel.css';
import demoAudio from './assets/trumpdemo.mp3';
import characterImage from './assets/trump.jpg';
import speakerIcon from './assets/audio.png';

const OurModel = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audio = new Audio(demoAudio);

    const handlePlayAudio = () => {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle end of audio playback
    audio.onended = () => setIsPlaying(false);

    return (
        <div className="our-model-page">
            <div className="intro-text">
                <h1>Choose Your Voice Model</h1>
                <p>
                    Have you ever wished to sing like a pop star or a famous voice? Meet Vibe.AI Song Cover Generator! This innovative AI tool clones voices from your favorite artists. Our platform allows you to record perfect song covers.
                </p>
                <p>
                    Just choose a voice, sing your heart out, and sound amazing instantly!
                </p>
            </div>
            <div className="character-container">
                <img src={characterImage} alt="Character" className="character-image" />
                <div className="speaker-container" onClick={handlePlayAudio}>
                    <img src={speakerIcon} alt="Play Demo" className="speaker-icon" />
                    <p className="character-name">AI Donald Trump</p>
                </div>
            </div> <br /><br /><br />
            <Link to="/">
                <button className="back-button">Go Back</button>
            </Link>
        </div>
    );
};

export default OurModel;