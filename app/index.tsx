import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Car, Users, Shield, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, t } = useTheme();
  const insets = useSafeAreaInsets();
  const [hasSeenLanding, setHasSeenLanding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenLanding');
        setHasSeenLanding(seen === 'true');
      } catch (error) {
        setHasSeenLanding(false);
      }
    };

    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && hasSeenLanding) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, hasSeenLanding]);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenLanding', 'true');
    router.push("/(auth)/role-selection");
  };

  const handleSignIn = async () => {
    await AsyncStorage.setItem('hasSeenLanding', 'true');
    router.push("/(auth)/login");
  };

  if (isLoading || hasSeenLanding === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>{t('loading')}...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <View style={styles.header}>
          <Car size={60} color="white" />
          <Text style={styles.title}>RideShare</Text>
          <Text style={styles.subtitle}>{t('yourJourney')}</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Users size={24} color="white" />
            <Text style={styles.featureText}>{t('connectDrivers')}</Text>
          </View>
          <View style={styles.feature}>
            <Shield size={24} color="white" />
            <Text style={styles.featureText}>Safe &amp; secure rides</Text>
          </View>
          <View style={styles.feature}>
            <Clock size={24} color="white" />
            <Text style={styles.featureText}>Real-time tracking</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/role-selection")}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  buttons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});