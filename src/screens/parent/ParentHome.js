// src/screens/parent/ParentHome.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { getDriver } from '../../services/driverService';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../services/firebase';


export default function ParentHome({ navigation }) {
  const { profile, logout } = useAuth();
  const [myDriver, setMyDriver] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (profile?.assignedBusId) {
      const d = await getDriver(profile.assignedBusId);
      setMyDriver(d);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (profile?.assignedBusId) {
      const locRef = ref(db, `liveLocations/${profile.assignedBusId}`);
      onValue(locRef, snap => {
        if (snap.exists()) setLiveLocation(snap.val());
      });
      const notifRef = ref(db, `notifications/${profile.assignedBusId}/latest`);
      onValue(notifRef, snap => {
        if (snap.exists()) setNotification(snap.val());
      });
      return () => { off(locRef); off(notifRef); };
    }
  }, [profile?.assignedBusId]);

  const notifLabels = {
    ARRIVED_SCHOOL: { text: '🏫 Bus arrived at school', color: COLORS.accent },
    DEPARTED_SCHOOL: { text: '🚌 Bus departed from school', color: COLORS.secondary },
    ARRIVED_HOME: { text: '🏠 Bus arrived at home drop', color: COLORS.primary },
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().then(() => setRefreshing(false)); }} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.sub}>Track your child's bus</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Logout', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ])}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {notification && (
        <View style={[styles.notifCard, { borderLeftColor: notifLabels[notification.type]?.color || COLORS.primary }]}>
          <Text style={styles.notifText}>{notifLabels[notification.type]?.text || notification.type}</Text>
          <Text style={styles.notifTime}>{new Date(notification.timestamp).toLocaleTimeString()}</Text>
        </View>
      )}

      {myDriver ? (
        <View style={styles.busCard}>
          <View style={styles.busCardHeader}>
            <View style={styles.busBadge}>
              <Ionicons name="bus" size={18} color="#fff" />
              <Text style={styles.busBadgeText}>{myDriver.busNumber}</Text>
            </View>
            <View style={[styles.liveIndicator, { backgroundColor: liveLocation?.isActive ? COLORS.accent : COLORS.border }]}>
              <Text style={styles.liveText}>{liveLocation?.isActive ? '● LIVE' : '○ OFFLINE'}</Text>
            </View>
          </View>
          <Text style={styles.driverName}>{myDriver.driverName}</Text>
          <Text style={styles.route}>{myDriver.fromLocation} → {myDriver.toLocation}</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <Ionicons key={s} name="star" size={16} color={s <= Math.round(myDriver.averageRating) ? COLORS.secondary : COLORS.border} />
            ))}
            <Text style={styles.ratingText}>{myDriver.averageRating > 0 ? myDriver.averageRating.toFixed(1) : 'No ratings'}</Text>
          </View>
          {liveLocation?.isActive ? (
            <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('TrackBus', { driverId: profile.assignedBusId, driver: myDriver })}>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.trackBtnText}>Track Bus Now</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.offlineBtn}>
              <Ionicons name="navigate-outline" size={20} color={COLORS.textLight} />
              <Text style={styles.offlineBtnText}>Bus is not currently active</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noBusCard}>
          <Ionicons name="bus-outline" size={48} color={COLORS.border} />
          <Text style={styles.noBusTitle}>No Bus Assigned</Text>
          <Text style={styles.noBusSub}>Select your child's bus route to start tracking</Text>
          <TouchableOpacity style={styles.selectBusBtn} onPress={() => navigation.navigate('SelectBus')}>
            <Text style={styles.selectBusBtnText}>Select Bus Route</Text>
          </TouchableOpacity>
        </View>
      )}

      {myDriver && (
        <TouchableOpacity style={styles.changeBusBtn} onPress={() => navigation.navigate('SelectBus')}>
          <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />
          <Text style={styles.changeBusText}>Change Bus Route</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time" size={28} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Trip History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={28} color={COLORS.primary} />
          <Text style={styles.actionLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  notifCard: { margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderLeftWidth: 4 },
  notifText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  notifTime: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  busCard: { backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  busCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  busBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  busBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  liveIndicator: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  driverName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  route: { color: COLORS.textLight, fontSize: 13, marginTop: 4, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 16 },
  ratingText: { marginLeft: 6, color: COLORS.textLight, fontSize: 13 },
  trackBtn: { backgroundColor: COLORS.primary, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  offlineBtn: { backgroundColor: COLORS.bg, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border },
  offlineBtnText: { color: COLORS.textLight, fontSize: 14 },
  noBusCard: { backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 30, alignItems: 'center', gap: 10 },
  noBusTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  noBusSub: { fontSize: 13, color: COLORS.textLight, textAlign: 'center' },
  selectBusBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  selectBusBtnText: { color: '#fff', fontWeight: '700' },
  changeBusBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.primary + '11', borderRadius: 12, paddingVertical: 10 },
  changeBusText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginTop: 8, marginBottom: 10 },
  quickActions: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 30 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
});