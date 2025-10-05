import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Family, Voice, Story, Child } from '@/types';

const MOCK_FAMILY_ID = 'family_1';
const MOCK_USER_ID = 'user_1';

const STORAGE_KEYS = {
  FAMILY: '@family_story_voices:family',
  VOICES: '@family_story_voices:voices',
  STORIES: '@family_story_voices:stories',
};

export const [FamilyProvider, useFamily] = createContextHook(() => {
  const [family, setFamily] = useState<Family | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [familyData, voicesData, storiesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FAMILY),
        AsyncStorage.getItem(STORAGE_KEYS.VOICES),
        AsyncStorage.getItem(STORAGE_KEYS.STORIES),
      ]);

      if (familyData) {
        setFamily(JSON.parse(familyData));
      } else {
        const defaultFamily: Family = {
          id: MOCK_FAMILY_ID,
          ownerUserId: MOCK_USER_ID,
          name: 'The Johnson Family',
          children: [{ firstName: 'Emma', dob: '2018-05-15' }],
          createdAt: new Date().toISOString(),
        };
        setFamily(defaultFamily);
        await AsyncStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(defaultFamily));
      }

      if (voicesData) {
        setVoices(JSON.parse(voicesData));
      } else {
        const defaultVoices: Voice[] = [
          {
            id: 'voice_1',
            familyId: MOCK_FAMILY_ID,
            donorUserId: 'donor_1',
            displayName: 'Grandma Maria',
            roleLabel: 'Grandmother',
            status: 'ready',
            consent: {
              textHash: 'hash_1',
              audioUrl: 'https://example.com/consent.m4a',
              signedAt: new Date().toISOString(),
              signerName: 'Maria Johnson',
            },
            style: 'clone',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'voice_2',
            familyId: MOCK_FAMILY_ID,
            donorUserId: 'donor_2',
            displayName: 'Grandpa Tom',
            roleLabel: 'Grandfather',
            status: 'pending',
            consent: null,
            style: 'clone',
            createdAt: new Date().toISOString(),
          },
        ];
        setVoices(defaultVoices);
        await AsyncStorage.setItem(STORAGE_KEYS.VOICES, JSON.stringify(defaultVoices));
      }

      if (storiesData) {
        setStories(JSON.parse(storiesData));
      } else {
        const defaultStories: Story[] = [];
        setStories(defaultStories);
        await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(defaultStories));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFamily = useCallback(async (updates: Partial<Family>) => {
    if (!family) return;
    const updated = { ...family, ...updates };
    setFamily(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(updated));
  }, [family]);

  const addChild = useCallback(async (child: Child) => {
    if (!family) return;
    const updated = { ...family, children: [...family.children, child] };
    setFamily(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(updated));
  }, [family]);

  const addVoice = useCallback(async (voice: Voice) => {
    const updated = [...voices, voice];
    setVoices(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.VOICES, JSON.stringify(updated));
  }, [voices]);

  const updateVoice = useCallback(async (voiceId: string, updates: Partial<Voice>) => {
    const updated = voices.map((v) => (v.id === voiceId ? { ...v, ...updates } : v));
    setVoices(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.VOICES, JSON.stringify(updated));
  }, [voices]);

  const addStory = useCallback(async (story: Story) => {
    const updated = [story, ...stories];
    setStories(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(updated));
  }, [stories]);

  const getVoiceById = useCallback((voiceId: string) => voices.find((v) => v.id === voiceId), [voices]);

  const getReadyVoices = useCallback(() => voices.filter((v) => v.status === 'ready'), [voices]);

  const getLastStory = useCallback(() => (stories.length > 0 ? stories[0] : null), [stories]);

  return {
    family,
    voices,
    stories,
    isLoading,
    updateFamily,
    addChild,
    addVoice,
    updateVoice,
    addStory,
    getVoiceById,
    getReadyVoices,
    getLastStory,
  };
});
