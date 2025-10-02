import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';

export default function InviteVoiceScreen() {
  const router = useRouter();
  const { family, addVoice } = useFamily();
  const [displayName, setDisplayName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const [email, setEmail] = useState('');

  const handleSendInvite = async () => {
    if (!displayName.trim() || !roleLabel.trim()) {
      Alert.alert('Missing Information', 'Please enter a name and role');
      return;
    }

    const inviteLink = `familystoryvoices://consent?token=${Date.now()}&name=${encodeURIComponent(displayName)}`;

    Alert.alert(
      'Invite Sent!',
      `Send this link to ${displayName}:\n\n${inviteLink}\n\nThey will be able to record their consent and voice sample.`,
      [
        {
          text: 'Copy Link',
          onPress: () => {
            console.log('Copy link:', inviteLink);
          },
        },
        {
          text: 'Done',
          onPress: async () => {
            await addVoice({
              id: `voice_${Date.now()}`,
              familyId: family?.id || '',
              donorUserId: `donor_${Date.now()}`,
              displayName: displayName.trim(),
              roleLabel: roleLabel.trim(),
              status: 'pending',
              consent: null,
              style: 'clone',
              createdAt: new Date().toISOString(),
            });
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Invite a Voice',
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
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              1. Enter the family member&apos;s name and role{'\n'}
              2. Send them a magic link{'\n'}
              3. They&apos;ll record consent and voice samples{'\n'}
              4. Once ready, you can create stories in their voice
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Donor Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name *</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g., Grandma Maria"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Role *</Text>
              <TextInput
                style={styles.input}
                value={roleLabel}
                onChangeText={setRoleLabel}
                placeholder="e.g., Grandmother"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.inputHint}>
                We&apos;ll send the invite link to this email
              </Text>
            </View>
          </View>

          <View style={styles.consentSection}>
            <Text style={styles.consentTitle}>Consent Requirements</Text>
            <Text style={styles.consentText}>
              • Voice donor must be 18+ years old{'\n'}
              • They will record a consent statement{'\n'}
              • Voice is used only for this family{'\n'}
              • Every story includes an AI disclosure{'\n'}
              • They can revoke consent anytime
            </Text>
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendInvite}
            activeOpacity={0.8}
          >
            <Send size={20} color={colors.background} />
            <Text style={styles.sendButtonText}>Send Invite</Text>
          </TouchableOpacity>
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
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
  inputHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  consentSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  consentText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.background,
  },
});
