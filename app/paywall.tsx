
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/hooks/useSubscription';

const features = [
  {
    icon: 'check-circle',
    title: 'Unlimited exams',
    description: 'Track as many exams as you need',
  },
  {
    icon: 'check-circle',
    title: 'Pressure modes',
    description: 'Realistic & Brutal countdown modes',
  },
  {
    icon: 'check-circle',
    title: 'Widgets',
    description: 'Home & lock screen widgets',
  },
  {
    icon: 'check-circle',
    title: 'Better reminders',
    description: 'Advanced notification options',
  },
  {
    icon: 'check-circle',
    title: 'Exam archive',
    description: 'Access your past exams',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { setProStatus } = useSubscription();

  const handlePurchaseSuccess = async () => {
    await setProStatus(true);
    Alert.alert(
      'Welcome to Pro! 🎉',
      'You now have access to all premium features.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleUnlockPro = async () => {
    // TODO: Backend Integration - Implement Superwall paywall integration
    // For now, show a demo alert
    Alert.alert(
      'Demo Mode',
      'In production, this would show the Superwall paywall. For now, would you like to enable Pro for testing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable Pro', onPress: handlePurchaseSuccess },
      ]
    );
  };

  const handleRestore = () => {
    // TODO: Backend Integration - Implement restore purchases
    Alert.alert('Restore Purchases', 'Checking for previous purchases...');
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade for the{'\n'}real countdown</Text>
          <Text style={styles.subtitle}>
            Unlock all features and make every deadline count
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name={feature.icon}
                size={24}
                color={colors.success}
              />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity
            style={[styles.pricingCard, styles.recommendedCard]}
            onPress={handleUnlockPro}
            activeOpacity={0.8}
          >
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>BEST VALUE</Text>
            </View>
            <Text style={styles.pricingTitle}>One-time Purchase</Text>
            <Text style={styles.pricingPrice}>€2.99</Text>
            <Text style={styles.pricingDescription}>Pay once, own forever</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pricingCard}
            onPress={handleUnlockPro}
            activeOpacity={0.8}
          >
            <Text style={styles.pricingTitle}>Monthly</Text>
            <Text style={styles.pricingPrice}>€0.99/mo</Text>
            <Text style={styles.pricingDescription}>Cancel anytime</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlockPro}
          activeOpacity={0.8}
        >
          <Text style={styles.unlockButtonText}>Unlock Pro</Text>
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
    paddingTop: 40,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  featuresContainer: {
    gap: 20,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  pricingContainer: {
    gap: 16,
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  recommendedCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  pricingDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
  unlockButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
