import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import EquipmentListScreen from '../screens/EquipmentListScreen';
import EquipmentDetailsScreen from '../screens/EquipmentDetailsScreen';
import AddEquipmentScreen from '../screens/AddEquipmentScreen';
import BookingScreen from '../screens/BookingScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EquipmentList" component={EquipmentListScreen} />
      <Stack.Screen name="EquipmentDetails" component={EquipmentDetailsScreen} />
      <Stack.Screen name="AddEquipment" component={AddEquipmentScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
