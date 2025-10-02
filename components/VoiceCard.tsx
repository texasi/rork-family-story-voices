import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic, Clock, CheckCircle, Pause } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Voice } from '@/types';

type VoiceCardProps = {
  voice: Voice;
  onPress?: () => void;
};

export default function VoiceCard({ voice, onPress }: VoiceCardProps) {
  const getStatusIcon = () => {
    switch (voice.status) {
      case 'ready':
        return <CheckCircle size={20} color={colors.voiceReady} />;
      case 'pending':
        return <Clock size={20} color={colors.voicePending} />;
      case 'training':
        return <Clock size={20} color={colors.voicePending} />;
      case 'paused':
        return <Pause size={20} color={colors.voicePaused} />;
      default:
        return <Mic size={20} color={colors.textMuted} />;
    }
  };

  const getStatusText = () => {
    switch (voice.status) {
      case 'ready':
        return 'Ready';
      case 'pending':
        return 'Pending';
      case 'training':
        return 'Training...';
      case 'paused':
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (voice.status) {
      case 'ready':
        return colors.voiceReady;
      case 'pending':
        return colors.voicePending;
      case 'training':
        return colors.voicePending;
      case 'paused':
        return colors.voicePaused;
      default:
        return colors.textMuted;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Mic size={24} color={colors.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{voice.displayName}</Text>
        <Text style={styles.role}>{voice.roleLabel}</Text>
      </View>
      <View style={styles.statusContainer}>
        {getStatusIcon()}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
});
