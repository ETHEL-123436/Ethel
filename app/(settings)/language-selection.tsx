import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/providers/theme-provider';

const languages = [
  { key: 'en' as const, title: 'English', nativeName: 'English' },
  { key: 'es' as const, title: 'Spanish', nativeName: 'Español' },
  { key: 'fr' as const, title: 'French', nativeName: 'Français' },
  { key: 'de' as const, title: 'German', nativeName: 'Deutsch' },
  { key: 'pt' as const, title: 'Portuguese', nativeName: 'Português' },
];

export default function LanguageSelectionScreen() {
  const { settings, colors, updateLanguage } = useTheme();

  const handleLanguageSelect = async (language: typeof languages[0]['key']) => {
    await updateLanguage(language);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Language' }} />

      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Choose Language</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select your preferred language</Text>
      </View>

      <View style={styles.options}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.key}
            style={[
              styles.option,
              { backgroundColor: colors.surface, borderColor: colors.border },
              settings?.language === language.key && [styles.optionSelected, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]
            ]}
            onPress={() => handleLanguageSelect(language.key)}
          >
            <View style={styles.optionContent}>
              <View>
                <Text style={[
                  styles.optionTitle,
                  { color: colors.text },
                  settings?.language === language.key && [styles.optionTitleSelected, { color: colors.primary }]
                ]}>
                  {language.title}
                </Text>
                <Text style={[
                  styles.optionNativeName,
                  { color: colors.textSecondary },
                  settings?.language === language.key && [styles.optionNativeNameSelected, { color: colors.primary }]
                ]}>
                  {language.nativeName}
                </Text>
              </View>
              {settings?.language === language.key && (
                <Check size={20} color={colors.primary} />
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
  optionNativeName: {
    fontSize: 14,
    color: '#666',
  },
  optionNativeNameSelected: {
    color: '#667eea',
  },
});
