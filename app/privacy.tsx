import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacy Policy',
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

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Family Story Voices ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </Text>

          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.subsectionTitle}>Account Information</Text>
          <Text style={styles.paragraph}>
            • Name and email address (if using Apple Sign In){'\n'}
            • Family member names and relationships{'\n'}
            • Children's first names and ages
          </Text>

          <Text style={styles.subsectionTitle}>Voice Data</Text>
          <Text style={styles.paragraph}>
            • Audio recordings for voice cloning (with explicit consent){'\n'}
            • Voice consent recordings{'\n'}
            • Generated audio stories
          </Text>

          <Text style={styles.subsectionTitle}>Usage Data</Text>
          <Text style={styles.paragraph}>
            • Story creation history{'\n'}
            • App usage analytics{'\n'}
            • Device information and identifiers
          </Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            • To provide and maintain our service{'\n'}
            • To generate personalized bedtime stories{'\n'}
            • To create AI voice clones (only with explicit consent){'\n'}
            • To improve our app and user experience{'\n'}
            • To communicate with you about your account{'\n'}
            • To comply with legal obligations
          </Text>

          <Text style={styles.sectionTitle}>4. Voice Data and AI</Text>
          <Text style={styles.highlight}>
            Important: Voice cloning is only performed with explicit, recorded consent from the voice donor.
          </Text>
          <Text style={styles.paragraph}>
            • Voice recordings are securely stored and encrypted{'\n'}
            • AI-generated voices are used only within your family circle{'\n'}
            • Every generated story includes an audible AI disclosure{'\n'}
            • Voice data is never shared with third parties{'\n'}
            • You can revoke consent and delete voice data at any time
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your data, including:{'\n'}
            • End-to-end encryption for voice recordings{'\n'}
            • Secure cloud storage with access controls{'\n'}
            • Regular security audits and updates{'\n'}
            • Limited employee access to personal data
          </Text>

          <Text style={styles.sectionTitle}>6. Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal data. We may share information only:{'\n'}
            • With your explicit consent{'\n'}
            • To comply with legal obligations{'\n'}
            • With service providers bound by confidentiality agreements{'\n'}
            • To protect rights, property, or safety
          </Text>

          <Text style={styles.sectionTitle}>7. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate data{'\n'}
            • Delete your data{'\n'}
            • Revoke voice consent at any time{'\n'}
            • Export your data{'\n'}
            • Object to data processing
          </Text>

          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            While our app is designed for families with children, we do not knowingly collect personal information from children under 13 without parental consent. Parents control all data related to their children in the app.
          </Text>

          <Text style={styles.sectionTitle}>9. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your data only as long as necessary to provide our services or as required by law. You can request deletion of your data at any time through the app settings.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any significant changes by email or through the app.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this privacy policy or how we handle your data, please contact us at:{'\n\n'}
            Email: privacy@familystoryvoices.app{'\n'}
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
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
    marginBottom: 12,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  spacer: {
    height: 40,
  },
});
