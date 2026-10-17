// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAEhBb6KTKmDT_MJdGsZ7dMxK3WYOk4cHc",
  authDomain: "track-my-bus-c0767.firebaseapp.com",
  databaseURL: "https://track-my-bus-c0767-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "track-my-bus-c0767",
  storageBucket: "track-my-bus-c0767.firebasestorage.app",
  messagingSenderId: "1040675644376",
  appId: "1:1040675644376:web:1e77838a5c3460a56708ad"
};


// Only initialize database — NO auth here
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const FIREBASE_API_KEY = "AIzaSyAEhBb6KTKmDT_MJdGsZ7dMxK3WYOk4cHc";
export default app;