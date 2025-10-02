import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Clock } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Story } from '@/types';

type StoryCardProps = {
  story: Story;
  voiceName?: string;
  onPress?: () => void;
};

export default function StoryCard({ story, voiceName, onPress }: StoryCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.playButton}>
        <Play size={20} color={colors.text} fill={colors.text} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {story.title}
        </Text>
        <View style={styles.meta}>
          {voiceName && (
            <Text style={styles.metaText} numberOfLines={1}>
              {voiceName}
            </Text>
          )}
          <View style={styles.separator} />
          <View style={styles.durationContainer}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatDuration(story.durationSec)}</Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(story.createdAt)}</Text>
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
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
