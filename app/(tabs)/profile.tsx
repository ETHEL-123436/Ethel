import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { User, Star, Car, Shield, CreditCard, Settings, LogOut, Upload, UserCog, Edit } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/auth-provider";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#ffc107';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <User size={40} color="#667eea" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/(settings)/profile')}
        >
          <Edit size={16} color="#667eea" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <View style={styles.rating}>
          <Star size={16} color="#ffc107" fill="#ffc107" />
          <Text style={styles.ratingText}>{user.rating?.toFixed(1) || '0.0'} rating</Text>
          <Text style={styles.ridesCount}>• {user.totalRides || 0} rides</Text>
        </View>

        <View style={[
          styles.kycBadge,
          { backgroundColor: getKycStatusColor(user.kycStatus) }
        ]}>
          <Shield size={14} color="white" />
          <Text style={styles.kycText}>KYC {user.kycStatus || 'not verified'}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.walletBalance?.toLocaleString() || '0'}</Text>
          <Text style={styles.statLabel}>Wallet Balance (XAF)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.totalRides || 0}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
      </View>

      {user.role === 'driver' && user.vehicleInfo && (
        <View style={styles.vehicleInfo}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.vehicleCard}>
            <Car size={24} color="#667eea" />
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleText}>
                {user.vehicleInfo.color} {user.vehicleInfo.make} {user.vehicleInfo.model}
              </Text>
              <Text style={styles.vehicleSubtext}>
                {user.vehicleInfo.year} • {user.vehicleInfo.plateNumber}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(settings)/kyc-upload')}
        >
          <Upload size={20} color="#667eea" />
          <Text style={styles.menuText}>KYC Verification</Text>
          <View style={[
            styles.menuBadge,
            { backgroundColor: getKycStatusColor(user.kycStatus) }
          ]}>
            <Text style={styles.menuBadgeText}>{user.kycStatus || 'none'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/payment-methods')}
        >
          <CreditCard size={20} color="#667eea" />
          <Text style={styles.menuText}>Payment Methods</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <Settings size={20} color="#667eea" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        {user.role === 'admin' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(admin)/dashboard')}
          >
            <UserCog size={20} color="#667eea" />
            <Text style={styles.menuText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#f44336" />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#4f46e5',
    fontWeight: '500',
    fontSize: 14,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  ridesCount: {
    fontSize: 14,
    color: '#666',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  vehicleInfo: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  vehicleSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menu: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  logoutItem: {
    marginTop: 16,
  },
  logoutText: {
    color: '#f44336',
  },
});
