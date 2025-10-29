import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BabyIcon, Calendar } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useFamily } from '@/contexts/FamilyContext';

export default function AddChildScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addChild } = useFamily();
  const [firstName, setFirstName] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddChild = async () => {
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your child&apos;s first name');
      return;
    }

    setIsLoading(true);
    try {
      await addChild({
        firstName: firstName.trim(),
        dob: dob.trim() || undefined,
      });

      Alert.alert('Success', `${firstName} has been added to your family!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Failed to add child. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Child',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <BabyIcon size={48} color={colors.accent} />
            </View>
          </View>

          <Text style={styles.title}>Add a Child</Text>
          <Text style={styles.subtitle}>
            Add your child&apos;s name to personalize their stories
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                testID="child-first-name-input"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Calendar size={16} color={colors.textMuted} />
                <Text style={styles.label}>Date of Birth (Optional)</Text>
              </View>
              <TextInput
                testID="child-dob-input"
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.helperText}>
                Format: YYYY-MM-DD (e.g., 2018-05-15)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            testID="add-child-button"
            style={[styles.addButton, (!firstName.trim() || isLoading) && styles.addButtonDisabled]}
            onPress={handleAddChild}
            disabled={!firstName.trim() || isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>
              {isLoading ? 'Adding...' : 'Add Child'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.background,
  },
});
