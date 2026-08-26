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
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radii, spacing } from '../constants/theme';
import { EQUIPMENT_CATEGORIES } from '../constants/categories';
import useAppDispatch from '../hooks/useAppDispatch';
import useAppSelector from '../hooks/useAppSelector';
import { createEquipment, clearEquipmentError, fetchEquipmentById, updateEquipment } from '../redux/equipmentSlice';
import type { MainStackParamList } from '../navigation/types';

const CATEGORY_ICONS: Record<string, string> = {
  Tractor: '🚜', Seeder: '🌱', Harvester: '🌾', Rotavator: '⚙️', Sprayer: '💧',
};

function FieldRow({
  icon, label, children,
}: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldIcon}>{icon}</Text>
        {children}
      </View>
    </View>
  );
}

export default function AddEquipmentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'AddEquipment'>>();
  const dispatch = useAppDispatch();
  const { selected, error } = useAppSelector((state) => state.equipment);

  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [saving, setSaving] = useState(false);

  const equipmentId = route.params?.equipmentId;
  const isEditing = Boolean(equipmentId);

  useEffect(() => {
    if (equipmentId) dispatch(fetchEquipmentById(equipmentId));
  }, [dispatch, equipmentId]);

  useEffect(() => {
    if (selected && equipmentId && selected._id === equipmentId) {
      setEquipmentName(selected.equipmentName);
      setCategory(selected.category);
      setDescription(selected.description);
      setPricePerDay(String(selected.pricePerDay));
    }
  }, [equipmentId, selected]);

  useEffect(() => {
    dispatch(clearEquipmentError());
  }, [dispatch]);

  const handleSave = async () => {
    if (!equipmentName || !category || !description || !pricePerDay) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    const payload = { equipmentName, category, description, pricePerDay: Number(pricePerDay) };
    setSaving(true);
    try {
      if (equipmentId) {
        await dispatch(updateEquipment({ id: equipmentId, payload })).unwrap();
      } else {
        await dispatch(createEquipment(payload)).unwrap();
      }
      dispatch(clearEquipmentError());
      navigation.goBack();
    } catch (err) {
      Alert.alert('Save failed', (err as string) || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8F3" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Equipment' : 'Add Equipment'}</Text>
          <View style={{ width: 36 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Basic info */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.card}>
              <FieldRow icon="🚜" label="Equipment Name *">
                <TextInput
                  style={styles.input}
                  value={equipmentName}
                  onChangeText={setEquipmentName}
                  placeholder="e.g. John Deere 5050 D"
                  placeholderTextColor={colors.textSecondary}
                />
              </FieldRow>

              <Text style={styles.fieldLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.catChipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={styles.catChipIcon}>{CATEGORY_ICONS[cat] ?? '🔧'}</Text>
                    <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FieldRow icon="📝" label="Description *">
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the equipment, its condition and features..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </FieldRow>
            </View>

            {/* Pricing */}
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.card}>
              <FieldRow icon="₹" label="Price Per Day *">
                <TextInput
                  style={styles.input}
                  value={pricePerDay}
                  onChangeText={setPricePerDay}
                  placeholder="Enter daily rental price"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </FieldRow>
              {pricePerDay ? (
                <View style={styles.pricePreview}>
                  <Text style={styles.pricePreviewLabel}>Rental rate</Text>
                  <Text style={styles.pricePreviewValue}>₹{Number(pricePerDay).toLocaleString('en-IN')} / day</Text>
                </View>
              ) : null}
            </View>

            {/* Save */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Saving...' : isEditing ? 'Update Equipment →' : 'Add Equipment →'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  safeArea: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 },
  backArrow: { fontSize: 18, color: colors.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.textPrimary },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 24 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#FFFFFF', borderRadius: radii.md, padding: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },

  fieldBlock: { marginBottom: 4 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 11, marginBottom: spacing.sm, gap: spacing.sm, backgroundColor: '#FDFDFD' },
  fieldIcon: { fontSize: 15, color: colors.textSecondary, width: 22 },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary },
  multiline: { height: 80, paddingTop: 0 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#FDFDFD' },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipIcon: { fontSize: 14 },
  catChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catChipTextActive: { color: '#FFFFFF' },

  pricePreview: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#EEF8F2', borderRadius: radii.sm, padding: spacing.sm, marginBottom: spacing.sm },
  pricePreviewLabel: { fontSize: 13, color: colors.textSecondary },
  pricePreviewValue: { fontSize: 13, fontWeight: '700', color: colors.primary },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 16, alignItems: 'center', marginTop: spacing.lg },
  saveBtnDisabled: { opacity: 0.6 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
