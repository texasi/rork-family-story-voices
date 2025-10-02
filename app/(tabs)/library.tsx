import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';
import StoryCard from '@/components/StoryCard';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stories, getVoiceById } = useFamily();

  return (
    <View style={styles.background}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
          <Text style={styles.title}>Story Library</Text>
          <Text style={styles.subtitle}>
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} saved
          </Text>

          <View style={styles.storiesContainer}>
            {stories.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No stories yet</Text>
                <Text style={styles.emptySubtext}>
                  Create your first bedtime story from the Home tab
                </Text>
              </View>
            ) : (
              stories.map((story) => {
                const voice = getVoiceById(story.voiceId);
                return (
                  <StoryCard
                    key={story.id}
                    story={story}
                    voiceName={voice?.displayName}
                    onPress={() => router.push(`/player/${story.id}`)}
                  />
                );
              })
            )}
          </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  storiesContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
