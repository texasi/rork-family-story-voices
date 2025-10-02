import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

type Subscription = {
  status: SubscriptionStatus;
  productId: string | null;
  expiresAt: string | null;
  storiesRemaining: number;
  storiesUsed: number;
  storiesLimit: number;
};

const STORAGE_KEY = '@family_story_voices:subscription';

const DEFAULT_SUBSCRIPTION: Subscription = {
  status: 'trial',
  productId: null,
  expiresAt: null,
  storiesRemaining: 3,
  storiesUsed: 0,
  storiesLimit: 3,
};

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setSubscription(JSON.parse(data));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIPTION));
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscription = async (data: Subscription) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSubscription(data);
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const purchaseSubscription = useCallback(async (productId: string) => {
    console.log('Purchasing subscription:', productId);

    if (Platform.OS === 'web') {
      console.log('In-app purchases not available on web');
      return false;
    }

    const newSubscription: Subscription = {
      status: 'active',
      productId,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      storiesRemaining: 100,
      storiesUsed: 0,
      storiesLimit: 100,
    };

    await saveSubscription(newSubscription);
    console.log('Subscription activated:', newSubscription);
    return true;
  }, []);

  const restorePurchases = useCallback(async () => {
    console.log('Restoring purchases...');
    
    if (Platform.OS === 'web') {
      console.log('In-app purchases not available on web');
      return false;
    }

    return false;
  }, []);

  const consumeStory = useCallback(async () => {
    if (subscription.storiesRemaining <= 0 && subscription.status !== 'active') {
      return false;
    }

    const updated: Subscription = {
      ...subscription,
      storiesUsed: subscription.storiesUsed + 1,
      storiesRemaining: Math.max(0, subscription.storiesRemaining - 1),
    };

    await saveSubscription(updated);
    return true;
  }, [subscription]);

  const canCreateStory = useMemo(() => {
    if (subscription.status === 'active') return true;
    return subscription.storiesRemaining > 0;
  }, [subscription]);

  const needsPaywall = useMemo(() => {
    return subscription.status === 'trial' && subscription.storiesRemaining === 0;
  }, [subscription]);

  return useMemo(
    () => ({
      subscription,
      isLoading,
      canCreateStory,
      needsPaywall,
      purchaseSubscription,
      restorePurchases,
      consumeStory,
    }),
    [subscription, isLoading, canCreateStory, needsPaywall, purchaseSubscription, restorePurchases, consumeStory]
  );
});
