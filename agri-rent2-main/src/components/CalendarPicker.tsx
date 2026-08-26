import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  label: string;
  selected: string;
  onSelect: (date: string) => void;
  minDate?: string;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

export default function CalendarPicker({ label, selected, onSelect, minDate }: Props) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const initYear = selected ? parseInt(selected.split('-')[0], 10) : today.getFullYear();
  const initMonth = selected ? parseInt(selected.split('-')[1], 10) - 1 : today.getMonth();

  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleSelect = (day: number) => {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    onSelect(dateStr);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.triggerLabel}>{label}</Text>
        <View style={styles.triggerValueRow}>
          <Text style={styles.calIcon}>📅</Text>
          <Text style={[styles.triggerValue, !selected && styles.triggerPlaceholder]}>
            {selected ? formatDisplay(selected) : 'Select date'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {/* Month nav */}
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.dayHeaderRow}>
              {DAYS.map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={styles.cell} />;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const isSelected = dateStr === selected;
                const isToday = dateStr === todayStr;
                const isDisabled = minDate ? dateStr < minDate : false;

                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[
                      styles.cell,
                      isSelected && styles.cellSelected,
                      isToday && !isSelected && styles.cellToday,
                    ]}
                    onPress={() => !isDisabled && handleSelect(day)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.cellText,
                      isSelected && styles.cellTextSelected,
                      isToday && !isSelected && styles.cellTextToday,
                      isDisabled && styles.cellTextDisabled,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const CELL_SIZE = 42;

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  triggerLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  triggerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calIcon: { fontSize: 16 },
  triggerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  triggerPlaceholder: {
    color: colors.textSecondary,
    fontWeight: '400',
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE3D8',
    alignSelf: 'center',
    marginBottom: 20,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: { fontSize: 22, color: colors.textPrimary, lineHeight: 26 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
    marginVertical: 2,
  },
  cellSelected: { backgroundColor: colors.primary },
  cellToday: { backgroundColor: '#EEF8F2', borderWidth: 1.5, borderColor: colors.primary },
  cellText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  cellTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  cellTextToday: { color: colors.primary, fontWeight: '700' },
  cellTextDisabled: { color: '#C8D4C8' },

  closeBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: '#F0F4F0',
  },
  closeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
