
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { calculateTimeLeft, formatCountdown, formatExactDateTime, isExamPassed } from '@/utils/countdown';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useExams } from '@/hooks/useExams';
import { IconSymbol } from '@/components/IconSymbol';

export default function ExamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExam, archiveExam, deleteExam } = useExams();
  const exam = getExam(id);

  const [countdown, setCountdown] = useState('');
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    if (!exam) {
      Alert.alert('Error', 'Exam not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    const updateCountdown = () => {
      const examDate = new Date(exam.date_time);
      const timeLeft = calculateTimeLeft(examDate);
      const formatted = formatCountdown(timeLeft, exam.pressure_mode);
      setCountdown(formatted);
      setIsPassed(isExamPassed(examDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second for detail view

    return () => clearInterval(interval);
  }, [exam, router]);

  if (!exam) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Loading...</Text>
        </View>
      </View>
    );
  }

  const handleEdit = () => {
    router.push(`/edit-exam/${exam.id}`);
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Exam',
      'Are you sure you want to archive this exam?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await archiveExam(exam.id);
              Alert.alert('Success', 'Exam archived', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to archive exam');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Exam',
      'Are you sure you want to delete this exam? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteExam(exam.id);
              Alert.alert('Success', 'Exam deleted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exam');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: exam.title,
          headerRight: () => (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.countdownSection}>
            <Text style={[styles.countdown, isPassed && styles.passedCountdown]}>
              {countdown}
            </Text>
            <View style={[styles.modeBadge, getModeColor(exam.pressure_mode)]}>
              <Text style={styles.modeText}>{exam.pressure_mode} Mode</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.primary}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatExactDateTime(new Date(exam.date_time))}
                </Text>
              </View>
            </View>

            {exam.subject && (
              <View style={styles.detailRow}>
                <IconSymbol
                  ios_icon_name="book"
                  android_material_icon_name="menu-book"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Subject</Text>
                  <Text style={styles.detailValue}>{exam.subject}</Text>
                </View>
              </View>
            )}

            {exam.location && (
              <View style={styles.detailRow}>
                <IconSymbol
                  ios_icon_name="location"
                  android_material_icon_name="location-on"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{exam.location}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.archiveButton]}
            onPress={handleArchive}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="archivebox"
              android_material_icon_name="archive"
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonText}>Archive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function getModeColor(mode: string) {
  switch (mode) {
    case 'Calm':
      return { backgroundColor: '#30D15820' };
    case 'Realistic':
      return { backgroundColor: '#FFD60A20' };
    case 'Brutal':
      return { backgroundColor: '#FF453A20' };
    default:
      return { backgroundColor: colors.card };
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  countdownSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  countdown: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  passedCountdown: {
    color: colors.textSecondary,
  },
  modeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  detailsSection: {
    gap: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  archiveButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
