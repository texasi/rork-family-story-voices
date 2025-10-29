import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import { STORY_TEMPLATES } from '@/constants/templates';
import { useFamily } from '@/contexts/FamilyContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Story } from '@/types';
import { trpc } from '@/lib/trpc';

export default function NewStoryScreen() {
  const router = useRouter();
  const { family, getReadyVoices, addStory } = useFamily();
  const { canCreateStory, consumeStory, needsPaywall } = useSubscription();
  const readyVoices = getReadyVoices();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [childName, setChildName] = useState(family?.children[0]?.firstName || '');
  const [petName, setPetName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(
    readyVoices.length > 0 ? readyVoices[0].id : null
  );
  const [length, setLength] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  const template = STORY_TEMPLATES.find((t) => t.id === selectedTemplate);

  const generateAudioMutation = trpc.stories.generateAudio.useMutation();

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedVoice || !childName) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!canCreateStory) {
      router.push('/paywall');
      return;
    }

    setIsGenerating(true);

    try {
      const storyText = `Once upon a time, there was a child named ${childName}${petName ? ` who had a pet named ${petName}` : ''}. This is a ${selectedTheme} story about ${template?.title.toLowerCase()}. The story is about ${length} minutes long.`;

      console.log('Generating audio for story:', storyText);
      
      const audioResult = await generateAudioMutation.mutateAsync({
        text: storyText,
        voiceId: selectedVoice,
      });

      if (!audioResult.success || !audioResult.audioUrl) {
        throw new Error(audioResult.error || 'Failed to generate audio');
      }

      console.log('Audio generated successfully:', audioResult.audioUrl);

      const newStory: Story = {
        id: `story_${Date.now()}`,
        familyId: family?.id || '',
        templateId: selectedTemplate,
        voiceId: selectedVoice,
        title: `${childName}'s ${template?.title}`,
        params: {
          childName,
          petName: petName || undefined,
          theme: selectedTheme,
          length,
        },
        audioUrl: audioResult.audioUrl,
        durationSec: audioResult.durationSec || length * 60,
        createdBy: 'user_1',
        createdAt: new Date().toISOString(),
      };

      await addStory(newStory);
      await consumeStory();
      setIsGenerating(false);

      if (needsPaywall) {
        Alert.alert(
          'Story Created!',
          'Your bedtime story is ready to play. This was your last free story!',
          [
            {
              text: 'Upgrade Now',
              onPress: () => {
                router.back();
                router.push('/paywall');
              },
            },
            {
              text: 'Play Story',
              onPress: () => {
                router.back();
                router.push(`/player/${newStory.id}`);
              },
            },
          ]
        );
        return;
      }

      Alert.alert(
        'Story Created!',
        'Your bedtime story is ready to play.',
        [
          {
            text: 'Play Now',
            onPress: () => {
              router.back();
              router.push(`/player/${newStory.id}`);
            },
          },
          {
            text: 'Later',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error generating story:', error);
      setIsGenerating(false);
      Alert.alert(
        'Error',
        'Failed to generate story. Please check your internet connection and try again.',
        [
          {
            text: 'OK',
          },
        ]
      );
    }
  };

  if (readyVoices.length === 0) {
    return (
      <View style={styles.background}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Stack.Screen
            options={{
              headerShown: true,
              title: 'New Story',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              ),
            }}
          />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Voices Available</Text>
            <Text style={styles.emptyText}>
              You need at least one ready voice to create a story. Invite family members
              from Settings.
            </Text>
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
            title: 'New Story',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a Template</Text>
            {STORY_TEMPLATES.map((tmpl) => (
              <TouchableOpacity
                key={tmpl.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === tmpl.id && styles.templateCardSelected,
                ]}
                onPress={() => {
                  setSelectedTemplate(tmpl.id);
                  if (tmpl.themes.length > 0) {
                    setSelectedTheme(tmpl.themes[0]);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.templateEmoji}>{tmpl.emoji}</Text>
                <View style={styles.templateContent}>
                  <Text style={styles.templateTitle}>{tmpl.title}</Text>
                  <Text style={styles.templateDescription}>{tmpl.description}</Text>
                  <Text style={styles.templateLength}>
                    {tmpl.lengthMin[0]}-{tmpl.lengthMin[1]} minutes
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {selectedTemplate && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personalize</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Child&apos;s Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={childName}
                    onChangeText={setChildName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Pet Name (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={petName}
                    onChangeText={setPetName}
                    placeholder="Enter pet name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {template && template.themes.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Theme</Text>
                  <View style={styles.chipContainer}>
                    {template.themes.map((theme) => (
                      <TouchableOpacity
                        key={theme}
                        style={[
                          styles.chip,
                          selectedTheme === theme && styles.chipSelected,
                        ]}
                        onPress={() => setSelectedTheme(theme)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedTheme === theme && styles.chipTextSelected,
                          ]}
                        >
                          {theme}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Length</Text>
                <View style={styles.chipContainer}>
                  {[2, 3, 4].map((len) => (
                    <TouchableOpacity
                      key={len}
                      style={[styles.chip, length === len && styles.chipSelected]}
                      onPress={() => setLength(len)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          length === len && styles.chipTextSelected,
                        ]}
                      >
                        {len} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Voice</Text>
                {readyVoices.map((voice) => (
                  <TouchableOpacity
                    key={voice.id}
                    style={[
                      styles.voiceCard,
                      selectedVoice === voice.id && styles.voiceCardSelected,
                    ]}
                    onPress={() => setSelectedVoice(voice.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.voiceInfo}>
                      <Text style={styles.voiceName}>{voice.displayName}</Text>
                      <Text style={styles.voiceRole}>{voice.roleLabel}</Text>
                    </View>
                    {selectedVoice === voice.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                testID="generate-story-button"
                style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
                onPress={handleGenerate}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                {isGenerating ? (
                  <>
                    <ActivityIndicator color={colors.text} />
                    <Text style={styles.generateButtonText}>Generating Story...</Text>
                  </>
                ) : (
                  <Text style={styles.generateButtonText}>Generate Story</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: colors.accent,
  },
  templateEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  templateLength: {
    fontSize: 12,
    color: colors.textMuted,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  chipTextSelected: {
    color: colors.background,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceCardSelected: {
    borderColor: colors.accent,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  voiceRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  generateButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.background,
  },
});
