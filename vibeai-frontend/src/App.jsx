import { useState, useEffect} from 'react';
import axios from "axios";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import GeneratePage from './GeneratePage';
import SpeechPage from './SpeechPage'
import CreatemodelPage from './CreatemodelPage'
import ManageVoice from './ManageVoice'

import Footer from './Footer';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/speechtotext" element={<SpeechPage />} />
          <Route path="/createmodel" element={<CreatemodelPage />} />
          <Route path="/cloned-voices" element={<ManageVoice />} />
        </Routes>
        <Footer />
    </Router>
  );
}

export default App;
