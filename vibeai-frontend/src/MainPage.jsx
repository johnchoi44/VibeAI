import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './mainpage.css'
import Popup from 'reactjs-popup';

const CONTRACT_VERSION = "1.5"; // change this version when you want the popup to show again

function MainPage() {
  const navigate = useNavigate();
  const [isSigned, setIsSigned] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const savedVersion = localStorage.getItem('contractVersion');
    if (savedVersion === CONTRACT_VERSION) {
      setIsSigned(true);
    } else {
      setIsSigned(false);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('contractVersion', CONTRACT_VERSION);
    setIsSigned(true);
    setShowPopup(false);
  };

  const handleGenerateClick = () => {
    if (isSigned) {
      navigate('/generate');
    } else {
      setShowPopup(true);
    }
  };

  const handleOurModelClick = () => {
      navigate('/ourmodel');
  };

  return (
    <div className="main-page">
      <div className="main-content">
        <h1 className="title">VIBE.AI</h1>
        <p className="subtitle">where your voice meets </p>
        <p className="subtitle">infinite possibility</p>
        <button onClick={handleOurModelClick} className="generate-button">Our Model</button>
        <button onClick={handleGenerateClick} className="generate-button">Get Started</button>

        <Popup open={showPopup} closeOnDocumentClick={false}>
          <div className='popup-content'>
            <h2>User Agreement</h2>
            <p> Please read and accept the following terms and conditions to access the service:</p>
            <p> You can read the full agreement document <a href="/contract.pdf" target="_blank" rel="noopener noreferrer">here</a>.</p>
            <button onClick={handleAgree} className='agree-button'>I Agree</button>
          </div>
        </Popup>
      </div>
    </div>
  );
}

export default MainPage;
