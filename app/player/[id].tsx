import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, SkipBack, SkipForward, X, AlertCircle } from 'lucide-react-native';
import { Audio as ExpoAudio } from 'expo-av';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';

const FALLBACK_AUDIO = 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { stories, getVoiceById } = useFamily();
  const story = stories.find((s) => s.id === id);
  const voice = story ? getVoiceById(story.voiceId) : null;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(story?.durationSec || 0);
  const [showDisclosure, setShowDisclosure] = useState<boolean>(true);
  const [sound, setSound] = useState<ExpoAudio.Sound | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Web audio element lifecycle
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!story) return;
    const src = story.audioUrl && story.audioUrl.trim() ? story.audioUrl : FALLBACK_AUDIO;
    // Use web HTMLAudioElement, avoid name clash with expo-av Audio
    const el = typeof window !== 'undefined' && typeof (window as any).Audio === 'function' ? new (window as any).Audio(src) as HTMLAudioElement : null;
    if (!el) return;
    el.onloadedmetadata = () => {
      const d = isFinite(el.duration) ? el.duration : (story.durationSec ?? 0);
      setDuration(typeof d === 'number' && d > 0 ? d : story.durationSec ?? 0);
    };
    el.onerror = () => {
      Alert.alert('Playback Error', 'Could not load audio. Using fallback.');
      el.src = FALLBACK_AUDIO;
      el.load();
    };
    el.ontimeupdate = () => setPosition(el.currentTime);
    el.onended = () => setIsPlaying(false);
    htmlAudioRef.current = el;
    return () => {
      try {
        el.pause();
        el.src = '';
        htmlAudioRef.current = null;
      } catch {}
    };
  }, [story]);

  const startNativePlayback = async (uri: string) => {
    try {
      console.log('Attempting to play audio from:', uri);
      
      if (!uri || uri.trim() === '') {
        throw new Error('Audio URL is empty');
      }

      await ExpoAudio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound: newSound } = await ExpoAudio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            const d = status.durationMillis ? status.durationMillis / 1000 : duration;
            setDuration(d);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          } else if (status.error) {
            console.error('Playback status error:', status.error);
          }
        }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (err: any) {
      console.error('Error playing audio:', err);
      console.error('Audio URL:', uri);
      const errorMessage = err?.message || String(err);
      
      if (uri !== FALLBACK_AUDIO) {
        console.log('Trying fallback audio...');
        Alert.alert(
          'Audio Unavailable',
          `Unable to play story audio. Error: ${errorMessage}. Playing sample audio instead.`,
          [{ text: 'OK' }]
        );
        await startNativePlayback(FALLBACK_AUDIO);
      } else {
        Alert.alert(
          'Playback Error',
          `Unable to play audio. Please check:
• Internet connection
• Story was generated successfully
• Backend is running

Error: ${errorMessage}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handlePlayPause = async () => {
    if (!story) return;
    const uri = story.audioUrl && story.audioUrl.trim() ? story.audioUrl : FALLBACK_AUDIO;

    if (Platform.OS === 'web') {
      const el = htmlAudioRef.current;
      if (!el) return;
      try {
        if (isPlaying) {
          el.pause();
          setIsPlaying(false);
        } else {
          await el.play();
          setIsPlaying(true);
        }
      } catch (e) {
        console.log('Web audio play error', e);
        Alert.alert('Playback Error', 'Browser blocked autoplay. Tap again to play.');
      }
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
        await startNativePlayback(uri);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSkipBack = async () => {
    if (Platform.OS === 'web') {
      const el = htmlAudioRef.current;
      if (!el) return;
      el.currentTime = Math.max(0, el.currentTime - 15);
      setPosition(el.currentTime);
      return;
    }
    if (sound) {
      const newPosition = Math.max(0, position - 15);
      await sound.setPositionAsync(newPosition * 1000);
      setPosition(newPosition);
    }
  };

  const handleSkipForward = async () => {
    if (Platform.OS === 'web') {
      const el = htmlAudioRef.current;
      if (!el) return;
      el.currentTime = Math.min(duration, el.currentTime + 15);
      setPosition(el.currentTime);
      return;
    }
    if (sound) {
      const newPosition = Math.min(duration, position + 15);
      await sound.setPositionAsync(newPosition * 1000);
      setPosition(newPosition);
    }
  };

  const formatTime = (seconds: number) => {
    const safe = Number.isFinite(seconds) ? seconds : 0;
    const mins = Math.floor(safe / 60);
    const secs = Math.floor(safe % 60);
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
            <AlertCircle size={48} color={colors.textSecondary} />
            <Text style={styles.errorText}>Story not found</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
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
                  { width: `${duration > 0 ? (position / duration) * 100 : 0}%` },
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
              testID="skip-back-button"
              style={styles.controlButton}
              onPress={handleSkipBack}
              activeOpacity={0.7}
            >
              <SkipBack size={32} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              testID="play-pause-button"
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
              testID="skip-forward-button"
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
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
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
