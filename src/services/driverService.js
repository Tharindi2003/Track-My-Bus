// src/services/driverService.js
import { ref, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { db, FIREBASE_API_KEY } from './firebase';

const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

export async function getAllDrivers() {
  const snap = await get(ref(db, 'bus_drivers'));
  if (!snap.exists()) return [];
  const drivers = [];
  snap.forEach((child) => { drivers.push({ id: child.key, ...child.val() }); });
  return drivers;
}

export function subscribeToDrivers(callback) {
  const r = ref(db, 'bus_drivers');
  onValue(r, (snap) => {
    const drivers = [];
    snap.forEach((child) => { drivers.push({ id: child.key, ...child.val() }); });
    callback(drivers);
  });
  return () => off(r);
}

export async function getDriver(id) {
  const snap = await get(ref(db, `bus_drivers/${id}`));
  return snap.exists() ? { id: snap.key, ...snap.val() } : null;
}

// ── Add driver — creates Firebase Auth account + bus_drivers + users entries
export async function addDriver(data, email, password) {
  // 1. Create Firebase Auth account
  const res = await fetch(`${AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const authData = await res.json();
  if (authData.error) throw new Error(authData.error.message);

  const uid = authData.localId;

  // 2. Save to bus_drivers using the auth UID as key (so driver can find their own record)
  await set(ref(db, `bus_drivers/${uid}`), {
    ...data,
    id: uid,
    email,
    isActive: true,
    averageRating: 0,
    totalRatings: 0,
    userRatings: {},
    createdAt: Date.now(),
    schoolLocation: data.schoolLocation || { latitude: 6.9030, longitude: 79.8695 },
  });

  // 3. Save to users table so driver can log in
  await set(ref(db, `users/${uid}`), {
    userId: uid,
    email,
    name: data.driverName,
    phoneNumber: data.phoneNumber || '',
    role: 'DRIVER',
    assignedBusId: uid,
    profileImageUrl: '',
    createdAt: Date.now(),
  });

  return uid;
}

export async function updateDriver(id, data) {
  await update(ref(db, `bus_drivers/${id}`), data);
}

export async function deleteDriver(id) {
  await remove(ref(db, `bus_drivers/${id}`));
  await remove(ref(db, `users/${id}`));
}

export async function rateDriver(driverId, userId, rating) {
  const driverRef = ref(db, `bus_drivers/${driverId}`);
  const snap = await get(driverRef);
  if (!snap.exists()) throw new Error('Driver not found');

  const driver = snap.val();
  const userRatings = driver.userRatings || {};
  userRatings[userId] = rating;

  const total = Object.values(userRatings).reduce((a, b) => a + b, 0);
  const avg = Math.round((total / Object.keys(userRatings).length) * 10) / 10;

  await update(driverRef, {
    userRatings,
    averageRating: avg,
    totalRatings: Object.keys(userRatings).length,
  });
}