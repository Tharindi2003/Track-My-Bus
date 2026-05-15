// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
import { AuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

// ✅ GLOBAL FIX: Prevents keyboard from dismissing on every keystroke
// This patches ALL TextInputs in the entire app at once
TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  blurOnSubmit: false,
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}