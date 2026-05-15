// src/services/trackingService.js
import { ref, set, onValue, off, push, get } from 'firebase/database';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { db } from './firebase';

const LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

// ── Driver: start sharing live location ──────────────────────
export async function startLiveTracking(driverId) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission denied');

  // Update location every 5 seconds
  const interval = setInterval(async () => {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    await set(ref(db, `liveLocations/${driverId}`), {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      heading: loc.coords.heading || 0,
      speed: loc.coords.speed || 0,
      updatedAt: Date.now(),
      isActive: true,
    });
  }, 5000);

  return interval;
}

// ── Driver: stop sharing location ────────────────────────────
export async function stopLiveTracking(driverId, intervalId) {
  clearInterval(intervalId);
  await set(ref(db, `liveLocations/${driverId}`), {
    isActive: false,
    updatedAt: Date.now(),
  });
}

// ── Parent: subscribe to driver location ─────────────────────
export function subscribeToBusLocation(driverId, callback) {
  const locRef = ref(db, `liveLocations/${driverId}`);
  onValue(locRef, (snap) => {
    if (snap.exists()) callback(snap.val());
  });
  return () => off(locRef);
}

// ── Driver: log school arrival / home departure ───────────────
export async function logEvent(driverId, eventType, location) {
  // eventType: 'ARRIVED_SCHOOL' | 'DEPARTED_SCHOOL' | 'ARRIVED_HOME'
  const eventRef = push(ref(db, `events/${driverId}`));
  await set(eventRef, {
    type: eventType,
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: Date.now(),
  });

  // Get all parents subscribed to this driver and send notification flag
  const driversSnap = await get(ref(db, `bus_drivers/${driverId}`));
  if (driversSnap.exists()) {
    const driver = driversSnap.val();
    // Set notification flag for parents
    await set(ref(db, `notifications/${driverId}/latest`), {
      type: eventType,
      driverName: driver.driverName,
      busNumber: driver.busNumber,
      timestamp: Date.now(),
      read: false,
    });
  }
}

// ── Get trip history for a driver ────────────────────────────
export async function getTripHistory(driverId, days = 7) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const snap = await get(ref(db, `events/${driverId}`));
  if (!snap.exists()) return [];

  const events = [];
  snap.forEach((child) => {
    const e = child.val();
    if (e.timestamp >= since) events.push({ id: child.key, ...e });
  });

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

// ── Calculate ETA (simple straight-line estimate) ─────────────
export function calculateETA(busLat, busLng, schoolLat, schoolLng, speedKmh = 30) {
  const R = 6371;
  const dLat = ((schoolLat - busLat) * Math.PI) / 180;
  const dLon = ((schoolLng - busLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((busLat * Math.PI) / 180) *
      Math.cos((schoolLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const etaMin = Math.round((distKm / speedKmh) * 60);
  return etaMin;
}
