import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt';

interface ThemeSettings {
  theme: Theme;
  language: Language;
}

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'light',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('themeSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (theme: Theme) => {
    try {
      const newSettings = { ...settings, theme };
      setSettings(newSettings);
      await AsyncStorage.setItem('themeSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const updateLanguage = async (language: Language) => {
    try {
      const newSettings = { ...settings, language };
      setSettings(newSettings);
      await AsyncStorage.setItem('themeSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  return {
    settings,
    isLoading,
    updateTheme,
    updateLanguage,
    isDark: settings.theme === 'dark' || (settings.theme === 'auto' && false), // TODO: Add system theme detection
  };
});
