// src/screens/parent/TripHistory.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { getTripHistory } from '../../services/trackingService';

const EVENT_CONFIG = {
  ARRIVED_SCHOOL: { icon: 'school', color: COLORS.accent, label: 'Arrived at School', bg: '#E8FFF3' },
  DEPARTED_SCHOOL: { icon: 'exit', color: COLORS.secondary, label: 'Departed from School', bg: '#FFF8E8' },
  ARRIVED_HOME: { icon: 'home', color: COLORS.primary, label: 'Arrived at Home', bg: '#EBF2FF' },
};

export default function TripHistory() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!profile?.assignedBusId) { setLoading(false); return; }
    const data = await getTripHistory(profile.assignedBusId, days);
    setEvents(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [days, profile?.assignedBusId]);

  // Group events by date
  const grouped = events.reduce((acc, event) => {
    const dateKey = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const sections = Object.entries(grouped);

  function renderEvent(event) {
    const config = EVENT_CONFIG[event.type] || { icon: 'time', color: COLORS.textLight, label: event.type, bg: '#F5F5F5' };
    const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <View key={event.id} style={[styles.eventRow, { backgroundColor: config.bg }]}>
        <View style={[styles.eventIcon, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon + '-outline'} size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventLabel}>{config.label}</Text>
          <Text style={styles.eventTime}>{time}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={20} color={config.color} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Show last:</Text>
        {[3, 7, 14, 30].map(d => (
          <TouchableOpacity key={d} style={[styles.filterBtn, days === d && styles.filterBtnActive]} onPress={() => setDays(d)}>
            <Text style={[styles.filterBtnText, days === d && styles.filterBtnTextActive]}>{d}d</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : !profile?.assignedBusId ? (
        <View style={styles.empty}>
          <Ionicons name="bus-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>Assign a bus first to see history</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>No events in the last {days} days</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={([date]) => date}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().then(() => setRefreshing(false)); }} />}
          renderItem={({ item: [date, dayEvents] }) => (
            <View style={styles.daySection}>
              <View style={styles.dateBadge}>
                <Ionicons name="calendar" size={14} color={COLORS.primary} />
                <Text style={styles.dateText}>{date}</Text>
              </View>
              {dayEvents.map(renderEvent)}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterLabel: { fontSize: 13, color: COLORS.textLight, marginRight: 4 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  filterBtnTextActive: { color: '#fff' },
  daySection: { marginBottom: 16 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dateText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 6 },
  eventIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  eventTime: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: COLORS.textLight, fontSize: 15 },
});
