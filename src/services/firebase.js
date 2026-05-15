// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBiKDt9_TPVr3fC6ekD9H6sV0B9t6Pp3_M",
  authDomain: "track-my-bus-bba46.firebaseapp.com",
  databaseURL: "https://track-my-bus-bba46-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "track-my-bus-bba46",
  storageBucket: "track-my-bus-bba46.firebasestorage.app",
  messagingSenderId: "192408556335",
  appId: "1:192408556335:web:c91b7d62fc0a018d8587da"
};

// Only initialize database — NO auth here
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const FIREBASE_API_KEY = "AIzaSyBiKDt9_TPVr3fC6ekD9H6sV0B9t6Pp3_M";
export default app;