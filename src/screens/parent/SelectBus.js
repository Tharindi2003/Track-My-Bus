// src/screens/parent/SelectBus.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { getAllDrivers } from '../../services/driverService';
import { updateProfile } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export default function SelectBus({ navigation }) {
  const { profile, setProfile } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllDrivers().then(d => { setDrivers(d); setLoading(false); });
  }, []);

  const filtered = drivers.filter(d =>
    d.driverName?.toLowerCase().includes(search.toLowerCase()) ||
    d.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    d.fromLocation?.toLowerCase().includes(search.toLowerCase()) ||
    d.toLocation?.toLowerCase().includes(search.toLowerCase())
  );

  async function selectBus(driver) {
    Alert.alert('Confirm', `Set "${driver.busNumber} - ${driver.driverName}" as your bus?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Select', onPress: async () => {
          setSaving(true);
          const updated = { ...profile, assignedBusId: driver.id };
          await updateProfile(profile.userId, updated);
          setProfile(updated);
          setSaving(false);
          Alert.alert('✅ Done', 'Bus assigned successfully!');
          navigation.goBack();
        }
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Bus Route</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by driver name, bus or location..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isSelected = profile?.assignedBusId === item.id;
            return (
              <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => selectBus(item)}
                disabled={saving}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.busBadge, isSelected && { backgroundColor: COLORS.accent }]}>
                    <Ionicons name="bus" size={15} color="#fff" />
                    <Text style={styles.busBadgeText}>{item.busNumber}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                      <Text style={styles.selectedText}>My Bus</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.driverName}>{item.driverName}</Text>
                <View style={styles.routeRow}>
                  <Ionicons name="location" size={14} color={COLORS.textLight} />
                  <Text style={styles.routeText}>{item.fromLocation}</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.textLight} />
                  <Ionicons name="school" size={14} color={COLORS.textLight} />
                  <Text style={styles.routeText}>{item.toLocation}</Text>
                </View>
                <View style={styles.ratingRow}>
                  {[1,2,3,4,5].map(s => (
                    <Ionicons key={s} name="star" size={13} color={s <= Math.round(item.averageRating || 0) ? COLORS.secondary : COLORS.border} />
                  ))}
                  <Text style={styles.ratingText}>
                    {item.averageRating > 0 ? `${item.averageRating} (${item.totalRatings})` : 'No ratings yet'}
                  </Text>
                </View>
                {item.phoneNumber && (
                  <Text style={styles.phone}>{item.phoneNumber}</Text>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bus-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No bus routes found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardSelected: { borderColor: COLORS.accent },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  busBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, gap: 6 },
  busBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  driverName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  routeText: { fontSize: 12, color: COLORS.textLight },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { marginLeft: 6, fontSize: 12, color: COLORS.textLight },
  phone: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 50, gap: 12 },
  emptyText: { color: COLORS.textLight, fontSize: 15 },
});
