import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radii, spacing } from '../constants/theme';
import { EQUIPMENT_CATEGORIES } from '../constants/categories';
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { fetchEquipment } from '../redux/equipmentSlice';
import BottomTabBar from '../components/BottomTabBar';
import type { Equipment } from '../types';
import type { MainStackParamList } from '../navigation/types';

const CATEGORY_ICONS: Record<string, string> = {
  Tractor: '🚜',
  Seeder: '🌱',
  Harvester: '🌾',
  Rotavator: '⚙️',
  Sprayer: '💧',
};

const CATEGORY_PLACEHOLDER_COLORS: Record<string, string> = {
  Tractor: '#2A5B3E',
  Seeder: '#4A90D9',
  Harvester: '#C8A227',
  Rotavator: '#E07B39',
  Sprayer: '#5BB5D5',
};

export default function EquipmentListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((state) => state.equipment);
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    dispatch(fetchEquipment(undefined));
  }, [dispatch]);

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchSearch =
        search.length === 0 ||
        item.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === 'All' ||
        item.category.toLowerCase() === activeCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [list, search, activeCategory]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8F3" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Browse Equipment</Text>
          {user?.role === 'owner' ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddEquipment')}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 52 }} />
          )}
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
                placeholder="Search equipment"
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {['All', ...EQUIPMENT_CATEGORIES].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              {cat !== 'All' && (
                <Text style={styles.chipIcon}>{CATEGORY_ICONS[cat] ?? '🔧'}</Text>
              )}
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Count bar */}
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            {status === 'loading'
              ? 'Loading...'
              : `${filtered.length} equipment found`}
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <EquipmentCard
              item={item}
              onPress={() =>
                navigation.navigate('EquipmentDetails', { equipmentId: item._id })
              }
            />
          )}
          ListEmptyComponent={
            status !== 'loading' ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🌾</Text>
                <Text style={styles.emptyTitle}>No equipment found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <BottomTabBar activeTab="Bookings" />
    </View>
  );
}

function EquipmentCard({ item, onPress }: { item: Equipment; onPress: () => void }) {
  const [liked, setLiked] = useState(false);
  const placeholderColor = CATEGORY_PLACEHOLDER_COLORS[item.category] ?? colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={[styles.cardThumb, { backgroundColor: placeholderColor }]}>
        <Text style={styles.cardThumbIcon}>
          {CATEGORY_ICONS[item.category] ?? '🚜'}
        </Text>
        {item.available && (
          <View style={styles.availBadge}>
            <Text style={styles.availBadgeText}>Available</Text>
          </View>
        )}
        {!item.available && (
          <View style={[styles.availBadge, styles.unavailBadge]}>
            <Text style={styles.availBadgeText}>Unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.equipmentName}</Text>
          <TouchableOpacity onPress={() => setLiked(!liked)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[styles.heartIcon, liked && styles.heartLiked]}>
              {liked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardPrice}>
          📅 <Text style={styles.cardPriceVal}>₹{item.pricePerDay.toLocaleString('en-IN')} / day</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#F6F8F3',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: { fontSize: 18, color: colors.textPrimary },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },

  searchWrapper: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { fontSize: 15, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary },
  clearIcon: { fontSize: 13, color: colors.textSecondary, paddingLeft: 8 },

  categoryRow: {
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#DDE3D8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary, shadowOpacity: 0.15, elevation: 3 },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7C6B' },
  chipTextActive: { color: '#FFFFFF' },

  countBar: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  countText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardThumb: {
    width: 110,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardThumbIcon: { fontSize: 36 },
  availBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#27AE60',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unavailBadge: { backgroundColor: '#95a5a6' },
  availBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 3 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 4 },
  heartIcon: { fontSize: 18, color: colors.textSecondary },
  heartLiked: { color: '#E74C3C' },
  cardCategory: { fontSize: 12, color: colors.textSecondary },
  cardMeta: { fontSize: 12, color: colors.textSecondary },
  cardPrice: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cardPriceVal: { fontWeight: '700', color: colors.textPrimary },

  emptyBox: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary },
});
