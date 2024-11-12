import React from 'react';
import { Link } from 'react-router-dom';
import vibeaiIcon from './assets/vibeai.svg';

const Header = () => {
    return (
      <header className="header">
        <Link to="/" className="header-icon-link">
          <img src={vibeaiIcon} alt="VibeAI Icon" className="header-icon" />
        </Link>
      </header>
    );
  };

export default Header;
