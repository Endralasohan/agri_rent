import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radii, spacing } from '../constants/theme';
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { deleteEquipment, fetchEquipmentById, updateEquipmentStatus } from '../redux/equipmentSlice';
import UserProfileModal from '../components/UserProfileModal';
import type { User } from '../types';
import type { MainStackParamList } from '../navigation/types';

const CATEGORY_ICONS: Record<string, string> = {
  Tractor: '🚜', Seeder: '🌱', Harvester: '🌾', Rotavator: '⚙️', Sprayer: '💧',
};
const CATEGORY_COLORS: Record<string, string> = {
  Tractor: '#2A5B3E', Seeder: '#4A90D9', Harvester: '#C8A227', Rotavator: '#E07B39', Sprayer: '#5BB5D5',
};

export default function EquipmentDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'EquipmentDetails'>>();
  const dispatch = useAppDispatch();
  const { selected, list } = useAppSelector((state) => state.equipment);
  const { user } = useAppSelector((state) => state.auth);
  const [liked, setLiked] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  useEffect(() => {
    dispatch(fetchEquipmentById(route.params.equipmentId));
  }, [dispatch, route.params.equipmentId]);

  const equipment = useMemo(() => {
    if (selected?._id === route.params.equipmentId) return selected;
    return list.find((item) => item._id === route.params.equipmentId) ?? null;
  }, [list, route.params.equipmentId, selected]);

  if (!equipment) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isFarmer = user?.role === 'farmer';
  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';
  const catIcon = CATEGORY_ICONS[equipment.category] ?? '🚜';
  const thumbColor = CATEGORY_COLORS[equipment.category] ?? colors.primary;

  const owner = equipment.ownerId && typeof equipment.ownerId === 'object' ? (equipment.ownerId as User) : null;
  const cleanPhone = (owner?.phone || '').replace(/[^0-9]/g, '');

  const handleDelete = () => {
    Alert.alert('Delete Equipment', 'Are you sure you want to delete this equipment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteEquipment(equipment._id)).unwrap();
            navigation.goBack();
          } catch (err) {
            Alert.alert('Delete failed', (err as string) || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero */}
      <View style={[styles.heroContainer, { backgroundColor: thumbColor }]}>
        <Text style={styles.heroIcon}>{catIcon}</Text>
        <View style={styles.heroOverlay} />

        {/* Header buttons */}
        <SafeAreaView style={styles.heroHeader} edges={['top']}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Text style={styles.iconCircleText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => setLiked(!liked)}>
            <Text style={[styles.iconCircleText, liked && styles.heartActive]}>
              {liked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Available badge on image */}
        <View style={[styles.heroBadge, !equipment.available && styles.heroBadgeUnavail]}>
          <Text style={styles.heroBadgeText}>{equipment.available ? 'Available' : 'Unavailable'}</Text>
        </View>
      </View>

      {/* White content card */}
      <ScrollView style={styles.contentCard} contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.equipName}>{equipment.equipmentName}</Text>
          <Text style={styles.priceTag}>₹{equipment.pricePerDay.toLocaleString('en-IN')}<Text style={styles.perDay}>/day</Text></Text>
        </View>
        <Text style={styles.catChip}>{catIcon}  {equipment.category}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this equipment</Text>
          <Text style={styles.description}>{equipment.description}</Text>
        </View>

        {/* Owner Details Card */}
        {owner && (
          <View style={styles.ownerCard}>
            <View style={styles.ownerCardHeader}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerAvatarText}>
                  {owner.name ? owner.name.charAt(0).toUpperCase() : 'O'}
                </Text>
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerLabel}>Equipment Owner</Text>
                <Text style={styles.ownerName}>{owner.name}</Text>
                {!!owner.phone && (
                  <Text style={styles.ownerPhone}>📞 {owner.phone}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.ownerProfileBtn}
                onPress={() => setShowOwnerModal(true)}
              >
                <Text style={styles.ownerProfileBtnText}>View Details ↗</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Contact Actions */}
            {!!cleanPhone && (
              <View style={styles.ownerQuickActions}>
                <TouchableOpacity
                  style={[styles.ownerActionBtn, styles.ownerWhatsAppBtn]}
                  onPress={() => {
                    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                    const msg = encodeURIComponent(`Hello ${owner.name}, I am interested in renting your ${equipment.equipmentName} on AgriRent.`);
                    import('react-native').then(({ Linking }) => {
                      Linking.openURL(`https://wa.me/${phoneWithCountry}?text=${msg}`);
                    });
                  }}
                >
                  <Text style={styles.ownerWhatsAppBtnText}>💬 Chat on WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ownerActionBtn, styles.ownerCallBtn]}
                  onPress={() => {
                    import('react-native').then(({ Linking }) => {
                      Linking.openURL(`tel:${cleanPhone}`);
                    });
                  }}
                >
                  <Text style={styles.ownerCallBtnText}>📞 Call Owner</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Rental rate</Text>
            <Text style={styles.priceValue}>₹{equipment.pricePerDay.toLocaleString('en-IN')} / day</Text>
          </View>
        </View>

        {/* Owner actions */}
        {isOwnerOrAdmin && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('AddEquipment', { equipmentId: equipment._id })}
            >
              <Text style={styles.secondaryBtnText}>✏️  Edit Equipment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => dispatch(updateEquipmentStatus({ id: equipment._id, available: !equipment.available }))}
            >
              <Text style={styles.secondaryBtnText}>
                {equipment.available ? '🔴  Mark Unavailable' : '🟢  Mark Available'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, styles.dangerBtn]} onPress={handleDelete}>
              <Text style={[styles.secondaryBtnText, styles.dangerBtnText]}>🗑️  Delete Equipment</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: isFarmer ? 100 : 24 }} />
      </ScrollView>

      {/* Book button for farmers */}
      {isFarmer && (
        <View style={styles.bookFooter}>
          <View style={styles.bookFooterInner}>
            <View>
              <Text style={styles.footerPriceLabel}>Total from</Text>
              <Text style={styles.footerPrice}>₹{equipment.pricePerDay.toLocaleString('en-IN')}/day</Text>
            </View>
            <TouchableOpacity
              style={[styles.bookBtn, !equipment.available && styles.bookBtnDisabled]}
              disabled={!equipment.available}
              onPress={() => navigation.navigate('Booking', { equipmentId: equipment._id })}
            >
              <Text style={styles.bookBtnText}>
                {equipment.available ? 'Book Now →' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Owner Profile Modal */}
      {owner && (
        <UserProfileModal
          user={{ ...owner, role: 'owner' }}
          visible={showOwnerModal}
          onClose={() => setShowOwnerModal(false)}
          title="Equipment Owner Profile"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F3' },
  loadingText: { color: colors.textSecondary, fontSize: 14 },

  heroContainer: { height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  heroIcon: { fontSize: 80 },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.18)' },
  heroHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  iconCircleText: { fontSize: 18, color: colors.textPrimary, fontWeight: '600' },
  heartActive: { color: '#E74C3C' },
  heroBadge: { position: 'absolute', bottom: 16, left: 16, backgroundColor: '#27AE60', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  heroBadgeUnavail: { backgroundColor: '#95a5a6' },
  heroBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  contentCard: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  contentPad: { padding: spacing.lg },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  equipName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  priceTag: { fontSize: 20, fontWeight: '800', color: colors.primary },
  perDay: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  catChip: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },

  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  priceCard: { backgroundColor: '#F6F8F3', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 13, color: colors.textSecondary },
  priceValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },

  ownerCard: {
    backgroundColor: '#F8FAF6',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E8ECE4',
    marginBottom: spacing.lg,
  },
  ownerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2471A3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  ownerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ownerPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  ownerProfileBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4DCF7',
    borderRadius: radii.full,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  ownerProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2471A3',
  },
  ownerQuickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8ECE4',
  },
  ownerActionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerWhatsAppBtn: {
    backgroundColor: '#E8F8EE',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  ownerWhatsAppBtnText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '700',
  },
  ownerCallBtn: {
    backgroundColor: colors.primary,
  },
  ownerCallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  ownerActions: { gap: spacing.sm, marginBottom: spacing.md },
  secondaryBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.sm, paddingVertical: 13, paddingHorizontal: spacing.md, alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  dangerBtn: { borderColor: '#E74C3C' },
  dangerBtnText: { color: '#E74C3C' },

  bookFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  bookFooterInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerPriceLabel: { fontSize: 11, color: colors.textSecondary },
  footerPrice: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  bookBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: 28 },
  bookBtnDisabled: { backgroundColor: '#ccc' },
  bookBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
