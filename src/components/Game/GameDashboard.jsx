import React, { useEffect, useState } from 'react';
import { Play, Trophy, LogOut, Sparkles, Gamepad2, Book, Shield } from 'lucide-react';
import { authService } from '../../services/api';

const GameDashboard = ({ onNavigate }) => {
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem('selectedLevel') || 'Easy');
  const [animateTitle, setAnimateTitle] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(authService.getUser());
  }, []);

  useEffect(() => {
    setAnimateTitle(true);
    const interval = setInterval(() => {
      setAnimateTitle((prev) => !prev);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const levelConfig = {
    Easy: {
      gradient: 'from-lime-200 via-lime-100 to-white',
      border: 'border-lime-300',
      text: 'text-lime-700',
      stats: ['40 second timer', '40 energy hearts', '5 puzzles to clear'],
      badge: 'bg-lime-100 text-lime-600'
    },
    Medium: {
      gradient: 'from-yellow-200 via-yellow-100 to-white',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
      stats: ['30 second timer', '30 energy hearts', '7 puzzles to clear'],
      badge: 'bg-yellow-100 text-yellow-600'
    },
    Hard: {
      gradient: 'from-rose-200 via-rose-100 to-white',
      border: 'border-rose-300',
      text: 'text-rose-700',
      stats: ['20 second timer', '20 energy hearts', '10 puzzles to clear'],
      badge: 'bg-rose-100 text-rose-600'
    }
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    localStorage.setItem('selectedLevel', level);
  };

  const handlePlay = () => {
    if (!selectedLevel) {
      return;
    }
    onNavigate('gameplay');
  };

  const handleLogout = async () => {
    await authService.logout();
    onNavigate('login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-lime-200/40 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20">
        <header className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-lime-600">
              <Sparkles className="h-6 w-6" />
              <span className="font-semibold uppercase tracking-wide">Heart Robot HQ</span>
            </div>
            <h1
              className={`mt-2 text-4xl font-extrabold text-gray-800 transition-transform duration-700 sm:text-5xl ${
                animateTitle ? 'translate-x-1' : '-translate-x-1'
              }`}
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Choose your maths mission
            </h1>
            <p className="mt-3 max-w-xl text-gray-600">
              Count the hearts, outsmart the puzzles and climb the Heart Robot leaderboard. Bright colours, friendly
              robots and Firebase powered progress tracking await!
            </p>
          </div>

          <div className="heart-robot-card w-full max-w-xs rounded-3xl px-6 py-5 text-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-lime-500">Signed in as</p>
                <p className="text-lg font-bold text-gray-800">{currentUser?.name || 'Heart Robot Player'}</p>
              </div>
              <Shield className="h-8 w-8 text-lime-400" />
            </div>
            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-lime-200 bg-white px-4 py-2 text-sm font-semibold text-lime-600 shadow-sm transition hover:bg-lime-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-3">
          {Object.entries(levelConfig).map(([level, config]) => (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br px-6 py-8 text-left shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                config.gradient
              } ${config.border} ${selectedLevel === level ? 'ring-4 ring-offset-2 ring-lime-300' : 'ring-0'}`}
            >
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
                {level} mode
              </span>
              <h3 className={`mt-4 text-3xl font-extrabold ${config.text}`} style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {level}
              </h3>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-gray-600">
                {config.stats.map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    {line}
                  </li>
                ))}
              </ul>
              {selectedLevel === level && (
                <div className="absolute -right-2 -top-2 rounded-full bg-white/80 p-3 text-lime-500 shadow">
                  <Gamepad2 className="h-6 w-6" />
                </div>
              )}
            </button>
          ))}
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="heart-robot-card rounded-3xl px-8 py-6">
            <div className="flex items-center gap-3 text-lime-500">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Get ready to play</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-gray-700">
              Heart Robot will test both your speed and your eye for details. Count the hearts, count the carrots and outscore your friends.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-lime-200 bg-white/70 px-4 py-3 text-sm font-semibold text-gray-600">
                <span className="block text-xs uppercase tracking-wide text-lime-500">Tips</span>
                Take a quick glance first, then count carefully!
              </div>
              <div className="rounded-2xl border border-yellow-200 bg-white/70 px-4 py-3 text-sm font-semibold text-gray-600">
                <span className="block text-xs uppercase tracking-wide text-yellow-500">Boost</span>
                Match hearts and carrots for full points.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handlePlay}
              className="heart-robot-button flex items-center justify-center gap-3 rounded-3xl px-6 py-5 text-lg font-extrabold shadow-xl transition hover:-translate-y-1"
            >
              <Play className="h-6 w-6" />
              Start {selectedLevel} mission
            </button>
            <button
              onClick={() => onNavigate('GameTutorial')}
              className="flex items-center justify-center gap-3 rounded-3xl border border-rose-200 bg-white px-6 py-5 text-lg font-semibold text-rose-500 shadow-sm transition hover:bg-rose-50"
            >
              <Book className="h-6 w-6" />
              View quick tutorial
            </button>
            <button
              onClick={() => onNavigate('scoreboard')}
              className="flex items-center justify-center gap-3 rounded-3xl border border-lime-200 bg-white px-6 py-5 text-lg font-semibold text-lime-600 shadow-sm transition hover:bg-lime-50"
            >
              <Trophy className="h-6 w-6" />
              View leaderboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GameDashboard;