import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@family_story_voices:onboarding_completed';

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setHasCompletedOnboarding(true);
      console.log('Onboarding completed');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setHasCompletedOnboarding(false);
      console.log('Onboarding reset');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }, []);

  return useMemo(
    () => ({
      hasCompletedOnboarding,
      isLoading,
      completeOnboarding,
      resetOnboarding,
    }),
    [hasCompletedOnboarding, isLoading, completeOnboarding, resetOnboarding]
  );
});
