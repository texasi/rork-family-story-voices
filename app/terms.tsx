import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Terms of Service',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Family Story Voices, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Family Story Voices is a mobile application that generates personalized bedtime stories using AI technology, including AI-generated voices based on recordings provided with explicit consent.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            • You must be at least 18 years old to create an account{'\n'}
            • You are responsible for maintaining account security{'\n'}
            • You must provide accurate and current information{'\n'}
            • One account per family is recommended{'\n'}
            • You are responsible for all activities under your account
          </Text>

          <Text style={styles.sectionTitle}>4. Voice Cloning Consent</Text>
          <Text style={styles.highlight}>
            Critical Requirements for Voice Cloning:
          </Text>
          <Text style={styles.paragraph}>
            • Explicit, recorded consent is required from every voice donor{'\n'}
            • Voice donors must read and record specific consent statements{'\n'}
            • Voice clones may only be used within the consenting family{'\n'}
            • Every AI-generated story must include an audible disclosure{'\n'}
            • Consent can be revoked at any time{'\n'}
            • Misuse of voice cloning features may result in account termination
          </Text>

          <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
          <Text style={styles.paragraph}>
            You agree NOT to:{'\n'}
            • Clone voices without explicit consent{'\n'}
            • Use voice clones outside your family circle{'\n'}
            • Remove or bypass AI disclosure notices{'\n'}
            • Share or distribute generated voice content publicly{'\n'}
            • Use the service for illegal or harmful purposes{'\n'}
            • Impersonate others or misrepresent relationships{'\n'}
            • Attempt to reverse-engineer the app{'\n'}
            • Upload malicious content or viruses
          </Text>

          <Text style={styles.sectionTitle}>6. Content Ownership</Text>
          <Text style={styles.paragraph}>
            • You retain ownership of voice recordings you provide{'\n'}
            • Generated stories are for personal, non-commercial use{'\n'}
            • We retain the right to use anonymized data for improvement{'\n'}
            • AI-generated content must include proper attribution
          </Text>

          <Text style={styles.sectionTitle}>7. Subscription and Payment</Text>
          <Text style={styles.paragraph}>
            • Subscriptions auto-renew unless cancelled{'\n'}
            • Prices are subject to change with notice{'\n'}
            • Refunds are handled according to Apple App Store policies{'\n'}
            • Free trial limitations apply as stated in the app
          </Text>

          <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            THE SERVICE IS PROVIDED AS IS WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:{'\n'}
            • Uninterrupted or error-free operation{'\n'}
            • Accuracy of AI-generated content{'\n'}
            • Quality of voice cloning results{'\n'}
            • Compatibility with all devices
          </Text>

          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:{'\n'}
            • Indirect, incidental, or consequential damages{'\n'}
            • Loss of data or content{'\n'}
            • Unauthorized access to your account{'\n'}
            • Third-party actions or content
          </Text>

          <Text style={styles.sectionTitle}>10. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold harmless Family Story Voices from any claims arising from:{'\n'}
            • Your use of the service{'\n'}
            • Violation of these terms{'\n'}
            • Violation of voice donor rights{'\n'}
            • Your content or conduct
          </Text>

          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.paragraph}>
            • You may terminate your account at any time{'\n'}
            • We may suspend or terminate accounts for terms violations{'\n'}
            • Upon termination, you lose access to stored content{'\n'}
            • Certain provisions survive termination
          </Text>

          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of new terms.
          </Text>

          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
          </Text>

          <Text style={styles.sectionTitle}>14. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these terms:{'\n\n'}
            Email: legal@familystoryvoices.app{'\n'}
            Address: [Your Business Address]
          </Text>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic' as const,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  highlight: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: '600' as const,
    lineHeight: 24,
    marginBottom: 8,
  },
  spacer: {
    height: 40,
  },
});
