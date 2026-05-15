// src/navigation/DriverNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

import DriverHome from '../screens/driver/DriverHome';
import DriverProfile from '../screens/driver/DriverProfile';

const Tab = createBottomTabNavigator();

export function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.primary, borderTopWidth: 0, paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
        tabBarIcon: ({ color, size }) => {
          const icons = { Home: 'navigate', Profile: 'person' };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DriverHome} />
      <Tab.Screen name="Profile" component={DriverProfile} />
    </Tab.Navigator>
  );
}

export default DriverNavigator;

// ─────────────────────────────────────────────────────────────

// src/navigation/ParentNavigator.js  (inline export)
import ParentHome from '../screens/parent/ParentHome';
import TrackBus from '../screens/parent/TrackBus';
import TripHistory from '../screens/parent/TripHistory';
import SelectBus from '../screens/parent/SelectBus';
import ParentProfile from '../screens/parent/ParentProfile';
import { createStackNavigator } from '@react-navigation/stack';

const PTab = createBottomTabNavigator();
const PStack = createStackNavigator();

function HomeStack() {
  return (
    <PStack.Navigator screenOptions={{ headerShown: false }}>
      <PStack.Screen name="ParentHome" component={ParentHome} />
      <PStack.Screen name="TrackBus" component={TrackBus} />
      <PStack.Screen name="SelectBus" component={SelectBus} />
    </PStack.Navigator>
  );
}

export function ParentNavigator() {
  return (
    <PTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.primary, borderTopWidth: 0, paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
        tabBarIcon: ({ color, size }) => {
          const icons = { Home: 'home', History: 'time', Profile: 'person' };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <PTab.Screen name="Home" component={HomeStack} />
      <PTab.Screen name="History" component={TripHistory} />
      <PTab.Screen name="Profile" component={ParentProfile} />
    </PTab.Navigator>
  );
}
