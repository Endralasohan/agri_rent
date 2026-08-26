import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../constants/theme';
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { logout, updateProfile, clearError } from '../redux/authSlice';
import BottomTabBar from '../components/BottomTabBar';

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  farmer:  { label: 'Farmer',          bg: '#EEF8F2', text: '#1E8449', icon: '👨‍🌾' },
  owner:   { label: 'Equipment Owner', bg: '#EEF0FA', text: '#2471A3', icon: '🏭' },
  admin:   { label: 'Administrator',   bg: '#FEF9EE', text: '#D4A017', icon: '⚙️'  },
};

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name); setPhone(user.phone); }
  }, [user]);

  const handleUpdate = async () => {
    try {
      await dispatch(updateProfile({ name, phone, password: password || undefined })).unwrap();
      dispatch(clearError());
      setPassword('');
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch {
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const roleCfg = ROLE_CONFIG[user?.role ?? 'farmer'];
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Green header background */}
        <View style={styles.greenHeader}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editToggle} onPress={() => setEditMode(!editMode)}>
            <Text style={styles.editToggleText}>{editMode ? 'Cancel' : '✏️ Edit'}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Avatar card */}
            <View style={styles.avatarCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <Text style={styles.userName}>{user?.name ?? '—'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleCfg.bg }]}>
                <Text style={styles.roleBadgeIcon}>{roleCfg.icon}</Text>
                <Text style={[styles.roleBadgeText, { color: roleCfg.text }]}>{roleCfg.label}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statLabel}>Member since</Text>
                <Text style={styles.statValue}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : '—'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>{roleCfg.icon}</Text>
                <Text style={styles.statLabel}>Account type</Text>
                <Text style={styles.statValue}>{roleCfg.label}</Text>
              </View>
            </View>

            {/* Edit form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Personal Information</Text>

              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={[styles.fieldRow, !editMode && styles.fieldRowDisabled]}>
                <Text style={styles.fieldIcon}>👤</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={name}
                  onChangeText={setName}
                  editable={editMode}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={[styles.fieldRow, !editMode && styles.fieldRowDisabled]}>
                <Text style={styles.fieldIcon}>📞</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={editMode}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={[styles.fieldRow, styles.fieldRowDisabled]}>
                <Text style={styles.fieldIcon}>✉</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={user?.email ?? ''}
                  editable={false}
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.lockedIcon}>🔒</Text>
              </View>

              {editMode && (
                <>
                  <Text style={styles.fieldLabel}>New Password</Text>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldIcon}>🔑</Text>
                    <TextInput
                      style={[styles.fieldInput, { flex: 1 }]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Leave blank to keep current"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.fieldIcon}>{showPassword ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {editMode && (
                <TouchableOpacity
                  style={[styles.saveBtn, status === 'loading' && styles.saveBtnDisabled]}
                  onPress={handleUpdate}
                  disabled={status === 'loading'}
                >
                  <Text style={styles.saveBtnText}>
                    {status === 'loading' ? 'Saving...' : 'Save Changes →'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <BottomTabBar activeTab="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },

  greenHeader: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  editToggle: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  editToggleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  scroll: { paddingBottom: 24 },

  avatarCard: { alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: spacing.xl, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, shadowColor: colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 6 },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  roleBadgeIcon: { fontSize: 14 },
  roleBadgeText: { fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginBottom: spacing.md, paddingVertical: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statIcon: { fontSize: 20 },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },

  formCard: { backgroundColor: '#FFFFFF', marginHorizontal: spacing.lg, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  formTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: 11, marginBottom: spacing.md, backgroundColor: '#FFFFFF', gap: spacing.sm },
  fieldRowDisabled: { backgroundColor: '#F8FAF8' },
  fieldIcon: { fontSize: 15, color: colors.textSecondary },
  fieldInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  lockedIcon: { fontSize: 13 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, borderWidth: 1.5, borderColor: '#E74C3C', borderRadius: radii.md, paddingVertical: 14 },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#E74C3C', fontSize: 15, fontWeight: '700' },
});
