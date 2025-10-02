import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Check, X } from 'lucide-react-native';
import { Audio } from 'expo-av';
import colors from '@/constants/colors';

const CONSENT_SCRIPT = [
  {
    id: 1,
    text: "I consent to create and use an AI version of my voice in the Family Story Voices app.",
  },
  {
    id: 2,
    text: "I understand my voice will be used only for bedtime stories for this family.",
  },
  {
    id: 3,
    text: "I understand every story will include an audible notice that it's AI-generated, and I may revoke my consent at any time.",
  },
];

export default function ConsentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const donorName = (params.name as string) || 'Family Member';

  const [currentStep, setCurrentStep] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Set<number>>(new Set());
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed to record consent');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        await requestPermissions();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      const uri = recording.getURI();
      console.log('Recording stopped, saved to:', uri);

      setRecordedSteps(new Set([...recordedSteps, currentStep]));
      setRecording(null);

      Alert.alert(
        'Recording Complete',
        'Would you like to continue to the next step?',
        [
          {
            text: 'Re-record',
            onPress: () => {},
          },
          {
            text: 'Next',
            onPress: () => {
              if (currentStep < CONSENT_SCRIPT.length - 1) {
                setCurrentStep(currentStep + 1);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleSubmit = () => {
    if (recordedSteps.size < CONSENT_SCRIPT.length) {
      Alert.alert('Incomplete', 'Please record all consent statements');
      return;
    }

    Alert.alert(
      'Consent Submitted',
      'Thank you! Your voice will be processed and ready soon.',
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const isStepRecorded = recordedSteps.has(currentStep);
  const allRecorded = recordedSteps.size === CONSENT_SCRIPT.length;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Voice Consent',
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
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome, {donorName}!</Text>
            <Text style={styles.subtitle}>
              Please read and record each consent statement
            </Text>
          </View>

          <View style={styles.progressContainer}>
            {CONSENT_SCRIPT.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  recordedSteps.has(index) && styles.progressDotComplete,
                ]}
              />
            ))}
          </View>

          <View style={styles.scriptCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>
                Step {currentStep + 1} of {CONSENT_SCRIPT.length}
              </Text>
              {isStepRecorded && (
                <View style={styles.recordedBadge}>
                  <Check size={16} color={colors.background} />
                  <Text style={styles.recordedText}>Recorded</Text>
                </View>
              )}
            </View>
            <Text style={styles.scriptText}>
              {CONSENT_SCRIPT[currentStep].text}
            </Text>
          </View>

          <View style={styles.recordingSection}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.8}
            >
              <Mic size={32} color={isRecording ? colors.error : colors.text} />
            </TouchableOpacity>
            <Text style={styles.recordHint}>
              {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
            </Text>
          </View>

          <View style={styles.navigation}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            {currentStep < CONSENT_SCRIPT.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonPrimary]}
                onPress={() => setCurrentStep(currentStep + 1)}
              >
                <Text style={styles.navButtonTextPrimary}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !allRecorded && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!allRecorded}
              >
                <Text style={styles.submitButtonText}>Submit Consent</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your Rights</Text>
            <Text style={styles.infoText}>
              • Your voice is used only for this family{'\n'}
              • Every story includes an AI disclosure{'\n'}
              • You can pause or delete your voice anytime{'\n'}
              • Your recordings are stored securely
            </Text>
          </View>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
    width: 32,
  },
  progressDotComplete: {
    backgroundColor: colors.success,
  },
  scriptCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.accent,
    textTransform: 'uppercase' as const,
  },
  recordedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.background,
  },
  scriptText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.surfaceLight,
  },
  recordButtonActive: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  recordHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: colors.accent,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.background,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.background,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
