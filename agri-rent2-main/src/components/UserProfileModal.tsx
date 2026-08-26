import React from 'react';
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import type { User } from '../types';

interface UserProfileModalProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export default function UserProfileModal({
  user,
  visible,
  onClose,
  title,
}: UserProfileModalProps) {
  if (!user) return null;

  const isFarmer = user.role === 'farmer';
  const roleLabel = isFarmer ? 'Verified Farmer' : 'Verified Equipment Owner';
  const roleIcon = isFarmer ? '👨‍🌾' : '🏭';
  const roleColor = isFarmer ? '#1E8449' : '#2471A3';
  const roleBg = isFarmer ? '#EEF8F2' : '#EEF0FA';

  const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');

  const handleCall = () => {
    if (!cleanPhone) {
      Alert.alert('No Phone', 'Phone number is not available.');
      return;
    }
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Error', 'Could not open phone dialer.');
    });
  };

  const handleWhatsApp = () => {
    if (!cleanPhone) {
      Alert.alert('No Phone', 'Phone number is not available for WhatsApp.');
      return;
    }
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`Hello ${user.name}, contacting you regarding AgriRent equipment.`);
    Linking.openURL(`https://wa.me/${phoneWithCountry}?text=${msg}`).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp.');
    });
  };

  const handleEmail = () => {
    if (!user.email) {
      Alert.alert('No Email', 'Email address is not provided.');
      return;
    }
    Linking.openURL(`mailto:${user.email}`).catch(() => {
      Alert.alert('Error', 'Could not open email client.');
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header Banner */}
              <View style={[styles.banner, { backgroundColor: roleColor }]}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Avatar */}
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { borderColor: '#FFFFFF', backgroundColor: roleColor }]}>
                  <Text style={styles.avatarText}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeStar}>✓</Text>
                </View>
              </View>

              {/* User Identity */}
              <View style={styles.body}>
                <Text style={styles.userName}>{user.name || 'User'}</Text>
                <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
                  <Text style={[styles.roleText, { color: roleColor }]}>
                    {roleIcon}  {roleLabel}
                  </Text>
                </View>

                <Text style={styles.sectionHeading}>
                  {title || (isFarmer ? 'Farmer Contact & Profile' : 'Owner Contact & Profile')}
                </Text>

                {/* Phone Card */}
                <View style={styles.detailRow}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.detailIcon}>📞</Text>
                  </View>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{user.phone || 'Not available'}</Text>
                  </View>
                </View>

                {/* Email Card (if available) */}
                {!!user.email && !user.email.endsWith('@agrirent.in') && (
                  <TouchableOpacity style={styles.detailRow} onPress={handleEmail}>
                    <View style={[styles.iconCircle, { backgroundColor: '#EBF5FB' }]}>
                      <Text style={styles.detailIcon}>✉️</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailLabel}>Email Address</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>{user.email}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Quick Actions */}
                <View style={styles.actionRow}>
                  {!!cleanPhone && (
                    <>
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnWhatsApp]}
                        onPress={handleWhatsApp}
                      >
                        <Text style={styles.btnWhatsAppText}>💬 WhatsApp</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnCall]}
                        onPress={handleCall}
                      >
                        <Text style={styles.btnCallText}>📞 Call</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  banner: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -38,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  badgeWrap: {
    position: 'absolute',
    bottom: 0,
    right: '42%',
    backgroundColor: '#27AE60',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeStar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF6',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E8ECE4',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWhatsApp: {
    backgroundColor: '#E8F8EE',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  btnWhatsAppText: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 13,
  },
  btnCall: {
    backgroundColor: colors.primary,
  },
  btnCallText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  doneText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
});
