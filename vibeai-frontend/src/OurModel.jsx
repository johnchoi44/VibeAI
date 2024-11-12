import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ourmodel.css';
import trumpAudios from './assets/trumpdemo.mp3';
import trumpImage from './assets/trump.jpg';
import speakerIcon from './assets/audio.png';
import spongebobAudios from './assets/spongebob-demo.wav';
import spongebobImage from './assets/spongebob.jpg';

const OurModel = () => {
    const [currentAudio, setCurrentAudio] = useState(null);
    const trumpAudio = new Audio(trumpAudios);
    const spongebobAudio = new Audio(spongebobAudios);

    const handleAudio = (audio) => {
        // Stop currently playing audio, if any
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset to start
        }
        
        // Toggle playback for selected audio
        if (audio === currentAudio && !audio.paused) {
            audio.pause();
            setCurrentAudio(null);
        } else {
            audio.play();
            setCurrentAudio(audio);
        }
    };

    // Event listeners to handle end of playback
    trumpAudio.onended = () => setCurrentAudio(null);
    spongebobAudio.onended = () => setCurrentAudio(null);

    // Cleanup function to stop audio when component unmounts
    useEffect(() => {
        return () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0; // Reset audio position
            }
        };
    }, [currentAudio]);

    return (
        <div className="our-model-page">
            <div className="intro-text">
                <p>
                    Ever dreamed of singing or reading in the voice of your favorite celebrity? Introducing Vibe.AI – the ultimate Voice Cloning Speech Generator and AI Song Cover Creator! Bring the voices of top celebrities to your own recordings and even create a unique model with your voice.
                </p>
                <p>
                    Simply upload an audio file, let our platform work its magic, and sound incredible in seconds!
                </p>
            </div>
            <div className="character-wrapper">
                <div className="character-container">
                    <img src={trumpImage} alt="Character" className="character-image" />
                    <div className="speaker-container" onClick={() => handleAudio(trumpAudio)}>
                        <img src={speakerIcon} alt="Play Demo" className="speaker-icon" />
                        <p className="character-name">AI Donald Trump</p>
                    </div>
                </div>
                <div className="character-container">
                    <img src={spongebobImage} alt="Character" className="character-image" />
                    <div className="speaker-container" onClick={() => handleAudio(spongebobAudio)}>
                        <img src={speakerIcon} alt="Play Demo" className="speaker-icon" />
                        <p className="character-name">AI Spongebob Squarepants</p>
                    </div>
                </div>
            </div>
            <br />
            <Link to="/generate">
                <button className="generate-button">Try it out!</button>
            </Link>
        </div>
    );
};

export default OurModel;
