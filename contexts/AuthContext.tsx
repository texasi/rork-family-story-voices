import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

type User = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: 'PA' | 'VD';
};

const STORAGE_KEY = '@family_story_voices:user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  useEffect(() => {
    checkAppleAuthAvailability();
    loadUser();
  }, []);

  const checkAppleAuthAvailability = async () => {
    if (Platform.OS === 'ios') {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAuthAvailable(available);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const newUser: User = {
        id: credential.user,
        email: credential.email || null,
        fullName: credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : null,
        role: 'PA',
      };

      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      console.log('Sign in successful:', newUser);
      return newUser;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled sign in');
      } else {
        console.error('Sign in error:', error);
        throw error;
      }
      return null;
    }
  }, []);

  const signInDemo = useCallback(async () => {
    const demoUser: User = {
      id: 'demo_user_' + Date.now(),
      email: 'demo@familystoryvoices.app',
      fullName: 'Demo User',
      role: 'PA',
    };

    setUser(demoUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    console.log('Demo sign in successful');
    return demoUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAppleAuthAvailable,
      signInWithApple,
      signInDemo,
      signOut,
    }),
    [user, isLoading, isAppleAuthAvailable, signInWithApple, signInDemo, signOut]
  );
});
