// src/services/authService.js
// Uses Firebase REST API instead of firebase/auth to avoid
// "Component auth has not been registered yet" error in Expo SDK 54
import { ref, set, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, FIREBASE_API_KEY } from './firebase';

const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;

// ── Register new parent ───────────────────────────────────────
export async function registerParent(email, password, name, phone) {
  const res = await fetch(`${AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const uid = data.localId;
  const token = data.idToken;

  // Save profile to database
  await set(ref(db, `users/${uid}`), {
    userId: uid, email, name, phoneNumber: phone,
    role: 'PARENT', profileImageUrl: '',
    createdAt: Date.now(), assignedBusId: '', childrenNames: [],
  });

  // Save session
  await AsyncStorage.setItem('userToken', token);
  await AsyncStorage.setItem('userId', uid);

  return { uid, token };
}

// ── Login ─────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const uid = data.localId;
  const token = data.idToken;
  const refreshToken = data.refreshToken;

  // Get user profile from database
  const snap = await get(ref(db, `users/${uid}`));
  if (!snap.exists()) throw new Error('User profile not found');

  // Save session to storage
  await AsyncStorage.setItem('userToken', token);
  await AsyncStorage.setItem('userId', uid);
  await AsyncStorage.setItem('refreshToken', refreshToken);

  return snap.val();
}

// ── Logout ────────────────────────────────────────────────────
export async function logout() {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userId');
  await AsyncStorage.removeItem('refreshToken');
}

// ── Get saved session ─────────────────────────────────────────
export async function getSavedSession() {
  const uid = await AsyncStorage.getItem('userId');
  const token = await AsyncStorage.getItem('userToken');
  if (!uid || !token) return null;
  return { uid, token };
}

// ── Get user profile from DB ──────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

// ── Update profile ────────────────────────────────────────────
export async function updateProfile(uid, data) {
  await set(ref(db, `users/${uid}`), data);
}

// ── Change password ───────────────────────────────────────────
export async function changePassword(newPassword) {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Not logged in');

  const res = await fetch(`${AUTH_URL}:update?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token, password: newPassword, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  // Update stored token
  await AsyncStorage.setItem('userToken', data.idToken);
}

export function detectRole(email) {
  const e = email.toLowerCase();
  if (e.includes('admin') || e.startsWith('admin@')) return 'ADMIN';
  if (e.includes('driver') || e.startsWith('driver')) return 'DRIVER';
  return 'PARENT';
}