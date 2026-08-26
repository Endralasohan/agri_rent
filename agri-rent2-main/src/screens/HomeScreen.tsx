import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
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
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { fetchEquipment } from '../redux/equipmentSlice';
import type { MainStackParamList } from '../navigation/types';
import type { Equipment } from '../types';
import BottomTabBar from '../components/BottomTabBar';

const CATEGORIES = [
  { label: 'Tractor',   icon: '🚜', bg: '#E8F2EA' },
  { label: 'Seeder',    icon: '🌱', bg: '#E6F4EA' },
  { label: 'Harvester', icon: '🌾', bg: '#FDF6E3' },
  { label: 'Rotavator', icon: '⚙️',  bg: '#FEF0E6' },
  { label: 'Sprayer',   icon: '💧', bg: '#E6F0FB' },
];

const CATEGORY_PLACEHOLDER_COLORS: Record<string, string> = {
  Tractor: '#2A5B3E', Seeder: '#4A90D9', Harvester: '#C8A227',
  Rotavator: '#E07B39', Sprayer: '#5BB5D5',
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { list: equipment, status } = useAppSelector((state) => state.equipment);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchEquipment({ available: true }));
  }, [dispatch]);

  const handleCategoryPress = (label: string) => {
    const next = activeCategory === label ? null : label;
    setActiveCategory(next);
    dispatch(fetchEquipment(next ? { category: next, available: true } : { available: true }));
  };

  const handleSearch = () => {
    if (search.trim()) dispatch(fetchEquipment({ search: search.trim() }));
  };

  const popularEquipment = equipment.slice(0, 5);
  const firstName = user?.name?.split(' ')[0] ?? 'Farmer';

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
          <Text style={styles.greetingSub}>Find the best equipment for your farm{'\n'}at the best price.</Text>

          <Image source={require('../assets/login-asset.png')} style={styles.heroBanner} resizeMode="cover" />

          {/* Search */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search equipment, category"
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.filterBtn}>
              <Text style={styles.filterIcon}>⚡</Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EquipmentList')}>
              <Text style={styles.viewAll}>View All {'>'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.categoryCard, { backgroundColor: cat.bg }, activeCategory === cat.label && styles.categoryCardActive]}
                onPress={() => handleCategoryPress(cat.label)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, activeCategory === cat.label && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Popular Equipment */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Equipment</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EquipmentList')}>
              <Text style={styles.viewAll}>View All {'>'}</Text>
            </TouchableOpacity>
          </View>

          {status === 'loading' && equipment.length === 0 ? (
            <View style={styles.loadingBox}><Text style={styles.loadingText}>Loading equipment...</Text></View>
          ) : popularEquipment.length === 0 ? (
            <View style={styles.loadingBox}><Text style={styles.loadingText}>No equipment available.</Text></View>
          ) : (
            popularEquipment.map((item) => (
              <EquipmentCard
                key={item._id}
                item={item}
                onPress={() => navigation.navigate('EquipmentDetails', { equipmentId: item._id })}
              />
            ))
          )}

          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>

      <BottomTabBar activeTab="Home" />
    </View>
  );
}

function EquipmentCard({ item, onPress }: { item: Equipment; onPress: () => void }) {
  const [liked, setLiked] = useState(false);
  const placeholderColor = CATEGORY_PLACEHOLDER_COLORS[item.category] ?? colors.primary;
  const catIcon = CATEGORIES.find((c) => c.label === item.category)?.icon ?? '🚜';

  return (
    <TouchableOpacity style={styles.equipCard} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.equipThumb, { backgroundColor: placeholderColor }]}>
        <Text style={styles.equipThumbIcon}>{catIcon}</Text>
        {item.available && (
          <View style={styles.availableBadge}>
            <Text style={styles.availableBadgeText}>Available</Text>
          </View>
        )}
      </View>
      <View style={styles.equipInfo}>
        <View style={styles.equipInfoTop}>
          <Text style={styles.equipName} numberOfLines={1}>{item.equipmentName}</Text>
          <TouchableOpacity onPress={() => setLiked(!liked)}>
            <Text style={[styles.heartIcon, liked && styles.heartIconLiked]}>{liked ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.equipCategory}>{item.category}</Text>
        <Text style={styles.equipPrice}>📅 <Text style={styles.equipPriceAmount}>₹{item.pricePerDay.toLocaleString('en-IN')} / day</Text></Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.xs },
  greetingSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginTop: 4, marginBottom: spacing.md },
  heroBanner: { width: '100%', height: 160, borderRadius: radii.lg, marginBottom: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: 10, marginBottom: spacing.lg, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary },
  filterBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  viewAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  categoryRow: { gap: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.lg },
  categoryCard: { width: 72, height: 80, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', gap: 6 },
  categoryCardActive: { borderWidth: 2, borderColor: colors.primary },
  categoryIcon: { fontSize: 26 },
  categoryLabel: { fontSize: 11, fontWeight: '500', color: colors.textSecondary, textAlign: 'center' },
  categoryLabelActive: { color: colors.primary, fontWeight: '700' },
  loadingBox: { paddingVertical: spacing.xl, alignItems: 'center' },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  equipCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: radii.md, marginBottom: spacing.md, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
  equipThumb: { width: 110, height: 105, alignItems: 'center', justifyContent: 'center' },
  equipThumbIcon: { fontSize: 36 },
  availableBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#27AE60', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  availableBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  equipInfo: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 3 },
  equipInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  equipName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 4 },
  heartIcon: { fontSize: 18, color: colors.textSecondary },
  heartIconLiked: { color: '#E74C3C' },
  equipCategory: { fontSize: 12, color: colors.textSecondary },
  equipLocation: { fontSize: 12, color: colors.textSecondary },
  equipPrice: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  equipPriceAmount: { fontWeight: '700', color: colors.textPrimary },
});
