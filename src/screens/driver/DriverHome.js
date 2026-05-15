// src/screens/driver/DriverHome.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { startLiveTracking, stopLiveTracking, logEvent } from '../../services/trackingService';

import * as Location from 'expo-location';

export default function DriverHome() {
  const { profile, logout } = useAuth();
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const intervalRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({}).then(loc => {
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        });
      }
    });
  }, []);

  async function toggleTracking() {
    if (tracking) {
      await stopLiveTracking(profile.userId, intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTracking(false);
      Alert.alert('Tracking Stopped', 'Your location is no longer being shared.');
    } else {
      try {
        const id = await startLiveTracking(profile.userId);
        intervalRef.current = id;
        setTracking(true);
        const locInterval = setInterval(async () => {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }, 5000);
        intervalRef.current = locInterval;
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    }
  }

  async function handleEvent(type) {
    if (!location) return Alert.alert('Error', 'Location not available');
    const labels = {
      ARRIVED_SCHOOL: 'Arrived at School',
      DEPARTED_SCHOOL: 'Departed School',
      ARRIVED_HOME: 'Arrived at Home Drop',
    };
    Alert.alert('Log Event', `Log: "${labels[type]}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log', onPress: async () => { await logEvent(profile.userId, type, location); Alert.alert('Logged', labels[type]); } },
    ]);
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day, {profile?.name?.split(' ')[0]}</Text>
          <Text style={styles.sub}>Bus Driver</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, { backgroundColor: tracking ? COLORS.accent : COLORS.border }]} />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : {
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />
        {location && (
          <Marker coordinate={location} title="Your Location">
            <View style={styles.busPinOuter}>
              <View style={styles.busPin}>
                <Ionicons name="bus" size={18} color="#fff" />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      <ScrollView style={styles.controls} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={[styles.trackBtn, tracking && styles.trackBtnActive]} onPress={toggleTracking}>
          <Ionicons name={tracking ? 'stop-circle' : 'navigate'} size={26} color="#fff" />
          <Text style={styles.trackBtnText}>
            {tracking ? 'Stop Sharing Location' : 'Start Sharing Location'}
          </Text>
        </TouchableOpacity>

        {tracking && (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE — Parents can see your location</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Log Events</Text>
        <View style={styles.eventsRow}>
          {[
            { type: 'ARRIVED_SCHOOL', icon: 'school', label: 'Arrived\nSchool', color: COLORS.accent },
            { type: 'DEPARTED_SCHOOL', icon: 'exit', label: 'Departed\nSchool', color: COLORS.secondary },
            { type: 'ARRIVED_HOME', icon: 'home', label: 'Arrived\nHome', color: COLORS.primary },
          ].map(e => (
            <TouchableOpacity key={e.type} style={[styles.eventBtn, { borderColor: e.color }]} onPress={() => handleEvent(e.type)}>
              <Ionicons name={e.icon + '-outline'} size={24} color={e.color} />
              <Text style={[styles.eventBtnText, { color: e.color }]}>{e.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={18} color={COLORS.primary} />
          <Text style={styles.noteText}>
            Tap "Start Sharing" at the beginning of each trip so parents can track in real-time.
            Log arrival/departure events to send notifications to parents.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: '800', color: '#fff' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  logoutBtn: { padding: 4 },
  map: { height: 280 },
  busPinOuter: { alignItems: 'center' },
  busPin: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 8, borderWidth: 3, borderColor: '#fff' },
  controls: { flex: 1, padding: 16 },
  trackBtn: { backgroundColor: COLORS.primary, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, marginBottom: 12 },
  trackBtnActive: { backgroundColor: COLORS.danger },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent + '22', borderRadius: 10, padding: 10, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  liveText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  eventsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  eventBtn: { flex: 1, borderWidth: 2, borderRadius: 14, padding: 14, alignItems: 'center', backgroundColor: '#fff', gap: 6 },
  eventBtnText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  noteCard: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.primary + '11', borderRadius: 14, padding: 14, alignItems: 'flex-start', marginBottom: 20 },
  noteText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
});