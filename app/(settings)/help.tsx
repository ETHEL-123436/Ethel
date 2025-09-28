import { Stack } from 'expo-router';
import { ExternalLink, HelpCircle, Mail, Phone } from 'lucide-react-native';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpScreen() {
  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@camride.com');
  };

  const handleOpenFAQ = () => {
    Linking.openURL('https://camride.com/faq');
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Support' }} />

      <View style={styles.header}>
        <HelpCircle size={24} color="#667eea" />
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>We are here to help you</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>

        <TouchableOpacity style={styles.contactItem} onPress={handleCallSupport}>
          <Phone size={20} color="#667eea" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Call Support</Text>
            <Text style={styles.contactSubtitle}>Available 24/7</Text>
          </View>
          <ExternalLink size={16} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmailSupport}>
          <Mail size={20} color="#667eea" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSubtitle}>support@camride.com</Text>
          </View>
          <ExternalLink size={16} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleOpenFAQ}>
          <Text style={styles.menuText}>Frequently Asked Questions</Text>
          <ExternalLink size={16} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>User Guide</Text>
          <ExternalLink size={16} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Safety Tips</Text>
          <ExternalLink size={16} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.menuItem}>
          <Text style={styles.menuText}>App Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Terms of Service</Text>
          <ExternalLink size={16} color="#999" />
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <ExternalLink size={16} color="#999" />
        </View>
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
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
