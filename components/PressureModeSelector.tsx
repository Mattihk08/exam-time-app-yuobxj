
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PressureMode } from '@/types/exam';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface PressureModeSelectorProps {
  selectedMode: PressureMode;
  onSelect: (mode: PressureMode) => void;
  disabled?: boolean;
  showLock?: boolean;
}

const modes: { mode: PressureMode; description: string; example: string }[] = [
  {
    mode: 'Calm',
    description: 'Shows days only',
    example: '5 days left',
  },
  {
    mode: 'Realistic',
    description: 'Shows days and hours',
    example: '5 days 12 hours left',
  },
  {
    mode: 'Brutal',
    description: 'Adaptive countdown',
    example: '132 hours left',
  },
];

export function PressureModeSelector({
  selectedMode,
  onSelect,
  disabled = false,
  showLock = false,
}: PressureModeSelectorProps) {
  return (
    <View style={styles.container}>
      {modes.map((item) => {
        const isSelected = selectedMode === item.mode;
        const isLocked = showLock && item.mode !== 'Calm';

        return (
          <TouchableOpacity
            key={item.mode}
            style={[
              styles.modeCard,
              isSelected && styles.selectedCard,
              (disabled || isLocked) && styles.disabledCard,
            ]}
            onPress={() => !disabled && !isLocked && onSelect(item.mode)}
            activeOpacity={0.7}
            disabled={disabled || isLocked}
          >
            <View style={styles.modeHeader}>
              <Text style={[styles.modeTitle, isSelected && styles.selectedText]}>
                {item.mode}
              </Text>
              {isLocked && (
                <IconSymbol
                  ios_icon_name="lock"
                  android_material_icon_name="lock"
                  size={18}
                  color={colors.textSecondary}
                />
              )}
            </View>
            <Text style={styles.modeDescription}>{item.description}</Text>
            <Text style={styles.modeExample}>{item.example}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  disabledCard: {
    opacity: 0.5,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  selectedText: {
    color: colors.primary,
  },
  modeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modeExample: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
