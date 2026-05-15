// src/navigation/AdminNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageDrivers from '../screens/admin/ManageDrivers';
import ManageParents from '../screens/admin/ManageParents';
import ManageAdmins from '../screens/admin/ManageAdmins';
import AddEditDriver from '../screens/admin/AddEditDriver';
import AddEditUser from '../screens/admin/AddEditUser';
import AdminProfile from '../screens/admin/AdminProfile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DriversStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageDrivers" component={ManageDrivers} />
      <Stack.Screen name="AddEditDriver" component={AddEditDriver} />
    </Stack.Navigator>
  );
}

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageParents" component={ManageParents} />
      <Stack.Screen name="ManageAdmins" component={ManageAdmins} />
      <Stack.Screen name="AddEditUser" component={AddEditUser} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.primary, borderTopWidth: 0, paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
        tabBarIcon: ({ color, size }) => {
          const icons = { Dashboard: 'grid', Drivers: 'bus', Users: 'people', Profile: 'person' };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Drivers" component={DriversStack} />
      <Tab.Screen name="Users" component={UsersStack} />
      <Tab.Screen name="Profile" component={AdminProfile} />
    </Tab.Navigator>
  );
}
