import { Stack, router } from 'expo-router';
import { Car, Clock, DollarSign, FileText, ShieldCheck, Smartphone, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BenefitItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <View style={styles.item}>
    <View style={styles.iconContainer}>{icon}</View>
    <View style={styles.itemTextContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
  </View>
);

export default function BecomeDriverScreen() {
  const insets = useSafeAreaInsets();

  const handleStartApplication = () => {
    router.push('/(settings)/kyc-upload');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Become a Driver' }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.header}>
          <Car size={48} color="#667eea" />
          <Text style={styles.headerTitle}>Drive with RideShare</Text>
          <Text style={styles.headerSubtitle}>
            Join our community of drivers and start earning on your own schedule.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Drive With Us?</Text>
          <BenefitItem
            icon={<DollarSign size={24} color="#4CAF50" />}
            title="Earn Extra Income"
            description="Make money by sharing your car with passengers. Get paid weekly."
          />
          <BenefitItem
            icon={<Clock size={24} color="#2196F3" />}
            title="Flexible Schedule"
            description="Drive whenever you want, day or night. You are your own boss."
          />
          <BenefitItem
            icon={<Users size={24} color="#ff9800" />}
            title="Meet New People"
            description="Connect with people from your community and help them get around."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <BenefitItem
            icon={<FileText size={24} color="#607d8b" />}
            title="Valid Driver's License"
            description="You must have a valid driver's license for your region."
          />
          <BenefitItem
            icon={<Car size={24} color="#607d8b" />}
            title="Eligible Vehicle"
            description="Your vehicle must meet our standards for safety and cleanliness."
          />
          <BenefitItem
            icon={<Smartphone size={24} color="#607d8b" />}
            title="Smartphone"
            description="An iPhone or Android smartphone is required to use the driver app."
          />
          <BenefitItem
            icon={<ShieldCheck size={24} color="#607d8b" />}
            title="Background Check"
            description="You must pass our standard KYC and background check process."
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleStartApplication}>
            <Text style={styles.ctaButtonText}>Start Your Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});