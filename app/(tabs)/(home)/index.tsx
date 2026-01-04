
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useExams } from '@/hooks/useExams';
import { useSubscription } from '@/hooks/useSubscription';
import { ExamCard } from '@/components/ExamCard';
import { IconSymbol } from '@/components/IconSymbol';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = '@onboarding_complete';

function HomeScreenContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { getActiveExams, deleteExam, archiveExam, loading, error, refresh } = useExams();
  const { isPro } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);
  const activeExams = getActiveExams();

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        router.replace('/onboarding');
      }
    };
    checkOnboarding();
  }, [router]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('[Home] Error refreshing:', error);
      Alert.alert('Error', 'Failed to refresh exams. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddExam = () => {
    // Check if user can add more exams (free tier limit: 1 exam)
    if (!isPro && activeExams.length >= 1) {
      router.push('/paywall');
      return;
    }
    router.push('/add-exam');
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExam(id);
    } catch (error) {
      console.error('[Home] Error deleting exam:', error);
      Alert.alert('Error', 'Failed to delete exam. Please try again.');
    }
  };

  const handleArchiveExam = async (id: string) => {
    try {
      await archiveExam(id);
    } catch (error) {
      console.error('[Home] Error archiving exam:', error);
      Alert.alert('Error', 'Failed to archive exam. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Loading exams...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load exams</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Exams</Text>
          {!isPro && (
            <TouchableOpacity
              style={styles.proButton}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.7}
            >
              <Text style={styles.proButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeExams.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No exams yet</Text>
            <Text style={styles.emptyText}>
              Add an exam and make the deadline real.
            </Text>
          </View>
        ) : (
          <View style={styles.examsList}>
            {activeExams.map((exam, index) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isNext={index === 0}
                onArchive={() => handleArchiveExam(exam.id)}
                onDelete={() => handleDeleteExam(exam.id)}
                index={index}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddExam}
        activeOpacity={0.8}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ProtectedRoute>
      <HomeScreenContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  proButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  proButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  examsList: {
    gap: 0,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 16px rgba(255, 69, 58, 0.4)',
    elevation: 8,
  },
});
