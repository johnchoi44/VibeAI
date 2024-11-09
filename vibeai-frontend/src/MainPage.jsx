import React from 'react';
import { useNavigate } from 'react-router-dom';
import './mainpage.css'

function MainPage() {
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate('/generate');
  };

  return (
    <div className="main-page">
      <div className="main-content">
        <h1 className="title">VIBE.AI</h1>
        <p className="subtitle">where your voice meets </p>
        <p className="subtitle">infinite possibility</p>
        <button onClick={handleGenerateClick} className="generate-button">Get Started</button>
      </div>
    </div>
  );
}

export default MainPage;
