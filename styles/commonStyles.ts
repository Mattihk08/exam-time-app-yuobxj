
import { StyleSheet } from 'react-native';

// Exam Countdown App - Dark AMOLED Theme
export const colors = {
  // Pure black AMOLED background
  background: '#000000',
  // Slightly lighter for cards
  card: '#1C1C1E',
  // Primary accent color (red for urgency/countdown)
  primary: '#FF453A',
  // Secondary accent (softer red)
  accent: '#FF6961',
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  // Borders
  border: '#2C2C2E',
  // Success/Archive
  success: '#30D158',
  // Warning
  warning: '#FFD60A',
  // Error/Delete
  error: '#FF453A',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
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
});
