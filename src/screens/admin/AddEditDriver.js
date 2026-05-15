// src/screens/admin/AddEditDriver.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { addDriver, updateDriver } from '../../services/driverService';

const Field = ({ label, field, form, onUpdate, secret, ...props }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={form[field]}
      onChangeText={v => onUpdate(field, v)}
      placeholderTextColor={COLORS.textLight}
      autoCorrect={false}
      blurOnSubmit={false}
      secureTextEntry={secret || false}
      {...props}
    />
  </View>
);

export default function AddEditDriver({ navigation, route }) {
  const existing = route.params?.driver;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    busNumber: existing?.busNumber || '',
    driverName: existing?.driverName || '',
    fromLocation: existing?.fromLocation || '',
    toLocation: existing?.toLocation || '',
    phoneNumber: existing?.phoneNumber || '',
    email: existing?.email || '',
    password: '',
    schoolLatitude: existing?.schoolLocation?.latitude?.toString() || '6.9271',
    schoolLongitude: existing?.schoolLocation?.longitude?.toString() || '79.8612',
  });
  const [loading, setLoading] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.busNumber || !form.driverName || !form.fromLocation || !form.toLocation)
      return Alert.alert('Error', 'Bus number, driver name, from and to locations are required');
    if (!isEdit && !form.email)
      return Alert.alert('Error', 'Email is required');
    if (!isEdit && form.password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const data = {
        ...form,
        schoolLocation: {
          latitude: parseFloat(form.schoolLatitude) || 6.9271,
          longitude: parseFloat(form.schoolLongitude) || 79.8612,
        },
      };
      delete data.schoolLatitude;
      delete data.schoolLongitude;
      delete data.password;

      if (isEdit) {
        await updateDriver(existing.id, data);
        Alert.alert('Success', 'Driver updated');
      } else {
        await addDriver(data, form.email.trim(), form.password);
        Alert.alert('✅ Driver Added', `Login credentials:\nEmail: ${form.email}\nPassword: ${form.password}`);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Driver' : 'Add Driver'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Bus Number *" field="busNumber" placeholder="e.g. WP NA - 8965" form={form} onUpdate={update} />
          <Field label="Driver Name *" field="driverName" placeholder="e.g. Mr. Kamal Silva" autoCapitalize="words" form={form} onUpdate={update} />
          <Field label="From Location *" field="fromLocation" placeholder="e.g. Negombo" autoCapitalize="words" form={form} onUpdate={update} />
          <Field label="To Location *" field="toLocation" placeholder="e.g. Colombo" autoCapitalize="words" form={form} onUpdate={update} />
          <Field label="Phone Number" field="phoneNumber" placeholder="+94771234567" keyboardType="phone-pad" form={form} onUpdate={update} />

          {/* Email & Password only shown when adding new driver */}
          {!isEdit && (
            <>
              <View style={styles.divider}>
                <Text style={styles.dividerText}>LOGIN CREDENTIALS</Text>
              </View>
              <Field label="Driver Email *" field="email" placeholder="driver@example.com" keyboardType="email-address" autoCapitalize="none" form={form} onUpdate={update} />
              <Field label="Password *" field="password" placeholder="Min 6 characters" secret form={form} onUpdate={update} />
            </>
          )}

          <View style={styles.divider}>
            <Text style={styles.dividerText}>SCHOOL LOCATION (FOR ETA)</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput style={styles.input} value={form.schoolLatitude} onChangeText={v => update('schoolLatitude', v)} keyboardType="decimal-pad" blurOnSubmit={false} />
            </View>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput style={styles.input} value={form.schoolLongitude} onChangeText={v => update('schoolLongitude', v)} keyboardType="decimal-pad" blurOnSubmit={false} />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>{isEdit ? 'Update Driver' : 'Add Driver'}</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  form: { padding: 20 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  divider: { marginVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 },
  dividerText: { fontSize: 11, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 10 },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16, marginBottom: 30 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});