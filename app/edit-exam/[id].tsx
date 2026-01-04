
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PressureMode } from '@/types/exam';
import { colors, commonStyles } from '@/styles/commonStyles';
import { PressureModeSelector } from '@/components/PressureModeSelector';
import { useExams } from '@/hooks/useExams';
import { useSubscription } from '@/hooks/useSubscription';

export default function EditExamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExam, updateExam } = useExams();
  const { isPro, canUseMode } = useSubscription();
  const exam = getExam(id);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [pressureMode, setPressureMode] = useState<PressureMode>('Calm');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!exam) {
      Alert.alert('Error', 'Exam not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    setTitle(exam.title);
    setSubject(exam.subject || '');
    const examDate = new Date(exam.date_time);
    setDate(examDate);
    setTime(examDate);
    setLocation(exam.location || '');
    setPressureMode(exam.pressure_mode);
  }, [exam, router]);

  const handleModeSelect = useCallback((mode: PressureMode) => {
    if (!canUseMode(mode)) {
      router.push('/paywall');
      return;
    }
    setPressureMode(mode);
  }, [canUseMode, router]);

  const saveExam = useCallback(async (examDateTime: Date) => {
    try {
      setSaving(true);
      await updateExam(id, {
        title: title.trim(),
        subject: subject.trim() || undefined,
        date_time: examDateTime.toISOString(),
        location: location.trim() || undefined,
        pressure_mode: pressureMode,
      });

      Alert.alert('Success', 'Exam updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('[EditExam] Error updating exam:', error);
      Alert.alert('Error', 'Failed to update exam. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [id, title, subject, location, pressureMode, updateExam, router]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an exam title');
      return;
    }

    // Combine date and time
    const examDateTime = new Date(date);
    examDateTime.setHours(time.getHours());
    examDateTime.setMinutes(time.getMinutes());

    // Check if date is in the past
    if (examDateTime < new Date()) {
      Alert.alert(
        'Date in the Past',
        'This exam date has already passed. Would you like to archive it instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveExam(examDateTime) },
        ]
      );
      return;
    }

    await saveExam(examDateTime);
  }, [title, date, time, saveExam]);

  if (!exam) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Math Final"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Subject (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Calculus II"
            placeholderTextColor={colors.textSecondary}
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date & Time *</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateTimeText}>
                {date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateTimeText}>
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setTime(selectedTime);
                }
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Room 301"
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Pressure Mode</Text>
          <PressureModeSelector
            selectedMode={pressureMode}
            onSelect={handleModeSelect}
            showLock={!isPro}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
