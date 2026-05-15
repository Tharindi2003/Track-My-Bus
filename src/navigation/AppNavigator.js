// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../utils/theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Role navigators
import AdminNavigator from './AdminNavigator';
import DriverNavigator from './DriverNavigator';
import ParentNavigator from './ParentNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  // Not logged in → show auth screens
  if (!user || !profile) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Logged in → route by role
  return (
    <NavigationContainer>
      {profile.role === 'ADMIN' && <AdminNavigator />}
      {profile.role === 'DRIVER' && <DriverNavigator />}
      {profile.role === 'PARENT' && <ParentNavigator />}
    </NavigationContainer>
  );
}
