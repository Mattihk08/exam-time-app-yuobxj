
import { useState, useEffect } from 'react';
import { useUser } from 'expo-superwall';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_STATUS_KEY = '@pro_status';

export function useSubscription() {
  const { subscriptionStatus } = useUser();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProStatus();
  }, [subscriptionStatus]);

  const checkProStatus = async () => {
    try {
      // Check Superwall subscription status
      const isActive = subscriptionStatus?.status === 'ACTIVE';
      
      // Also check local storage (for testing/offline)
      const localPro = await AsyncStorage.getItem(PRO_STATUS_KEY);
      
      const proStatus = isActive || localPro === 'true';
      setIsPro(proStatus);
      
      // TODO: Backend Integration - Call GET /api/user/subscription endpoint here
      console.log('[useSubscription] TODO: Call backend API to check subscription status');
    } catch (error) {
      console.error('[useSubscription] Error checking pro status:', error);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  // For testing: manually set pro status
  const setProStatus = async (status: boolean) => {
    await AsyncStorage.setItem(PRO_STATUS_KEY, status.toString());
    setIsPro(status);
  };

  // Get feature limits based on subscription
  const getExamLimit = () => {
    return isPro ? Infinity : 1;
  };

  const canUseMode = (mode: string) => {
    if (mode === 'Calm') return true;
    return isPro;
  };

  return {
    isPro,
    loading,
    setProStatus, // For testing
    getExamLimit,
    canUseMode,
    subscriptionStatus,
  };
}
