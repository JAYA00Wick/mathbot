import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCttqJe7XxX47LLP-jlvZrbXEaQT0JsFKQ',
  authDomain: 'math-robot-challenge.firebaseapp.com',
  projectId: 'math-robot-challenge',
  storageBucket: 'math-robot-challenge.firebasestorage.app',
  messagingSenderId: '145774279509',
  appId: '1:145774279509:web:771416f08439db8ae44ddc',
  measurementId: 'G-ED42223LW9'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
