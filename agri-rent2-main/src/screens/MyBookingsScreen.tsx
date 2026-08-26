import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radii, spacing } from '../constants/theme';
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { cancelBooking, clearBookingError, fetchMyBookings, updateBookingStatus } from '../redux/bookingSlice';
import { formatDate } from '../utils/format';
import BottomTabBar from '../components/BottomTabBar';
import UserProfileModal from '../components/UserProfileModal';
import type { Booking, Equipment, User } from '../types';
import type { MainStackParamList } from '../navigation/types';

type FilterKey = 'All' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

const FILTERS: FilterKey[] = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:   { bg: '#FEF9EE', text: '#D4A017', dot: '#F4C95D' },
  Approved:  { bg: '#EEF8F2', text: '#1E8449', dot: '#27AE60' },
  Completed: { bg: '#EAF2FC', text: '#1A5276', dot: '#2980B9' },
  Cancelled: { bg: '#FDEDEC', text: '#922B21', dot: '#E74C3C' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Tractor: '🚜', Seeder: '🌱', Harvester: '🌾', Rotavator: '⚙️', Sprayer: '💧',
};
const CATEGORY_COLORS: Record<string, string> = {
  Tractor: '#2A5B3E', Seeder: '#4A90D9', Harvester: '#C8A227', Rotavator: '#E07B39', Sprayer: '#5BB5D5',
};

export default function MyBookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const { list, status, error } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [loadingBtns, setLoadingBtns] = useState<Record<string, boolean>>({});
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileTitle, setProfileTitle] = useState<string>('');

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearBookingError());
  }, [dispatch]);

  const canManage = user?.role === 'owner' || user?.role === 'admin';
  const isFarmer = user?.role === 'farmer';

  const filtered = activeFilter === 'All' ? list : list.filter((b) => b.status === activeFilter);

  const withLoader = async (key: string, action: () => Promise<unknown>) => {
    setLoadingBtns(prev => ({ ...prev, [key]: true }));
    try { await action(); }
    catch (err) {
      Alert.alert('Action failed', (err as string) || 'Please try again.');
    }
    finally {
      setLoadingBtns(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const equipment = item.equipmentId as Equipment;
    const equipName = equipment?.equipmentName ?? 'Equipment';
    const category = equipment?.category ?? '';
    const catIcon = CATEGORY_ICONS[category] ?? '🚜';
    const thumbColor = CATEGORY_COLORS[category] ?? colors.primary;
    const cfg = STATUS_CONFIG[item.status] ?? { bg: '#F0F4F0', text: colors.textSecondary, dot: '#ccc' };

    const owner = equipment && typeof equipment.ownerId === 'object' ? (equipment.ownerId as User) : null;
    const farmer = item.farmerId && typeof item.farmerId === 'object' ? (item.farmerId as User) : null;

    const approveKey = `${item._id}-approve`;
    const completeKey = `${item._id}-complete`;
    const cancelKey = `${item._id}-cancel`;

    return (
      <View style={styles.card}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={[styles.cardThumb, { backgroundColor: thumbColor }]}>
            <Text style={styles.cardThumbIcon}>{catIcon}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{equipName}</Text>
            <Text style={styles.cardCategory}>{category}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.statusText, { color: cfg.text }]}>{item.status}</Text>
            </View>
          </View>
        </View>

        {/* User Profiles Section (Owner & Farmer) */}
        <View style={styles.profilesRow}>
          {owner && (
            <TouchableOpacity
              style={styles.profileChipOwner}
              onPress={() => {
                setProfileUser({ ...owner, role: 'owner' });
                setProfileTitle('Equipment Owner Details');
              }}
            >
              <Text style={styles.profileChipOwnerText}>
                👤 Owner: <Text style={styles.boldText}>{owner.name}</Text>
              </Text>
              <Text style={styles.profileViewLink}>View Profile ↗</Text>
            </TouchableOpacity>
          )}

          {farmer && (
            <TouchableOpacity
              style={styles.profileChipFarmer}
              onPress={() => {
                setProfileUser({ ...farmer, role: 'farmer' });
                setProfileTitle('Farmer Contact Details');
              }}
            >
              <Text style={styles.profileChipFarmerText}>
                👨‍🌾 Farmer: <Text style={styles.boldText}>{farmer.name}</Text>
              </Text>
              <Text style={styles.profileViewLink}>View Profile ↗</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dates & amount */}
        <View style={styles.cardDivider} />
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>From</Text>
            <Text style={styles.metaValue}>{formatDate(item.startDate)}</Text>
          </View>
          <View style={styles.metaSep} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>To</Text>
            <Text style={styles.metaValue}>{formatDate(item.endDate)}</Text>
          </View>
          <View style={styles.metaSep} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={[styles.metaValue, styles.metaAmount]}>₹{item.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Actions */}
        {canManage && item.status !== 'Completed' && item.status !== 'Cancelled' && (
          <View style={styles.actions}>
            {item.status === 'Pending' && (
              <TouchableOpacity
                style={[styles.actionBtnPrimary, loadingBtns[approveKey] && styles.actionBtnDisabled]}
                disabled={loadingBtns[approveKey]}
                onPress={() => withLoader(approveKey, () => dispatch(updateBookingStatus({ id: item._id, status: 'Approved' })).unwrap())}
              >
                {loadingBtns[approveKey]
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={styles.actionBtnPrimaryText}>✓ Approve</Text>}
              </TouchableOpacity>
            )}
            {item.status === 'Approved' && (
              <TouchableOpacity
                style={[styles.actionBtnPrimary, loadingBtns[completeKey] && styles.actionBtnDisabled]}
                disabled={loadingBtns[completeKey]}
                onPress={() => withLoader(completeKey, () => dispatch(updateBookingStatus({ id: item._id, status: 'Completed' })).unwrap())}
              >
                {loadingBtns[completeKey]
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={styles.actionBtnPrimaryText}>✓ Mark Completed</Text>}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtnSecondary, loadingBtns[cancelKey] && styles.actionBtnDisabled]}
              disabled={loadingBtns[cancelKey]}
              onPress={() => withLoader(cancelKey, () => dispatch(updateBookingStatus({ id: item._id, status: 'Cancelled' })).unwrap())}
            >
              {loadingBtns[cancelKey]
                ? <ActivityIndicator size="small" color="#E74C3C" />
                : <Text style={styles.actionBtnSecondaryText}>✕ Cancel</Text>}
            </TouchableOpacity>
          </View>
        )}

        {isFarmer && item.status !== 'Completed' && item.status !== 'Cancelled' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtnSecondary, loadingBtns[cancelKey] && styles.actionBtnDisabled]}
              disabled={loadingBtns[cancelKey]}
              onPress={() => withLoader(cancelKey, () => dispatch(cancelBooking(item._id)).unwrap())}
            >
              {loadingBtns[cancelKey]
                ? <ActivityIndicator size="small" color="#E74C3C" />
                : <Text style={styles.actionBtnSecondaryText}>✕ Cancel Booking</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8F3" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerCount}>{list.length} total</Text>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item: f }) => (
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Bookings list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          ListEmptyComponent={
            status !== 'loading' ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>
                  {activeFilter === 'All' ? 'No bookings yet' : `No ${activeFilter.toLowerCase()} bookings`}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {isFarmer ? 'Browse equipment and make your first booking' : 'Bookings from farmers will appear here'}
                </Text>
                {isFarmer && (
                  <TouchableOpacity
                    style={styles.emptyAction}
                    onPress={() => navigation.navigate('EquipmentList')}
                  >
                    <Text style={styles.emptyActionText}>Browse Equipment →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <BottomTabBar activeTab="MyBookings" />

      {/* Profile Details Modal */}
      <UserProfileModal
        user={profileUser}
        visible={!!profileUser}
        onClose={() => setProfileUser(null)}
        title={profileTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  headerCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  filterWrapper: { paddingBottom: spacing.sm },
  filterRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

  card: { backgroundColor: '#FFFFFF', borderRadius: radii.md, marginBottom: spacing.md, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },

  cardHeader: { flexDirection: 'row', padding: spacing.md, gap: spacing.md },
  cardThumb: { width: 56, height: 56, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  cardThumbIcon: { fontSize: 26 },
  cardHeaderInfo: { flex: 1, justifyContent: 'center', gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardCategory: { fontSize: 12, color: colors.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 5, marginTop: 3 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  profilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileChipOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF0FA',
    borderWidth: 1,
    borderColor: '#D4DCF7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    flex: 1,
    minWidth: 140,
  },
  profileChipOwnerText: {
    fontSize: 12,
    color: '#2471A3',
    fontWeight: '600',
  },
  profileChipFarmer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF8F2',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    flex: 1,
    minWidth: 140,
  },
  profileChipFarmerText: {
    fontSize: 12,
    color: '#1E8449',
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '800',
  },
  profileViewLink: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
    marginLeft: 6,
  },

  cardDivider: { height: 1, backgroundColor: '#F0F4F0', marginHorizontal: spacing.md },

  cardMeta: { flexDirection: 'row', padding: spacing.md },
  metaItem: { flex: 1, alignItems: 'center' },
  metaSep: { width: 1, height: '100%', backgroundColor: '#F0F4F0' },
  metaLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 3 },
  metaValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  metaAmount: { color: colors.primary, fontSize: 14 },

  actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingTop: 0 },
  actionBtnPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' },
  actionBtnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  actionBtnSecondary: { flex: 1, backgroundColor: '#FDEDEC', borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' },
  actionBtnSecondaryText: { color: '#E74C3C', fontSize: 13, fontWeight: '700' },
  actionBtnDisabled: { opacity: 0.6 },

  emptyBox: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl },
  emptyAction: { marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: 24 },
  emptyActionText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
