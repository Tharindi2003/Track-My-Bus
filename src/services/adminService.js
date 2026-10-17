// src/services/adminService.js
import { ref, set, get, remove, update } from 'firebase/database';
import { db, FIREBASE_API_KEY } from './firebase';

const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;

export async function getUsersByRole(role) {
  const snap = await get(ref(db, 'users'));
  if (!snap.exists()) return [];
  const users = [];
  snap.forEach((child) => {
    const u = child.val();
    if (u.role === role) users.push({ id: child.key, ...u });
  });
  return users;
}

export async function getAllUsers() {
  const snap = await get(ref(db, 'users'));
  if (!snap.exists()) return [];
  const users = [];
  snap.forEach((child) => { users.push({ id: child.key, ...child.val() }); });
  return users;
}

export async function createUser(email, password, name, phone, role) {
  // Create auth account via REST API
  const res = await fetch(`${AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const uid = data.localId;
  await set(ref(db, `users/${uid}`), {
    userId: uid, email, name, phoneNumber: phone,
    role, profileImageUrl: '', createdAt: Date.now(),
    assignedBusId: '', driverLicenseNumber: '', schoolId: '',
  });
  return uid;
}

export async function updateUser(uid, data) {
  await update(ref(db, `users/${uid}`), data);
}

// The very first admin account — protected from deletion by anyone.
const SUPER_ADMIN_EMAIL = 'admin@gmail.com';

export async function deleteUserProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  if (snap.exists() && snap.val().email === SUPER_ADMIN_EMAIL) {
    throw new Error('The Super Admin account cannot be removed.');
  }
  await remove(ref(db, `users/${uid}`));
}

export async function getDashboardStats() {
  const [usersSnap, driversSnap] = await Promise.all([
    get(ref(db, 'users')),
    get(ref(db, 'bus_drivers')),
  ]);
  let admins = 0, drivers = 0, parents = 0;
  if (usersSnap.exists()) {
    usersSnap.forEach((child) => {
      const role = child.val().role;
      if (role === 'ADMIN') admins++;
      else if (role === 'DRIVER') drivers++;
      else parents++;
    });
  }
  return {
    admins, drivers, parents,
    busDrivers: driversSnap.exists() ? driversSnap.size : 0,
  };
}