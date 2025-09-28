import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/providers/theme-provider';

const themes = [
  { key: 'light' as const, title: 'Light', description: 'Bright theme for daytime use' },
  { key: 'dark' as const, title: 'Dark', description: 'Dark theme for nighttime use' },
  { key: 'auto' as const, title: 'Auto', description: 'Automatically match system theme' },
];

export default function ThemeSelectionScreen() {
  const { settings, updateTheme } = useTheme();

  const handleThemeSelect = async (theme: typeof themes[0]['key']) => {
    await updateTheme(theme);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Theme' }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#667eea" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Theme</Text>
        <Text style={styles.subtitle}>Select your preferred theme</Text>
      </View>

      <View style={styles.options}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.key}
            style={[
              styles.option,
              settings.theme === theme.key && styles.optionSelected
            ]}
            onPress={() => handleThemeSelect(theme.key)}
          >
            <View style={styles.optionContent}>
              <View>
                <Text style={[
                  styles.optionTitle,
                  settings.theme === theme.key && styles.optionTitleSelected
                ]}>
                  {theme.title}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  settings.theme === theme.key && styles.optionDescriptionSelected
                ]}>
                  {theme.description}
                </Text>
              </View>
              {settings.theme === theme.key && (
                <Check size={20} color="#667eea" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  options: {
    paddingHorizontal: 20,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  optionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#667eea',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: '#667eea',
  },
});
