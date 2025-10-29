import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,

  TouchableOpacity,
  Animated,

} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, BookOpen, Shield, Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useOnboarding } from '@/contexts/OnboardingContext';



const ONBOARDING_STEPS = [
  {
    id: 1,
    icon: Heart,
    title: 'Welcome to Family Story Voices',
    description: 'Create magical bedtime stories in the voices of loved ones, using AI with permission and transparency.',
    gradient: [colors.primary, colors.primaryDark],
  },
  {
    id: 2,
    icon: BookOpen,
    title: 'Personalized Stories',
    description: 'Generate unique bedtime stories tailored to your child\'s interests, age, and favorite themes.',
    gradient: [colors.accent, colors.primary],
  },
  {
    id: 3,
    icon: Mic,
    title: 'Authentic Voices',
    description: 'Invite family members to share their voice with consent. Every story includes an audible AI disclosure.',
    gradient: [colors.primary, colors.accent],
  },
  {
    id: 4,
    icon: Shield,
    title: 'Privacy First',
    description: 'Your family\'s data is secure and private. Voices are used only within your family circle, never shared.',
    gradient: [colors.primaryDark, colors.primary],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const currentStep = ONBOARDING_STEPS[currentIndex];
  const Icon = currentStep.icon;
  const isLastStep = currentIndex === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={currentStep.gradient as [string, string]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            {!isLastStep && (
              <TouchableOpacity
                onPress={handleSkip}
                style={styles.skipButton}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Icon size={64} color={colors.text} strokeWidth={1.5} />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.description}>{currentStep.description}</Text>
            </View>

            <View style={styles.pagination}>
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Get Started' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {currentIndex === 0 && (
              <Text style={styles.termsText}>
                By continuing, you agree to our{'\n'}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' and '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    height: 44,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
    maxWidth: 340,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: colors.text,
    width: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    gap: 16,
  },
  nextButton: {
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  termsText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  termsLink: {
    textDecorationLine: 'underline' as const,
    fontWeight: '600' as const,
  },
});
