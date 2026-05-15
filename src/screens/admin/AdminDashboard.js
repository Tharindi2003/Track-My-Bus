// src/screens/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { getDashboardStats } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';

export default function AdminDashboard({ navigation }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ admins: 0, drivers: 0, parents: 0, busDrivers: 0 });
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const s = await getDashboardStats();
    setStats(s);
  }

  useEffect(() => { load(); }, []);

  const tiles = [
    { icon: 'shield-checkmark', label: 'Admins', value: stats.admins, color: COLORS.adminColor, tab: 'Users' },
    { icon: 'bus', label: 'Bus Drivers', value: stats.busDrivers, color: COLORS.driverColor, tab: 'Drivers' },
    { icon: 'people', label: 'Parents', value: stats.parents, color: COLORS.parentColor, tab: 'Users' },
  ];

  const actions = [
    { icon: 'person-add', label: 'Add Driver', color: COLORS.driverColor, screen: 'Drivers' },
    { icon: 'shield-checkmark', label: 'Add Admin', color: COLORS.adminColor, screen: 'Users' },
    { icon: 'bus', label: 'Manage Buses', color: COLORS.secondary, screen: 'Drivers' },
    { icon: 'people', label: 'View Parents', color: COLORS.parentColor, screen: 'Users' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().then(() => setRefreshing(false)); }} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.role}>System Administrator</Text>
        </View>
        <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsRow}>
        {tiles.map(t => (
          <TouchableOpacity key={t.label} style={[styles.tile, { borderTopColor: t.color }]}
            onPress={() => navigation.navigate(t.tab)}>
            <Ionicons name={t.icon} size={28} color={t.color} />
            <Text style={styles.tileValue}>{t.value}</Text>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map(a => (
          <TouchableOpacity key={a.label} style={styles.actionCard}
            onPress={() => navigation.navigate(a.screen)}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}>
              <Ionicons name={a.icon} size={26} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={22} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Manage all bus drivers, parents, and admins from this dashboard.
          Drivers receive credentials from admins — parents self-register.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 24, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  role: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  logoutBtn: { padding: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, margin: 16, marginBottom: 10 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 10 },
  tile: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderTopWidth: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tileValue: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  tileLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  actionCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  infoCard: { margin: 16, backgroundColor: COLORS.primary + '11', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
});
