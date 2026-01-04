
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Exam } from '@/types/exam';
import { calculateTimeLeft, formatCountdown, formatExactDateTime, isExamPassed } from '@/utils/countdown';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface ExamCardProps {
  exam: Exam;
  isNext: boolean;
  onArchive: () => void;
  onDelete: () => void;
  index: number;
}

export function ExamCard({ exam, isNext, onArchive, onDelete, index }: ExamCardProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState('');
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const examDate = new Date(exam.date_time);
      const timeLeft = calculateTimeLeft(examDate);
      const formatted = formatCountdown(timeLeft, exam.pressure_mode);
      setCountdown(formatted);
      setIsPassed(isExamPassed(examDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [exam.date_time, exam.pressure_mode]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/exam/${exam.id}`);
  };

  const handleArchive = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Archive Exam',
      'Are you sure you want to archive this exam?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: onArchive, style: 'destructive' },
      ]
    );
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Exam',
      'Are you sure you want to delete this exam? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
      ]
    );
  };

  const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 100 }],
      };
    });

    return (
      <Animated.View style={[styles.swipeActions, styleAnimation]}>
        <TouchableOpacity
          style={[styles.swipeButton, styles.archiveButton]}
          onPress={handleArchive}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="archivebox"
            android_material_icon_name="archive"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="trash"
            android_material_icon_name="delete"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={RightAction}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isNext && styles.nextCard,
            isPassed && styles.passedCard,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isNext && styles.nextTitle]} numberOfLines={1}>
                {exam.title}
              </Text>
              {exam.subject && (
                <Text style={styles.subject} numberOfLines={1}>
                  {exam.subject}
                </Text>
              )}
            </View>
            <View style={[styles.modeBadge, getModeColor(exam.pressure_mode)]}>
              <Text style={styles.modeText}>{exam.pressure_mode}</Text>
            </View>
          </View>

          <View style={styles.countdownContainer}>
            <Text style={[styles.countdown, isNext && styles.nextCountdown, isPassed && styles.passedCountdown]}>
              {countdown}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.dateText}>
                {formatExactDateTime(new Date(exam.date_time))}
              </Text>
            </View>
            {exam.location && (
              <View style={styles.locationContainer}>
                <IconSymbol
                  ios_icon_name="location"
                  android_material_icon_name="location-on"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {exam.location}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </Animated.View>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  passedCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  nextTitle: {
    fontSize: 24,
  },
  subject: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  countdownContainer: {
    marginVertical: 12,
  },
  countdown: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
  },
  nextCountdown: {
    fontSize: 40,
  },
  passedCountdown: {
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  swipeButton: {
    width: 60,
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});
