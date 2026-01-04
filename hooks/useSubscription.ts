
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_STATUS_KEY = '@pro_status';

export function useSubscription() {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkProStatus = useCallback(async () => {
    try {
      const status = await AsyncStorage.getItem(PRO_STATUS_KEY);
      setIsPro(status === 'true');
    } catch (error) {
      console.error('Error checking pro status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkProStatus();
  }, [checkProStatus]);

  const setProStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem(PRO_STATUS_KEY, status.toString());
      setIsPro(status);
    } catch (error) {
      console.error('Error setting pro status:', error);
    }
  };

  const examsLimit = isPro ? Infinity : 1;
  
  const canUseMode = (mode: string) => {
    if (isPro) return true;
    return mode === 'Calm';
  };

  return {
    isPro,
    isLoading,
    examsLimit,
    canUseMode,
    checkProStatus,
    setProStatus,
  };
}
