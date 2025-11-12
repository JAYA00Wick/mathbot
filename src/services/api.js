import axios from 'axios';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';

const USER_STORAGE_KEY = 'user_data';

const persistUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  const storedUser = {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Heart Robot Player',
    email: user.email || '',
    role: 'player'
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
};

const buildSuccessResponse = (data) => ({ success: true, data });
const buildErrorResponse = (error) => ({ success: false, error });

export const authService = {
  register: async (name, email, password) => {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(credentials.user, { displayName: name });
      }

      await setDoc(doc(db, 'users', credentials.user.uid), {
        name,
        email,
        role: 'player',
        createdAt: serverTimestamp()
      });

      persistUser(credentials.user);

      return buildSuccessResponse({
        id: credentials.user.uid,
        name: name || credentials.user.email,
        email,
        role: 'player'
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error?.message || 'Failed to register');
    }
  },

  login: async (email, password) => {
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const profileRef = doc(db, 'users', credentials.user.uid);
      const profileSnap = await getDoc(profileRef);

      const nameFromProfile = profileSnap.exists() ? profileSnap.data().name : credentials.user.displayName;
      persistUser({ ...credentials.user, displayName: nameFromProfile });

      return buildSuccessResponse({
        id: credentials.user.uid,
        name: nameFromProfile || credentials.user.email,
        email: credentials.user.email,
        role: 'player',
        token: await getIdToken(credentials.user)
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error?.message || 'Failed to login');
    }
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  getProfile: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return buildErrorResponse('No user authenticated');
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        return buildSuccessResponse({
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          role: 'player'
        });
      }

      return buildSuccessResponse({ id: user.uid, ...userDoc.data() });
    } catch (error) {
      console.error('Get profile error:', error);
      return buildErrorResponse(error.message || 'Failed to load profile');
    }
  },

  isAuthenticated: () => !!auth.currentUser,

  getUser: () => {
    if (auth.currentUser) {
      const { uid, displayName, email } = auth.currentUser;
      return {
        id: uid,
        name: displayName || email?.split('@')[0] || 'Heart Robot Player',
        email,
        role: 'player'
      };
    }

    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  onAuthStateChange: (callback) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        persistUser(user);
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      callback(user);
    });
    return unsubscribe;
  }
};

export const gameService = {
  startGame: async (level) => {
    try {
      try {
        const response = await axios.get('https://marcconrad.com/uob/heart/api.php', {
          timeout: 5000,
        });

        if (response.data && response.data.question && response.data.solution !== undefined && response.data.carrots !== undefined) {
          const gameId = Date.now();
          const gameData = {
            gameId,
            question: response.data.question,
            solution: response.data.solution,
            carrots: response.data.carrots,
            level,
            source: 'real_api'
          };

          localStorage.setItem(`game_${gameId}`, JSON.stringify({
            solution: response.data.solution,
            carrots: response.data.carrots
          }));

          return buildSuccessResponse(gameData);
        }
      } catch (apiError) {
        console.warn('Heart API unavailable', apiError.message);
        // Let the outer catch handle the error and return a unified error response
        throw apiError;
      }

      throw new Error('Invalid response from Heart API');
    } catch (error) {
      console.error('Error starting heart game:', error);
      return buildErrorResponse('Failed to start a new puzzle. Please try again.');
    }
  },

  submitAnswer: async (gameId, heartAnswer, carrotAnswer) => {
    try {
      const gameData = localStorage.getItem(`game_${gameId}`);

      if (gameData) {
        const { solution, carrots } = JSON.parse(gameData);
        const heartCorrect = parseInt(heartAnswer, 10) === solution;
        const carrotCorrect = parseInt(carrotAnswer, 10) === carrots;
        const bothCorrect = heartCorrect && carrotCorrect;

        localStorage.removeItem(`game_${gameId}`);

        let score = 0;
        if (bothCorrect) {
          score = 100;
        } else if (heartCorrect || carrotCorrect) {
          score = 50;
        }

        return buildSuccessResponse({
          correct: bothCorrect,
          heartCorrect,
          carrotCorrect,
          score,
          solution,
          carrots
        });
      }

      return buildErrorResponse('Game session expired. Start a new puzzle.');
    } catch (error) {
      console.error('Error validating answer:', error);
      return buildErrorResponse('Could not validate answer');
    }
  }
};

const scoreCollection = collection(db, 'scores');

const formatScoreDoc = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || 'Heart Robot Player',
    level: data.level || 'Easy',
    score: data.score || 0,
    attempts: data.attempts || 0,
    userId: data.userId || null,
    createdAt: data.createdAt?.toMillis?.() || Date.now()
  };
};

export const scoreService = {
  getScores: async () => {
    try {
      const scoreQuery = query(scoreCollection, orderBy('score', 'desc'), limit(25));
      const snapshot = await getDocs(scoreQuery);
      const scores = snapshot.docs.map(formatScoreDoc);
      return buildSuccessResponse(scores);
    } catch (error) {
      console.error('Error fetching scores:', error);
      return buildErrorResponse(error.message || 'Failed to load scores');
    }
  },

  getUserScores: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return buildErrorResponse('User not authenticated');
      }

      const scoreQuery = query(scoreCollection, where('userId', '==', user.uid), limit(50));
      const snapshot = await getDocs(scoreQuery);

      const scores = snapshot.docs
        .map(formatScoreDoc)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 25);
      return buildSuccessResponse(scores);
    } catch (error) {
      console.error('Error fetching user scores:', error);
      return buildErrorResponse(error.message || 'Failed to load user scores');
    }
  },

  submitScore: async (scoreData) => {
    try {
      const user = auth.currentUser;
      const safeScore = Number(scoreData?.score) || 0;
      const level = scoreData?.level || 'Easy';

      const payload = {
        userId: user?.uid || null,
        name: user?.displayName || user?.email || scoreData?.name || 'Heart Robot Player',
        level,
        score: safeScore,
        attempts: Number(scoreData?.attempts) || 0,
        createdAt: serverTimestamp()
      };

      await addDoc(scoreCollection, payload);
      return buildSuccessResponse(payload);
    } catch (error) {
      console.error('Error submitting score:', error);
      return buildErrorResponse(error.message || 'Failed to submit score');
    }
  }
};

export const statsService = {
  getPlayerStats: async () => buildSuccessResponse({}),
  getAchievements: async () => buildSuccessResponse([]),
  updateAchievement: async () => buildErrorResponse('Achievements are not available in the Firebase edition'),
  getDailyStats: async () => buildSuccessResponse([]),
  getGameHistory: async () => buildSuccessResponse([]),
  getLevelProgress: async () => buildSuccessResponse([])
};