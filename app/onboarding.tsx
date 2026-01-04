
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { PressureMode } from '@/types/exam';
import { colors, commonStyles } from '@/styles/commonStyles';
import { PressureModeSelector } from '@/components/PressureModeSelector';

const ONBOARDING_KEY = '@onboarding_complete';
const DEFAULT_MODE_KEY = '@default_pressure_mode';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [defaultMode, setDefaultMode] = useState<PressureMode>('Calm');

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Save preferences and complete onboarding
      await AsyncStorage.setItem(DEFAULT_MODE_KEY, defaultMode);
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/auth');
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('[Onboarding] Notification permission status:', status);
      handleContinue();
    } catch (error) {
      console.error('[Onboarding] Error requesting notification permissions:', error);
      handleContinue();
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>No planner.{'\n'}Just the truth.</Text>
            <Text style={styles.subtitle}>
              Exam Countdown shows you exactly how much time is left until your exams.
              No distractions, no clutter. Just countdowns that make deadlines feel real.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Choose your{'\n'}default pressure</Text>
            <Text style={styles.subtitle}>
              How do you want to see your countdowns? You can change this later for each exam.
            </Text>
            <View style={styles.selectorContainer}>
              <PressureModeSelector
                selectedMode={defaultMode}
                onSelect={setDefaultMode}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Stay on track</Text>
            <Text style={styles.subtitle}>
              Get reminders before your exams so you never miss a deadline.
              We&apos;ll send you notifications at 7 days and 1 day before each exam.
            </Text>
            <Text style={styles.note}>
              You can customize notifications in settings later.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[1, 2, 3].map((dot) => (
            <View
              key={dot}
              style={[styles.dot, step === dot && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={step === 3 ? requestNotificationPermissions : handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {step === 3 ? 'Enable Notifications' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {step === 3 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 20,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 20,
  },
  selectorContainer: {
    marginTop: 32,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
