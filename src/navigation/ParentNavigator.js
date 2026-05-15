// src/navigation/ParentNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

import ParentHome from '../screens/parent/ParentHome';
import TrackBus from '../screens/parent/TrackBus';
import TripHistory from '../screens/parent/TripHistory';
import SelectBus from '../screens/parent/SelectBus';
import ParentProfile from '../screens/parent/ParentProfile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentHome" component={ParentHome} />
      <Stack.Screen name="TrackBus" component={TrackBus} />
      <Stack.Screen name="SelectBus" component={SelectBus} />
    </Stack.Navigator>
  );
}

export default function ParentNavigator() {
  return (
    <Tab.Navigator
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
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="History" component={TripHistory} />
      <Tab.Screen name="Profile" component={ParentProfile} />
    </Tab.Navigator>
  );
}
