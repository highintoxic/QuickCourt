import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import VenuesPage from './components/VenuesPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'auth', 'venues'

  const showAuthPage = () => {
    setCurrentPage('auth');
  };

  const showLandingPage = () => {
    setCurrentPage('landing');
  };

  const showVenuesPage = () => {
    setCurrentPage('venues');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage 
          onGetStarted={showAuthPage}
          onVenuesClick={showVenuesPage}
        />
      )}
      {currentPage === 'auth' && (
        <AuthPage onBackToHome={showLandingPage} />
      )}
      {currentPage === 'venues' && (
        <VenuesPage 
          onGetStarted={showAuthPage}
          onBackToHome={showLandingPage}
        />
      )}
    </div>
  );
}

export default App;