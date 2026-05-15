// src/screens/admin/ManageDrivers.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { subscribeToDrivers, deleteDriver } from '../../services/driverService';

export default function ManageDrivers({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToDrivers((data) => {
      setDrivers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = drivers.filter(d =>
    d.driverName?.toLowerCase().includes(search.toLowerCase()) ||
    d.busNumber?.toLowerCase().includes(search.toLowerCase())
  );

  function confirmDelete(driver) {
    Alert.alert('Delete Driver', `Remove ${driver.driverName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDriver(driver.id) },
    ]);
  }

  function renderDriver({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.busNumBadge}>
            <Ionicons name="bus" size={16} color="#fff" />
            <Text style={styles.busNum}>{item.busNumber}</Text>
          </View>
          <Text style={styles.driverName}>{item.driverName}</Text>
          <Text style={styles.route}>{item.fromLocation} → {item.toLocation}</Text>
          {item.email ? <Text style={styles.contact}>{item.email}</Text> : null}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.secondary} />
            <Text style={styles.ratingText}>
              {item.averageRating > 0 ? `${item.averageRating} (${item.totalRatings})` : 'No ratings'}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn}
            onPress={() => navigation.navigate('AddEditDriver', { driver: item })}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bus Drivers</Text>
        <TouchableOpacity style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditDriver', { driver: null })}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or bus number..."
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
          renderItem={renderDriver}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bus-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No drivers found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardLeft: { flex: 1 },
  busNumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', gap: 6, marginBottom: 8 },
  busNum: { color: '#fff', fontWeight: '700', fontSize: 13 },
  driverName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  route: { color: COLORS.textLight, fontSize: 13, marginTop: 2 },
  contact: { color: COLORS.textLight, fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  ratingText: { fontSize: 12, color: COLORS.textLight },
  cardActions: { gap: 8, marginLeft: 10 },
  editBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.danger + '15', justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: COLORS.textLight, fontSize: 15 },
});
