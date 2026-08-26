import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import type { MainStackParamList } from '../navigation/types';

const TABS = [
  { key: 'Home',       icon: '🏠',  label: 'Home',        route: 'Home' },
  { key: 'Bookings',   icon: '🔍',  label: 'Bookings',    route: 'EquipmentList' },
  { key: 'Plus',       icon: '+',   label: 'Add',         route: 'AddEquipment' },
  { key: 'MyBookings', icon: '📋',  label: 'My Bookings', route: 'MyBookings' },
  { key: 'Profile',    icon: '👤',  label: 'Profile',     route: 'Profile' },
] as const;

type TabKey = typeof TABS[number]['key'];

type Props = { activeTab: TabKey };

export default function BottomTabBar({ activeTab }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isPlus = tab.key === 'Plus';
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isPlus && styles.tabItemPlus]}
            onPress={() => navigation.navigate(tab.route as any)}
            activeOpacity={0.8}
          >
            {isPlus ? (
              <View style={styles.plusCircle}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E8EDE8',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabItemPlus: {
    marginTop: -20,
  },
  plusCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  tabIcon: {
    fontSize: 20,
    color: '#9AA89A',
  },
  tabIconActive: {
    color: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    color: '#9AA89A',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
