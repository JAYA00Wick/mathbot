import React, { useState, useEffect } from 'react';
import { Play, LogOut, Gamepad2, Loader, Sparkles } from 'lucide-react';
import { scoreService, authService } from '../../services/api';

const AggregatedScoreboard = ({ onNavigate }) => {
  const [scores, setScores] = useState([]);
  const [finalResults, setFinalResults] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Read final results and recent results saved by GamePlay
    try {
      const fs = parseInt(localStorage.getItem('finalScore') || '');
      const ga = parseInt(localStorage.getItem('gamesCompleted') || '');
      const gl = localStorage.getItem('gameLevel') || undefined;
      if (Number.isFinite(fs) && fs >= 0 && gl) {
        setFinalResults({ score: fs, attempts: Number.isFinite(ga) ? ga : undefined, level: gl });
      }
      const rrRaw = localStorage.getItem('recentResults');
      if (rrRaw) {
        try {
          const arr = JSON.parse(rrRaw);
          if (Array.isArray(arr)) setRecentResults(arr);
        } catch (_) {}
      }
      // Clear after reading so it won’t persist across sessions
      localStorage.removeItem('finalScore');
      localStorage.removeItem('gamesCompleted');
      localStorage.removeItem('gameLevel');
    } catch (_) {}

    loadUserData();
  }, [filter]);

  // Load scores whenever filter, current user, or finalResults changes
  useEffect(() => {
    loadScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentUser, finalResults]);

  const loadUserData = () => {
    try {
      const userData = authService.getUser();
      if (userData) {
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      authService.logout();
    }
  };

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (filter === 'all') {
        response = await scoreService.getScores();
      } else {
        if (!currentUser) {
          setError('Please log in to view your scores');
          setLoading(false);
          return;
        }
        response = await scoreService.getUserScores();
      }
      
      if (response?.success) {
        let aggregatedScores = aggregateScores(response.data || []);

        // Merge all recent local results (multiple players/sessions on this device)
        const toMerge = [];
        if (Array.isArray(recentResults) && recentResults.length) {
          toMerge.push(...recentResults);
        }
        if (finalResults) {
          toMerge.push({
            name: currentUser?.name || 'Anonymous',
            level: finalResults.level || 'Easy',
            score: Number.isFinite(finalResults.score) ? finalResults.score : 0,
            attempts: finalResults.attempts,
            ts: Date.now()
          });
        }

        if (toMerge.length) {
          for (const item of toMerge) {
            const playerName = item.name || 'Anonymous';
            const level = item.level || 'Easy';
            const addScore = Number(item.score) || 0;
            const idx = aggregatedScores.findIndex(r => r.name === playerName && r.level === level);
            if (idx >= 0) {
              const updated = { ...aggregatedScores[idx] };
              updated.totalScore = (Number(updated.totalScore) || 0) + addScore;
              updated.carrots = Math.max(0, Math.floor(updated.totalScore * 0.6));
              updated.hearts = Math.max(0, Math.floor(updated.totalScore * 0.4));
              aggregatedScores[idx] = updated;
            } else {
              aggregatedScores.push({
                name: playerName,
                level,
                totalScore: addScore,
                carrots: Math.max(0, Math.floor(addScore * 0.6)),
                hearts: Math.max(0, Math.floor(addScore * 0.4)),
                date: new Date().toLocaleString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })
              });
            }
          }

          aggregatedScores = aggregatedScores
            .sort((a, b) => (Number(b.totalScore) || 0) - (Number(a.totalScore) || 0))
            .map((row, index) => ({ ...row, rank: index + 1 }));
        }

        setScores(aggregatedScores);
      } else {
        throw new Error(response?.error || 'Failed to load scores');
      }
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Failed to load scores';
      setError(errorMessage);
      console.error('Score loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateScores = (scores = []) => {
    const groupedScores = scores.reduce((acc, raw) => {
      const name = raw?.name || 'Anonymous';
      const level = raw?.level || 'Easy';
      const key = `${name}-${level}`;

      const scoreNum = Number(raw?.score);
      const attemptsNum = Number(raw?.attempts);
      const validScore = Number.isFinite(scoreNum) ? scoreNum : 0;
      const validAttempts = Number.isFinite(attemptsNum) && attemptsNum > 0 ? attemptsNum : 0;

      if (!acc[key]) {
        acc[key] = {
          name,
          level,
          totalScore: 0,
          totalAttempts: 0,
          lastPlayed: new Date(0)
        };
      }

      acc[key].totalScore += validScore;
      acc[key].totalAttempts += validAttempts;

      const timestamp = raw?.createdAt || raw?.date;
      const parsedDate = timestamp ? new Date(timestamp) : new Date(0);
      if (!Number.isNaN(parsedDate?.valueOf()) && parsedDate > acc[key].lastPlayed) {
        acc[key].lastPlayed = parsedDate;
      }

      return acc;
    }, {});

    return Object.values(groupedScores)
      .map((row) => {
        const safeTotal = Number.isFinite(row.totalScore) ? row.totalScore : 0;
        const carrots = Math.max(0, Math.floor(safeTotal * 0.6));
        const hearts = Math.max(0, Math.floor(safeTotal * 0.4));
        return {
          ...row,
          totalScore: safeTotal,
          carrots,
          hearts,
          date: formatDate(row.lastPlayed)
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((row, index) => ({
        ...row,
        rank: index + 1
      }));
  };

  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    authService.logout();
    onNavigate('login');
  };

  if (filter === 'my-scores' && !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/20 relative z-10">
          <p className="text-red-400 mb-4">Please log in to view your scores</p>
          <button 
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl
              hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300"
          >
            RETURN TO LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100">
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

      {/* Navigation */}
  <nav className="relative bg-transparent backdrop-blur-md border-b border-white/40 p-4 shadow-sm z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-lime-600" />
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="text-lg font-bold text-gray-800 transition hover:text-lime-600"
            >
              Heart Robot Scoreboard
            </button>
          </div>
          <div className="flex items-center gap-5">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-lime-100/60 px-3 py-1 text-sm font-semibold text-gray-700">
                <span className="text-lime-600">Player:</span>
                <span>{currentUser.name}</span>
              </div>
            )}
            {currentUser && (
              <button
                onClick={() => setFilter(filter === 'all' ? 'my-scores' : 'all')}
                className="rounded-full bg-gradient-to-r from-lime-400 to-yellow-400 px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:from-lime-300 hover:to-yellow-300"
              >
                {filter === 'all' ? 'Show my scores' : 'Show all scores'}
              </button>
            )}
            <button
              onClick={() => onNavigate('gameplay')}
              className="flex items-center gap-2 rounded-full border border-lime-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-lime-400 hover:text-lime-600"
            >
              <Play className="h-4 w-4" />
              <span>Play mission</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-rose-400 hover:text-rose-500"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center p-8">
        <div className="relative w-full max-w-2xl rounded-4xl border border-white/70 bg-white/90 px-8 py-10 shadow-2xl">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-lime-200/80 bg-lime-100/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-lime-700">
              <Sparkles className="h-4 w-4" />
              Heart Robot results
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Mission Scoreboard
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Check your latest mission summary and see how other explorers are doing.
            </p>
          </div>

          {/* Final Results card */}
          {finalResults && (
            <div className="mb-8 rounded-3xl border border-lime-200 bg-white/80 px-6 py-5 text-center shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-500">Latest mission summary</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-gray-700">
                <span className="rounded-full bg-lime-100/80 px-4 py-2">Level: {finalResults.level}</span>
                {finalResults.attempts !== undefined && (
                  <span className="rounded-full bg-yellow-100/80 px-4 py-2">Puzzles cleared: {finalResults.attempts}</span>
                )}
                <span className="rounded-full bg-rose-100/80 px-4 py-2">Score: {finalResults.score}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <Loader className="h-12 w-12 animate-spin text-lime-500" />
              <div className="text-sm font-semibold text-gray-600">Loading scores…</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No scores found</div>
          ) : (
            <div className="mb-8 overflow-hidden rounded-3xl border border-lime-100">
              <table className="w-full text-sm">
                <thead className="bg-lime-50">
                  <tr className="border-b border-lime-100 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-center">🥕</th>
                    <th className="px-4 py-3 text-center">❤️</th>
                    <th className="px-4 py-3 text-center">Total score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr
                      key={index}
                      className="border-b border-lime-50 bg-white/80 text-sm font-semibold text-gray-700 last:border-none"
                    >
                      <td className="px-4 py-3 text-center">
                        {score.rank <= 3 ? (
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white ${
                                score.rank === 1
                                  ? 'bg-gradient-to-br from-lime-500 to-yellow-400'
                                  : score.rank === 2
                                  ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                  : 'bg-gradient-to-br from-rose-400 to-rose-500'
                              }`}
                            >
                              {score.rank}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-600">{score.rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-left text-gray-800">{score.name}</td>
                      <td className="px-4 py-3 text-center text-lime-600">{score.carrots}</td>
                      <td className="px-4 py-3 text-center text-rose-500">{score.hearts}</td>
                      <td className="px-4 py-3 text-center text-gray-900">{score.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => onNavigate('gameplay')}
              className="heart-robot-button w-full rounded-full px-6 py-4 text-lg font-bold shadow-lg transition hover:-translate-y-1"
            >
              Play another mission
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full rounded-full border border-lime-200 px-6 py-4 text-lg font-semibold text-gray-700 transition hover:border-lime-400 hover:text-lime-600"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AggregatedScoreboard;