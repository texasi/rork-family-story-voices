import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Plus } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';
import VoiceCard from '@/components/VoiceCard';
import StoryCard from '@/components/StoryCard';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { family, voices, getLastStory, getVoiceById, isLoading } = useFamily();
  const lastStory = getLastStory();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, fadeAnim, scaleAnim]);

  if (isLoading) {
    return (
      <View style={styles.background}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.familyName}>{family?.name}</Text>
          </View>

          <TouchableOpacity
            testID="create-story-button"
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => router.push('/new-story')}
          >
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Sparkles size={24} color={colors.text} />
              <Text style={styles.createButtonText}>Create New Story</Text>
            </LinearGradient>
          </TouchableOpacity>

          {lastStory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last Story</Text>
              <StoryCard
                story={lastStory}
                voiceName={getVoiceById(lastStory.voiceId)?.displayName}
                onPress={() => router.push(`/player/${lastStory.id}`)}
              />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Family Voices</Text>
              <TouchableOpacity
                testID="add-voice-button"
                onPress={() => router.push('/(tabs)/settings')}
                activeOpacity={0.7}
              >
                <Plus size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            {voices.length === 0 ? (
              <View style={styles.emptyVoices}>
                <Text style={styles.emptyText}>No voices yet</Text>
                <Text style={styles.emptySubtext}>
                  Invite family members to add their voices
                </Text>
              </View>
            ) : (
              voices.map((voice) => (
                <VoiceCard key={voice.id} voice={voice} />
              ))
            )}
          </View>

          {family?.children && family.children.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Children</Text>
              {family.children.map((child, index) => (
                <View key={index} style={styles.childCard}>
                  <View style={styles.childAvatar}>
                    <Text style={styles.childInitial}>
                      {child.firstName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.childName}>{child.firstName}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  familyName: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: colors.text,
  },
  createButton: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  emptyVoices: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.background,
  },
  childName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
