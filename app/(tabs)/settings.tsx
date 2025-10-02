import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, UserPlus, Info } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import VoiceCard from '@/components/VoiceCard';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { family, voices, updateVoice } = useFamily();
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();

  const handleVoicePress = (voiceId: string) => {
    const voice = voices.find((v) => v.id === voiceId);
    if (!voice) return;

    if (voice.status === 'ready' || voice.status === 'paused') {
      Alert.alert(
        voice.displayName,
        'Manage this voice',
        [
          {
            text: voice.status === 'ready' ? 'Pause Voice' : 'Resume Voice',
            onPress: () => {
              updateVoice(voiceId, {
                status: voice.status === 'ready' ? 'paused' : 'ready',
              });
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleInviteVoice = () => {
    router.push('/invite-voice');
  };

  return (
    <View style={styles.background}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
          <Text style={styles.title}>Settings</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Family</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Family Name</Text>
              <Text style={styles.cardValue}>{family?.name}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Children</Text>
              {family?.children.map((child, index) => (
                <Text key={index} style={styles.cardValue}>
                  {child.firstName}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserPlus size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Voice Donors</Text>
            </View>
            {voices.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                onPress={() => handleVoicePress(voice.id)}
              />
            ))}
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInviteVoice}
              activeOpacity={0.7}
            >
              <UserPlus size={20} color={colors.accent} />
              <Text style={styles.inviteButtonText}>Invite a Voice</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Account</Text>
            </View>
            {user && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{user.email || 'Not provided'}</Text>
              </View>
            )}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Subscription</Text>
              <Text style={styles.cardValue}>
                {subscription.status === 'active' ? 'Premium' : 'Free Trial'}
              </Text>
              {subscription.status === 'trial' && (
                <Text style={styles.cardSubtext}>
                  {subscription.storiesRemaining} stories remaining
                </Text>
              )}
            </View>
            {subscription.status === 'trial' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/paywall')}
                activeOpacity={0.7}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.aboutText}>
                Family Story Voices creates personalized bedtime stories using AI voices
                of your loved ones, with their consent. Every story includes an audible
                disclosure that it&apos;s AI-generated.
              </Text>
            </View>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.surfaceLight,
    borderStyle: 'dashed' as const,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.background,
  },
  signOutButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.error,
  },
});
