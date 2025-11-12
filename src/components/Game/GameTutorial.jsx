import React from 'react';

const GameTutorial = ({ onNavigate }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 relative overflow-hidden">
      {/* Decorative elements - carrots and hearts scattered around */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Carrots */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce" style={{animationDelay: '0s'}}>🥕</div>
        <div className="absolute top-20 right-20 text-3xl animate-bounce" style={{animationDelay: '1s'}}>🥕</div>
        <div className="absolute bottom-32 left-20 text-5xl animate-bounce" style={{animationDelay: '2s'}}>🥕</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>🥕</div>
        <div className="absolute top-1/3 right-10 text-3xl animate-bounce" style={{animationDelay: '1.5s'}}>🥕</div>
        
        {/* Hearts */}
        <div className="absolute top-1/4 left-1/4 text-4xl animate-pulse" style={{animationDelay: '0s'}}>❤️</div>
        <div className="absolute top-1/2 right-1/3 text-3xl animate-pulse" style={{animationDelay: '1s'}}>❤️</div>
        <div className="absolute bottom-1/4 left-1/3 text-5xl animate-pulse" style={{animationDelay: '2s'}}>❤️</div>
        <div className="absolute top-3/4 right-1/4 text-4xl animate-pulse" style={{animationDelay: '0.5s'}}>❤️</div>
        <div className="absolute bottom-10 left-1/2 text-3xl animate-pulse" style={{animationDelay: '1.5s'}}>❤️</div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8 relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-4 border-orange-200 relative w-full max-w-3xl">
          
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="absolute top-6 left-6 bg-gradient-to-r from-orange-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold
              hover:from-orange-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-300
              shadow-lg border-2 border-orange-200"
            style={{fontFamily: 'Comic Sans MS, cursive'}}
          >
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2 flex items-center justify-center gap-2" style={{fontFamily: 'Comic Sans MS, cursive'}}>
              🎮 Game Guide - How to Play
            </h2>
          </div>
          
          {/* Game Instructions */}
          <div className="space-y-6 text-black">
            
            {/* Hearts Section */}
            <div className="text-center space-y-2">
              <div className="text-2xl">💖 Hearts (❤️)</div>
              <ul className="space-y-1 text-lg">
                <li>• Hearts represent life or bonus points.</li>
                <li>• Collecting hearts increases your score by +5 points.</li>
                <li>• Missing hearts doesn't reduce your life, but you'll lose scoring opportunities.</li>
              </ul>
            </div>

            {/* Carrots Section */}
            <div className="text-center space-y-2">
              <div className="text-2xl">🥕 Carrots (🥕)</div>
              <ul className="space-y-1 text-lg">
                <li>• Carrots are your main collectible items.</li>
                <li>• Each carrot adds +10 points to your total.</li>
                <li>• Some special golden carrots give double points!</li>
              </ul>
            </div>

            {/* Timer Section */}
            <div className="text-center space-y-2">
              <div className="text-2xl">⏰ Timer</div>
              <ul className="space-y-1 text-lg">
                <li>• You'll have a limited amount of time (e.g., 60 seconds) to collect as many as possible.</li>
                <li>• When time's up, your final heart and carrot total will be shown on the results screen.</li>
              </ul>
            </div>

            {/* Controls Section */}
            <div className="text-center space-y-2">
              <div className="text-2xl">🎮 Controls</div>
              <ul className="space-y-1 text-lg">
                <li>• Use tap or swipe to move your character.</li>
                <li>• Tap on hearts or carrots to collect them.</li>
              </ul>
            </div>

            {/* Winning Section */}
            <div className="text-center space-y-2">
              <div className="text-2xl">🏆 Winning</div>
              <ul className="space-y-1 text-lg">
                <li>• The more you collect, the higher your score!</li>
                <li>• Try to beat your personal best or compete with friends.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTutorial;