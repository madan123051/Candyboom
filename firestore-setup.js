// Firebase Initialization & Firestore Setup
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOCAbauIOAnUOSLWlwe9Z5PvQq8xyzQGQ",
  authDomain: "king-of-jungle-77f06.firebaseapp.com",
  projectId: "king-of-jungle-77f06",
  storageBucket: "king-of-jungle-77f06.appspot.com",
  messagingSenderId: "993583513273",
  appId: "1:993583513273:web:d4f7e8c9a1b2c3d4e5f6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Firestore Collections
export async function initializeFirestore() {
  try {
    // Create config document
    const configRef = doc(db, 'config', 'game_settings');
    await setDoc(configRef, {
      gameName: 'Candyboom',
      projectId: 'king-of-jungle-77f06',
      createdAt: new Date(),
      version: '1.0.0',
      oauth: {
        google: {
          clientId: '993583513273-0d1o49evnp5obo5ks2re9i3n0mggc15h.apps.googleusercontent.com'
        }
      }
    }, { merge: true });

    console.log('✅ Firestore initialized successfully');
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
  }
}

// User Collection Structure
export const userCollectionRef = collection(db, 'users');

// Sample User Data Structure
export const sampleUserData = {
  username: '',
  email: '',
  profilePicture: '',
  currentLevel: 1,
  totalScore: 0,
  totalStars: 0,
  boosters: {
    hammer: 0,
    lightning: 0,
    bomb: 0,
    shuffle: 0
  },
  referrals: [],
  createdAt: new Date(),
  lastPlayedAt: new Date(),
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    pushNotificationsEnabled: true
  }
};

// Call initialization on app load
initializeFirestore();
