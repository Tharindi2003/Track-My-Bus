// src/screens/parent/TrackBus.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { subscribeToBusLocation, calculateETA } from '../../services/trackingService';
import { rateDriver } from '../../services/driverService';
import { useAuth } from '../../hooks/useAuth';

export default function TrackBus({ navigation, route }) {
  const { driverId, driver } = route.params;
  const { profile } = useAuth();
  const [busLocation, setBusLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const mapRef = useRef(null);

  const schoolLat = driver?.schoolLocation?.latitude || 6.9271;
  const schoolLng = driver?.schoolLocation?.longitude || 79.8612;

  useEffect(() => {
    const unsub = subscribeToBusLocation(driverId, (loc) => {
      setBusLocation(loc);
      if (loc.latitude && loc.longitude) {
        const mins = calculateETA(loc.latitude, loc.longitude, schoolLat, schoolLng, loc.speed > 0 ? loc.speed * 3.6 : 30);
        setEta(mins);
        mapRef.current?.animateToRegion({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 500);
      }
    });
    return unsub;
  }, [driverId]);

  async function submitRating(stars) {
    setUserRating(stars);
    await rateDriver(driverId, profile.userId, stars);
    setRatingSubmitted(true);
  }

  if (!busLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Waiting for bus location...</Text>
        <Text style={styles.loadingSubText}>Driver must start sharing location first</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>{driver?.busNumber}</Text>
          <Text style={styles.headerSub}>{driver?.driverName}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Map - OpenStreetMap (FREE, no API key, no credit card) */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: busLocation.latitude || schoolLat,
          longitude: busLocation.longitude || schoolLng,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Bus Marker */}
        {busLocation.latitude && (
          <Marker coordinate={{ latitude: busLocation.latitude, longitude: busLocation.longitude }} title={driver?.busNumber} description={driver?.driverName}>
            <View style={styles.busPinWrap}>
              <View style={styles.busPin}>
                <Ionicons name="bus" size={20} color="#fff" />
              </View>
              <View style={styles.busPinTail} />
            </View>
          </Marker>
        )}

        {/* School Marker */}
        <Marker coordinate={{ latitude: schoolLat, longitude: schoolLng }} title="School">
          <View style={styles.schoolPin}>
            <Ionicons name="school" size={18} color="#fff" />
          </View>
        </Marker>

        {/* Dotted route line from bus to school */}
        {busLocation.latitude && (
          <Polyline
            coordinates={[
              { latitude: busLocation.latitude, longitude: busLocation.longitude },
              { latitude: schoolLat, longitude: schoolLng },
            ]}
            strokeColor={COLORS.primary}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.panel}>
        {eta !== null && (
          <View style={styles.etaCard}>
            <Ionicons name="time" size={20} color={COLORS.secondary} />
            <View>
              <Text style={styles.etaLabel}>Estimated arrival at school</Text>
              <Text style={styles.etaValue}>{eta < 1 ? 'Arriving now!' : `~${eta} minutes away`}</Text>
            </View>
          </View>
        )}
        {busLocation.speed > 0 && (
          <View style={styles.speedChip}>
            <Ionicons name="speedometer" size={16} color={COLORS.primary} />
            <Text style={styles.speedText}>{(busLocation.speed * 3.6).toFixed(0)} km/h</Text>
          </View>
        )}
        <Text style={styles.updatedText}>
          Last updated: {busLocation.updatedAt ? new Date(busLocation.updatedAt).toLocaleTimeString() : '-'}
        </Text>
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate this driver</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => !ratingSubmitted && submitRating(s)}>
                <Ionicons name={s <= userRating ? 'star' : 'star-outline'} size={28} color={s <= userRating ? COLORS.secondary : COLORS.border} />
              </TouchableOpacity>
            ))}
          </View>
          {ratingSubmitted && <Text style={styles.ratingThanks}>Thanks for rating! ✅</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 30 },
  loadingText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  loadingSubText: { color: COLORS.textLight, fontSize: 13, textAlign: 'center' },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  map: { flex: 1 },
  busPinWrap: { alignItems: 'center' },
  busPin: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 8, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  busPinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.primary },
  schoolPin: { backgroundColor: COLORS.accent, borderRadius: 20, padding: 8, borderWidth: 3, borderColor: '#fff' },
  panel: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 },
  etaCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.secondary + '18', borderRadius: 14, padding: 14, marginBottom: 10 },
  etaLabel: { fontSize: 12, color: COLORS.textLight },
  etaValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  speedChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: COLORS.primary + '11', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  speedText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  updatedText: { fontSize: 12, color: COLORS.textLight, marginBottom: 14 },
  ratingSection: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 },
  ratingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  starsRow: { flexDirection: 'row', gap: 6 },
  ratingThanks: { color: COLORS.accent, fontWeight: '600', marginTop: 8, fontSize: 13 },
});
