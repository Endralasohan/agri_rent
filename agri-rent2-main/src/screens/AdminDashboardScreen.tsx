import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../constants/theme';
import api from '../services/api';
import type { Booking, Equipment, User } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import BottomTabBar from '../components/BottomTabBar';
import useAppDispatch from '../hooks/useAppDispatch';
import { logout } from '../redux/authSlice';

type TabKey = 'Overview' | 'Users' | 'Equipment' | 'Bookings';
const TABS: TabKey[] = ['Overview', 'Users', 'Equipment', 'Bookings'];

type Summary = { users: number; equipment: number; bookings: number };

const STATUS_COLORS: Record<string, string> = {
  Pending: '#D4A017', Approved: '#1E8449', Completed: '#2980B9', Cancelled: '#E74C3C',
};
const STATUS_BG: Record<string, string> = {
  Pending: '#FEF9EE', Approved: '#EEF8F2', Completed: '#EAF2FC', Cancelled: '#FDEDEC',
};
const ROLE_COLORS: Record<string, string> = {
  farmer: '#1E8449', owner: '#2471A3', admin: '#D4A017',
};
const ROLE_BG: Record<string, string> = {
  farmer: '#EEF8F2', owner: '#EEF0FA', admin: '#FEF9EE',
};
const CATEGORY_COLORS: Record<string, string> = {
  Tractor: '#2A5B3E', Seeder: '#4A90D9', Harvester: '#C8A227', Rotavator: '#E07B39', Sprayer: '#5BB5D5',
};
const CATEGORY_ICONS: Record<string, string> = {
  Tractor: '🚜', Seeder: '🌱', Harvester: '🌾', Rotavator: '⚙️', Sprayer: '💧',
};

export default function AdminDashboardScreen() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabKey>('Overview');
  const [summary, setSummary] = useState<Summary>({ users: 0, equipment: 0, bookings: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, uRes, eRes, bRes] = await Promise.all([
        api.get<Summary>('/admin/summary'),
        api.get<{ users: User[] }>('/admin/users'),
        api.get<{ equipment: Equipment[] }>('/admin/equipment'),
        api.get<{ bookings: Booking[] }>('/admin/bookings'),
      ]);
      setSummary(sRes.data);
      setUsers(uRes.data.users);
      setEquipment(eRes.data.equipment);
      setBookings(bRes.data.bookings);
    } catch (err) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else if (axiosErr.response?.status === 403) {
        setError('Access denied. You do not have permission to view this page.');
      } else {
        setError('Failed to load admin data. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderOverview = () => (
    <View style={styles.overviewWrap}>
      {/* Stat cards */}
      <View style={styles.statRow}>
        <StatCard icon="👥" label="Total Users" value={summary.users} color="#2471A3" bg="#EEF0FA" />
        <StatCard icon="🚜" label="Equipment" value={summary.equipment} color="#2A5B3E" bg="#EEF8F2" />
        <StatCard icon="📋" label="Bookings" value={summary.bookings} color="#D4A017" bg="#FEF9EE" />
      </View>

      {/* Recent activity */}
      <Text style={styles.sectionTitle}>Recent Users</Text>
      {users.slice(0, 5).map(u => (
        <View key={u._id} style={styles.miniRow}>
          <View style={[styles.miniAvatar, { backgroundColor: ROLE_BG[u.role] ?? '#F0F4F0' }]}>
            <Text style={styles.miniAvatarText}>{(u.name ?? 'U')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.miniInfo}>
            <Text style={styles.miniName}>{u.name}</Text>
            <Text style={styles.miniSub}>{u.email}</Text>
          </View>
          <View style={[styles.rolePill, { backgroundColor: ROLE_BG[u.role] ?? '#F0F4F0' }]}>
            <Text style={[styles.rolePillText, { color: ROLE_COLORS[u.role] ?? colors.textSecondary }]}>
              {u.role}
            </Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Recent Bookings</Text>
      {bookings.slice(0, 5).map(b => {
        const eq = b.equipmentId as Equipment;
        return (
          <View key={b._id} style={styles.miniRow}>
            <View style={[styles.miniAvatar, { backgroundColor: STATUS_BG[b.status] ?? '#F0F4F0' }]}>
              <Text style={styles.miniAvatarText}>📋</Text>
            </View>
            <View style={styles.miniInfo}>
              <Text style={styles.miniName}>{eq?.equipmentName ?? 'Equipment'}</Text>
              <Text style={styles.miniSub}>{formatDate(b.startDate)} → {formatDate(b.endDate)}</Text>
            </View>
            <View style={[styles.rolePill, { backgroundColor: STATUS_BG[b.status] ?? '#F0F4F0' }]}>
              <Text style={[styles.rolePillText, { color: STATUS_COLORS[b.status] ?? colors.textSecondary }]}>
                {b.status}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderUsers = () => (
    <FlatList
      data={users}
      keyExtractor={u => u._id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      ListEmptyComponent={<EmptyState icon="👥" text="No users found" />}
      renderItem={({ item: u }) => (
        <View style={styles.card}>
          <View style={[styles.cardAvatar, { backgroundColor: ROLE_BG[u.role] ?? '#F0F4F0' }]}>
            <Text style={[styles.cardAvatarText, { color: ROLE_COLORS[u.role] ?? colors.textPrimary }]}>
              {(u.name ?? 'U')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{u.name}</Text>
            <Text style={styles.cardSub}>{u.email}</Text>
            {u.phone ? <Text style={styles.cardSub}>📞 {u.phone}</Text> : null}
          </View>
          <View style={[styles.rolePill, { backgroundColor: ROLE_BG[u.role] ?? '#F0F4F0' }]}>
            <Text style={[styles.rolePillText, { color: ROLE_COLORS[u.role] ?? colors.textSecondary }]}>
              {u.role}
            </Text>
          </View>
        </View>
      )}
    />
  );

  const renderEquipment = () => (
    <FlatList
      data={equipment}
      keyExtractor={e => e._id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      ListEmptyComponent={<EmptyState icon="🚜" text="No equipment found" />}
      renderItem={({ item: e }) => (
        <View style={styles.card}>
          <View style={[styles.cardAvatar, { backgroundColor: CATEGORY_COLORS[e.category] ?? colors.primary }]}>
            <Text style={styles.cardAvatarEmoji}>{CATEGORY_ICONS[e.category] ?? '🚜'}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{e.equipmentName}</Text>
            <Text style={styles.cardSub}>{e.category} · ₹{e.pricePerDay.toLocaleString('en-IN')}/day</Text>
            {(e.ownerId as User)?.name ? (
              <Text style={styles.cardSub}>👤 {(e.ownerId as User).name}</Text>
            ) : null}
          </View>
          <View style={[styles.rolePill, { backgroundColor: e.available ? '#EEF8F2' : '#FDEDEC' }]}>
            <Text style={[styles.rolePillText, { color: e.available ? '#1E8449' : '#E74C3C' }]}>
              {e.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      )}
    />
  );

  const renderBookings = () => (
    <FlatList
      data={bookings}
      keyExtractor={b => b._id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      ListEmptyComponent={<EmptyState icon="📋" text="No bookings found" />}
      renderItem={({ item: b }) => {
        const eq = b.equipmentId as Equipment;
        const farmer = b.farmerId as User | undefined;
        return (
          <View style={styles.card}>
            <View style={[styles.cardAvatar, { backgroundColor: STATUS_BG[b.status] ?? '#F0F4F0' }]}>
              <Text style={styles.cardAvatarEmoji}>{CATEGORY_ICONS[(eq as Equipment)?.category ?? ''] ?? '📋'}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{eq?.equipmentName ?? 'Equipment'}</Text>
              <Text style={styles.cardSub}>👨‍🌾 {farmer?.name ?? '—'}</Text>
              <Text style={styles.cardSub}>
                {formatDate(b.startDate)} → {formatDate(b.endDate)} · {formatCurrency(b.totalAmount)}
              </Text>
            </View>
            <View style={[styles.rolePill, { backgroundColor: STATUS_BG[b.status] ?? '#F0F4F0' }]}>
              <Text style={[styles.rolePillText, { color: STATUS_COLORS[b.status] ?? colors.textSecondary }]}>
                {b.status}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSub}>Full platform overview</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
          </View>
        ) : null}

        {/* Loading overlay on first load */}
        {loading && users.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Users' && renderUsers()}
            {activeTab === 'Equipment' && renderEquipment()}
            {activeTab === 'Bookings' && renderBookings()}
          </>
        )}
      </SafeAreaView>

      <BottomTabBar activeTab="Profile" />
    </View>
  );
}

function StatCard({ icon, label, value, color, bg }: { icon: string; label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },

  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  logoutText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EDE8' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  errorBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FDEDEC', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  errorText: { fontSize: 13, color: '#C0392B' },
  retryText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },

  overviewWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 100 },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },

  miniRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: radii.sm, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontSize: 16, fontWeight: '700' },
  miniInfo: { flex: 1 },
  miniName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  miniSub: { fontSize: 11, color: colors.textSecondary },

  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardAvatarText: { fontSize: 20, fontWeight: '800' },
  cardAvatarEmoji: { fontSize: 22 },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: 12, color: colors.textSecondary },

  rolePill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rolePillText: { fontSize: 11, fontWeight: '700' },

  emptyBox: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
});
