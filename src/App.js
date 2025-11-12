import React, { useEffect, useState } from 'react';
import Login from './components/login/login';
import SignUp from './components/login/signup';
import './index.css';
import GameDashboard from './components/Game/GameDashboard';
import GamePlay from './components/Game/GamePlay';
import Scoreboard from './components/Game/Scoreboard';
import GameTutorial from './components/Game/GameTutorial';
import { authService } from './services/api';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 via-yellow-100 to-rose-100">
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-lime-400 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
          🤖
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-lime-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Heart Robot Maths Challenge
        </p>
        <p className="text-lg text-rose-500 animate-pulse">
          is loading! powering up circuits...
        </p>
      </div>
      <div className="flex space-x-3">
        <span className="w-3 h-3 rounded-full bg-lime-500 animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="w-3 h-3 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="w-3 h-3 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentPage(user ? 'dashboard' : 'login');
      // add a short delay so the loading animation is visible
      setTimeout(() => setAppLoading(false), 600);
    });

    return () => {
      setAppLoading(false);
      unsubscribe();
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <GameDashboard onNavigate={setCurrentPage} />;
      case 'gameplay':
        return <GamePlay onNavigate={setCurrentPage} />;
      case 'GameTutorial':
        return <GameTutorial onNavigate={setCurrentPage} />;
      case 'scoreboard':
        return <Scoreboard onNavigate={setCurrentPage} />;
      default:
        return <Login onNavigate={setCurrentPage} />;
    }
  };

  if (appLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-yellow-100 to-rose-100">
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            font-family: 'Comic Sans MS', 'Poppins', sans-serif;
            background-color: #fefce8;
            color: #1f2937;
          }
          .heart-robot-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,249,196,0.9));
            border: 2px solid rgba(74, 222, 128, 0.4);
            box-shadow: 0 18px 45px rgba(248, 113, 113, 0.15);
          }
          .heart-robot-button {
            background-image: linear-gradient(90deg, #4ade80, #facc15, #fb7185);
            color: #1f2937;
          }
        `
      }} />
      {renderPage()}
    </div>
  );
};

export default App;
