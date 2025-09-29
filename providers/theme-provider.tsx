import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt';

interface ThemeSettings {
  theme: Theme;
  language: Language;
}

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

const lightColors: ThemeColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#667eea',
  secondary: '#764ba2',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  success: '#4CAF50',
  warning: '#ff9800',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#8b7cf8',
  secondary: '#a78bfa',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  border: '#333333',
  error: '#f87171',
  success: '#68d391',
  warning: '#fbbf24',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'light',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get the actual theme colors based on the selected theme
  const getThemeColors = (): ThemeColors => {
    const effectiveTheme = settings.theme === 'auto' ? 'light' : settings.theme;
    return effectiveTheme === 'dark' ? darkColors : lightColors;
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('themeSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

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

  const colors = getThemeColors();

  return {
    settings: isLoading ? { theme: 'light', language: 'en' } : settings,
    colors,
    isLoading,
    updateTheme,
    updateLanguage,
    isDark: settings.theme === 'dark' || (settings.theme === 'auto' && false), // TODO: Add system theme detection
  };
});
