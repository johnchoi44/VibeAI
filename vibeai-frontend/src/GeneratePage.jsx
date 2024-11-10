import React from 'react';
import { Link } from 'react-router-dom';
import './generate.css';
import textPic from './assets/text.png';
import musicPic from './assets/music.png';

function GeneratePage() {
  const handleCreateSongClick = () => {
    // localhost:3000으로 이동
    window.location.href = 'http://localhost:3000';
  };

  return (
    <div className="generate-page">
      <div className="generate-content">
        <h1 className="title">Generate</h1>
      </div>
      <div className="options-container">
        <Link to="/speechtotext">
          <div className="option">
            <div className="image-wrapper">
              <img src={textPic} alt="Read for You" className="option-image" />
            </div>
            <h3>Read for you</h3>
            <p>Upload a document or type your text, select a voice model, and generate a customized audio narration.</p>
          </div>
        </Link>
        
        <div className="option" onClick={handleCreateSongClick}>
          <div className="image-wrapper">
            <img src={musicPic} alt="Create Your Song" className="option-image" />
          </div>
          <h3>Create your song</h3>
          <p>Upload a song, choose a model, and create a personalized version of the track.</p>
        </div>
      </div>
    </div>
  );
}

export default GeneratePage;

