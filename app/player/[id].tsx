import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, SkipBack, SkipForward, X, AlertCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { stories, getVoiceById } = useFamily();
  const story = stories.find((s) => s.id === id);
  const voice = story ? getVoiceById(story.voiceId) : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(story?.durationSec || 0);
  const [showDisclosure, setShowDisclosure] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const disclosureOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(disclosureOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowDisclosure(false));
    }, 5000);

    return () => clearTimeout(timer);
  }, [disclosureOpacity]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handlePlayPause = async () => {
    if (Platform.OS === 'web') {
      setIsPlaying(!isPlaying);
      return;
    }

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: story?.audioUrl || '' },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            setDuration(status.durationMillis ? status.durationMillis / 1000 : duration);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSkipBack = async () => {
    if (sound && Platform.OS !== 'web') {
      const newPosition = Math.max(0, position - 15);
      await sound.setPositionAsync(newPosition * 1000);
      setPosition(newPosition);
    }
  };

  const handleSkipForward = async () => {
    if (sound && Platform.OS !== 'web') {
      const newPosition = Math.min(duration, position + 15);
      await sound.setPositionAsync(newPosition * 1000);
      setPosition(newPosition);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!story) {
    return (
      <View style={styles.background}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Stack.Screen
            options={{
              headerShown: true,
              title: 'Story Player',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
            }}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Story not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />

        <View style={styles.content}>
          {showDisclosure && (
            <Animated.View
              style={[styles.disclosureBanner, { opacity: disclosureOpacity }]}
            >
              <AlertCircle size={16} color={colors.warning} />
              <Text style={styles.disclosureText}>
                AI voice of {voice?.displayName}, used with permission
              </Text>
            </Animated.View>
          )}

          <View style={styles.storyInfo}>
            <Animated.View
              style={[
                styles.coverArt,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.coverEmoji}>🌙</Text>
            </Animated.View>

            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.voiceName}>{voice?.displayName}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(position / duration) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSkipBack}
              activeOpacity={0.7}
            >
              <SkipBack size={32} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              {isPlaying ? (
                <Pause size={40} color={colors.background} fill={colors.background} />
              ) : (
                <Play size={40} color={colors.background} fill={colors.background} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSkipForward}
              activeOpacity={0.7}
            >
              <SkipForward size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  disclosureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  disclosureText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  storyInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  coverArt: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  coverEmoji: {
    fontSize: 80,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  voiceName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
