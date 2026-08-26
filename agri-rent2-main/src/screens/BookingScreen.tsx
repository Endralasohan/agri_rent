import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CalendarPicker from '../components/CalendarPicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radii, spacing } from '../constants/theme';
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { createBooking, clearBookingError } from '../redux/bookingSlice';
import { fetchEquipmentById } from '../redux/equipmentSlice';
import type { MainStackParamList } from '../navigation/types';

const CATEGORY_ICONS: Record<string, string> = {
  Tractor: '🚜', Seeder: '🌱', Harvester: '🌾', Rotavator: '⚙️', Sprayer: '💧',
};
const CATEGORY_COLORS: Record<string, string> = {
  Tractor: '#2A5B3E', Seeder: '#4A90D9', Harvester: '#C8A227', Rotavator: '#E07B39', Sprayer: '#5BB5D5',
};

function calculateDays(start: string, end: string) {
  const s = new Date(start), e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  const sDay = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const eDay = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const diff = Math.round((eDay - sDay) / 86400000);
  return diff < 0 ? 0 : diff + 1;
}

export default function BookingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'Booking'>>();
  const dispatch = useAppDispatch();
  const { selected, list } = useAppSelector((state) => state.equipment);
  const { error } = useAppSelector((state) => state.booking);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchEquipmentById(route.params.equipmentId));
  }, [dispatch, route.params.equipmentId]);

  useEffect(() => {
    dispatch(clearBookingError());
  }, [dispatch]);

  const equipment = useMemo(() => {
    if (selected?._id === route.params.equipmentId) return selected;
    return list.find((i) => i._id === route.params.equipmentId) ?? null;
  }, [list, route.params.equipmentId, selected]);

  const days = calculateDays(startDate, endDate);
  const total = equipment ? equipment.pricePerDay * (days || 0) : 0;

  const handleBooking = async () => {
    if (!equipment) return;
    if (!startDate || !endDate) {
      Alert.alert('Missing dates', 'Please enter start and end dates.');
      return;
    }
    if (days <= 0) {
      Alert.alert('Invalid dates', 'End date must be after start date.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(createBooking({ equipmentId: equipment._id, startDate, endDate })).unwrap();
      dispatch(clearBookingError());
      navigation.navigate('MyBookings');
    } catch (err) {
      Alert.alert('Booking failed', (err as string) || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!equipment) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Loading equipment...</Text>
      </View>
    );
  }

  const thumbColor = CATEGORY_COLORS[equipment.category] ?? colors.primary;
  const catIcon = CATEGORY_ICONS[equipment.category] ?? '🚜';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8F3" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Equipment</Text>
          <View style={{ width: 36 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Equipment summary card */}
            <View style={styles.equipCard}>
              <View style={[styles.equipThumb, { backgroundColor: thumbColor }]}>
                <Text style={styles.equipIcon}>{catIcon}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text style={styles.equipName}>{equipment.equipmentName}</Text>
                <Text style={styles.equipCategory}>{catIcon}  {equipment.category}</Text>
                <Text style={styles.equipRate}>₹{equipment.pricePerDay.toLocaleString('en-IN')} / day</Text>
              </View>
            </View>

            {/* Owner banner */}
            {equipment.ownerId && typeof equipment.ownerId === 'object' && (
              <View style={styles.ownerNotice}>
                <Text style={styles.ownerNoticeText}>
                  👤 Owner: <Text style={{ fontWeight: '800' }}>{(equipment.ownerId as any).name}</Text>
                  {(equipment.ownerId as any).phone ? ` • 📞 ${(equipment.ownerId as any).phone}` : ''}
                </Text>
              </View>
            )}

            {!equipment.available && (
              <View style={styles.unavailBanner}>
                <Text style={styles.unavailText}>⚠️  This equipment is currently unavailable for booking.</Text>
              </View>
            )}

            {/* Date selection */}
            <Text style={styles.sectionTitle}>Select Rental Dates</Text>

            <View style={styles.dateCard}>
              <View style={styles.dateRow}>
                <CalendarPicker
                  label="Start Date"
                  selected={startDate}
                  onSelect={setStartDate}
                />
                <View style={styles.dateDivider} />
                <CalendarPicker
                  label="End Date"
                  selected={endDate}
                  onSelect={setEndDate}
                  minDate={startDate || undefined}
                />
              </View>
            </View>

            {/* Price summary */}
            {days > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Price Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Rate per day</Text>
                  <Text style={styles.summaryValue}>₹{equipment.pricePerDay.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Number of days</Text>
                  <Text style={styles.summaryValue}>{days} day{days > 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                  <Text style={styles.summaryTotal}>₹{total.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            )}

            {/* Info note */}
            <View style={styles.infoNote}>
              <Text style={styles.infoNoteIcon}>ℹ️</Text>
              <Text style={styles.infoNoteText}>
                Your booking will be sent to the equipment owner for approval. You'll be notified once confirmed.
              </Text>
            </View>

            <View style={{ height: 32 }} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Footer action */}
      <View style={styles.footer}>
        {days > 0 && (
          <View style={styles.footerPriceSummary}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerTotal}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (saving || !equipment.available) && styles.confirmBtnDisabled,
            days > 0 && styles.confirmBtnSplit,
          ]}
          onPress={handleBooking}
          disabled={saving || !equipment.available}
        >
          <Text style={styles.confirmBtnText}>
            {saving ? 'Booking...' : equipment.available ? 'Confirm Booking →' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F3' },
  loadingText: { color: colors.textSecondary },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 },
  backArrow: { fontSize: 18, color: colors.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.textPrimary },

  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 24 },

  equipCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: radii.md, marginBottom: spacing.lg, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
  equipThumb: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  equipIcon: { fontSize: 36 },
  equipInfo: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 3 },
  equipName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  equipCategory: { fontSize: 12, color: colors.textSecondary },
  equipLocation: { fontSize: 12, color: colors.textSecondary },
  equipRate: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 2 },

  unavailBanner: { backgroundColor: '#FEF0EE', borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FADBD8' },
  unavailText: { fontSize: 13, color: '#C0392B', lineHeight: 20 },

  ownerNotice: { backgroundColor: '#EEF0FA', borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#D4DCF7' },
  ownerNoticeText: { fontSize: 13, color: '#2471A3' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },

  dateCard: { backgroundColor: '#FFFFFF', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'stretch' },
  dateDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.sm },

  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  summaryTotal: { fontSize: 18, fontWeight: '800', color: colors.primary },

  infoNote: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#EEF6F2', borderRadius: radii.sm, padding: spacing.md },
  infoNoteIcon: { fontSize: 16 },
  infoNoteText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },

  footer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EDE8', padding: spacing.lg, paddingBottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerPriceSummary: { flex: 1 },
  footerLabel: { fontSize: 12, color: colors.textSecondary },
  footerTotal: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  confirmBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 15, alignItems: 'center' },
  confirmBtnSplit: { flex: 1 },
  confirmBtnDisabled: { backgroundColor: '#95a5a6' },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
