import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Clock, Heart, Trophy, Loader, AlertCircle, Sparkles } from 'lucide-react';
import { gameService, scoreService } from '../../services/api';
import GameAudio from './GameAudio';

const levelPresets = {
  Easy: {
    timeLimit: 40,
    attempts: 40,
    required: 5,
    gradient: 'from-lime-200 via-lime-100 to-white',
    border: 'border-lime-200',
    accent: 'text-lime-600'
  },
  Medium: {
    timeLimit: 30,
    attempts: 30,
    required: 7,
    gradient: 'from-yellow-200 via-yellow-100 to-white',
    border: 'border-yellow-200',
    accent: 'text-yellow-600'
  },
  Hard: {
    timeLimit: 20,
    attempts: 20,
    required: 10,
    gradient: 'from-rose-200 via-rose-100 to-white',
    border: 'border-rose-200',
    accent: 'text-rose-600'
  }
};

const getLevelConfig = (level) => levelPresets[level] || levelPresets.Easy;

const GamePlay = ({ onNavigate }) => {
  const initialLevel = localStorage.getItem('selectedLevel') || 'Easy';
  const [level] = useState(initialLevel);
  const levelConfig = useMemo(() => getLevelConfig(level), [level]);

  const [gameState, setGameState] = useState({
    gameId: null,
    questionImage: null,
    message: 'Loading puzzle…',
    loading: true,
    error: null,
    isMock: false
  });
  const [heartGuess, setHeartGuess] = useState('');
  const [carrotGuess, setCarrotGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(levelConfig.timeLimit);
  const [attempts, setAttempts] = useState(levelConfig.attempts);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const gameFinishedRef = useRef(false);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const recordLocalSummary = useCallback(
    (score, puzzles) => {
      const summary = {
        score,
        puzzles,
        level,
        timestamp: Date.now()
      };
      localStorage.setItem('heart_robot_last_game', JSON.stringify(summary));
    },
    [level]
  );

  const submitScore = useCallback(
    async (finalScore, puzzlesCompleted) => {
      await scoreService.submitScore({
        score: finalScore,
        level,
        attempts: puzzlesCompleted
      });
      recordLocalSummary(finalScore, puzzlesCompleted);
    },
    [level, recordLocalSummary]
  );

  const handleGameEnd = useCallback(async () => {
    if (gameFinishedRef.current) {
      return;
    }

    gameFinishedRef.current = true;
    setGameFinished(true);
    setTimerActive(false);

    localStorage.setItem('finalScore', String(totalScore));
    localStorage.setItem('gamesCompleted', String(gamesCompleted));
    localStorage.setItem('gameLevel', level);

    try {
      await submitScore(totalScore, gamesCompleted);
    } finally {
      onNavigate('scoreboard');
    }
  }, [submitScore, totalScore, gamesCompleted, onNavigate]);

  const startNewGame = useCallback(async () => {
    try {
      const response = await gameService.startGame(level);
      if (response?.success && response.data) {
        const { gameId, question, source } = response.data;

        setGameState({
          gameId,
          questionImage: question,
          message:
            source === 'mock_api'
              ? 'Demo puzzle loaded. Count the hearts and carrots!'
              : 'Count the hearts and carrots in the image.',
          loading: false,
          error: null,
          isMock: source === 'mock_api'
        });

        setTimeLeft(levelConfig.timeLimit);
        setTimerActive(true);
        if (gamesCompleted === 0) {
          setAttempts(levelConfig.attempts);
        }
      } else {
        throw new Error(response?.error || 'Unable to get a new puzzle.');
      }
    } catch (error) {
      console.error('Game start error:', error);
      setGameState((prev) => ({
        ...prev,
        error: error?.message || 'Failed to start the game. Please try again.',
        loading: false
      }));
    }
  }, [level, levelConfig.timeLimit, levelConfig.attempts, gamesCompleted]);

  useEffect(() => {
    startNewGame();
    return () => {
      gameFinishedRef.current = false;
      setGameFinished(false);
    };
  }, [startNewGame]);

  useEffect(() => {
    if (!timerActive || gameFinishedRef.current) {
      return;
    }

    if (timeLeft <= 0) {
      handleGameEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, handleGameEnd]);

  const handleGuess = async () => {
    if (gameFinishedRef.current) {
      return;
    }

    if (attempts <= 0) {
      handleGameEnd();
      return;
    }

    const heartCount = parseInt(heartGuess, 10);
    const carrotCount = parseInt(carrotGuess, 10);

    if (Number.isNaN(heartCount) || Number.isNaN(carrotCount)) {
      setGameState((prev) => ({
        ...prev,
        message: 'Enter numbers for both the hearts and the carrots.'
      }));
      return;
    }

    try {
      const response = await gameService.submitAnswer(gameState.gameId, heartCount, carrotCount);
      if (!response?.success) {
        throw new Error(response?.error || 'Could not validate your answer.');
      }

      const { correct, heartCorrect, carrotCorrect, score } = response.data;

      if (correct) {
        setTimerActive(false);
        const points = Number(score) || 100;
        setTotalScore((prev) => prev + points);
        setGamesCompleted((prev) => {
          const next = prev + 1;
          if (next >= levelConfig.required) {
            handleGameEnd();
          } else {
            setTimeout(() => {
              if (!gameFinishedRef.current) {
                startNewGame();
              }
            }, 1100);
          }
          return next;
        });
        setGameState((prev) => ({
          ...prev,
          message: 'Correct! 💡 Heart Robot approves!'
        }));
      } else {
        setAttempts((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            handleGameEnd();
            return 0;
          }
          return next;
        });

        let feedback = 'Almost! ';
        if (!heartCorrect && !carrotCorrect) {
          feedback += 'Both the heart and carrot counts need another look.';
        } else if (!heartCorrect) {
          feedback += 'The heart count is off.';
        } else if (!carrotCorrect) {
          feedback += 'The carrot count is off.';
        }

        setGameState((prev) => ({
          ...prev,
          message: feedback
        }));
      }
    } catch (error) {
      console.error('Submit error:', error);
      setGameState((prev) => ({
        ...prev,
        message: error?.message || 'Error submitting answer. Try again.'
      }));
    } finally {
      setHeartGuess('');
      setCarrotGuess('');
    }
  };

  if (gameState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 animate-spin text-lime-500" />
          <p className="text-lg font-semibold text-gray-700">Loading Heart Robot puzzle…</p>
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100 flex items-center justify-center">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-white/90 px-8 py-10 text-center shadow-2xl">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-rose-500" />
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Oops! The puzzle glitched</h2>
          <p className="mt-3 text-gray-600">{gameState.error}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={startNewGame}
              className="heart-robot-button w-full rounded-full px-6 py-3 text-lg font-bold shadow-lg transition hover:-translate-y-1"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full rounded-full border border-lime-200 px-6 py-3 text-lg font-semibold text-lime-600 transition hover:bg-lime-50"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100">
      <GameAudio isPlaying={true} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-12 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <div className="heart-robot-card rounded-4xl border px-8 py-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-lime-500">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Heart Robot maths challenge</span>
              </div>
              <h1 className={`mt-2 text-3xl font-extrabold text-gray-800 ${levelConfig.accent}`} style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {level} Mission
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">Score</p>
              <p className="text-2xl font-extrabold text-lime-600">{totalScore}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-white/60 bg-white/80 px-6 py-4 shadow-inner sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <Clock className="h-6 w-6 text-lime-500" />
              <span className="mt-2 text-xs uppercase tracking-wide text-gray-500">Time left</span>
              <span className="text-xl font-bold text-gray-800">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="h-6 w-6 text-rose-400" />
              <span className="mt-2 text-xs uppercase tracking-wide text-gray-500">Energy hearts</span>
              <span className="text-xl font-bold text-gray-800">{attempts}</span>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="mt-2 text-xs uppercase tracking-wide text-gray-500">Puzzles cleared</span>
              <span className="text-xl font-bold text-gray-800">{gamesCompleted}/{levelConfig.required}</span>
            </div>
          </div>

          {gameState.questionImage && (
            <div className="mt-8 rounded-3xl border border-lime-100 bg-white/80 p-4">
              <img
                src={gameState.questionImage}
                alt="Heart Robot puzzle"
                className="mx-auto max-h-72 w-full rounded-2xl object-contain"
              />
              {gameState.isMock && (
                <p className="mt-3 text-center text-xs font-semibold text-blue-500">Demo puzzle mode</p>
              )}
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">How many hearts?</label>
              <input
                type="number"
                min="0"
                value={heartGuess}
                onChange={(event) => setHeartGuess(event.target.value)}
                className="w-full rounded-full border border-lime-200 bg-white px-5 py-3 text-center text-lg text-gray-700 focus:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-100"
                placeholder="e.g. 6"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">How many carrots?</label>
              <input
                type="number"
                min="0"
                value={carrotGuess}
                onChange={(event) => setCarrotGuess(event.target.value)}
                className="w-full rounded-full border border-yellow-200 bg-white px-5 py-3 text-center text-lg text-gray-700 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                placeholder="e.g. 4"
              />
            </div>
          </div>

          <button
            onClick={handleGuess}
            className="heart-robot-button mt-6 w-full rounded-full px-6 py-4 text-lg font-extrabold shadow-xl transition hover:-translate-y-1"
          >
            Submit answers
          </button>

          <p className="mt-4 text-center text-sm font-semibold text-gray-600">{gameState.message}</p>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;