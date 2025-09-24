import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Plus, Trash2, Check, Smartphone } from 'lucide-react-native';


interface PaymentMethod {
  id: string;
  type: 'mtn_momo' | 'orange_money';
  phoneNumber: string;
  isDefault: boolean;
  name: string;
}

export default function PaymentMethods() {
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mtn_momo',
      phoneNumber: '+237 6XX XXX XXX',
      isDefault: true,
      name: 'MTN Mobile Money'
    },
    {
      id: '2',
      type: 'orange_money',
      phoneNumber: '+237 6XX XXX XXX',
      isDefault: false,
      name: 'Orange Money'
    }
  ]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newMethod, setNewMethod] = useState<{
    type: 'mtn_momo' | 'orange_money';
    phoneNumber: string;
  }>({
    type: 'mtn_momo',
    phoneNumber: ''
  });

  const handleAddPaymentMethod = () => {
    if (!newMethod.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    const method: PaymentMethod = {
      id: Date.now().toString(),
      type: newMethod.type,
      phoneNumber: newMethod.phoneNumber,
      isDefault: paymentMethods.length === 0,
      name: newMethod.type === 'mtn_momo' ? 'MTN Mobile Money' : 'Orange Money'
    };

    setPaymentMethods([...paymentMethods, method]);
    setNewMethod({ type: 'mtn_momo', phoneNumber: '' });
    setShowAddForm(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(method => method.id !== id));
          }
        }
      ]
    );
  };

  const getProviderColor = (type: string) => {
    return type === 'mtn_momo' ? '#FFCC00' : '#FF6600';
  };

  const getProviderIcon = (type: string) => {
    return type === 'mtn_momo' ? '📱' : '🍊';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>Manage your mobile money accounts</Text>
      </View>

      {/* Payment Methods List */}
      <View style={styles.methodsList}>
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.methodInfo}>
                <View style={[
                  styles.providerIcon,
                  { backgroundColor: getProviderColor(method.type) + '20' }
                ]}>
                  <Text style={styles.providerEmoji}>{getProviderIcon(method.type)}</Text>
                </View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.phoneNumber}>{method.phoneNumber}</Text>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Check size={12} color="white" />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>

            <View style={styles.methodActions}>
              {!method.isDefault && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Text style={styles.actionButtonText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteMethod(method.id)}
              >
                <Trash2 size={16} color="#f44336" />
                <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {paymentMethods.length === 0 && (
          <View style={styles.emptyState}>
            <CreditCard size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>Add a mobile money account to get started</Text>
          </View>
        )}
      </View>

      {/* Add New Method */}
      {showAddForm ? (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add Payment Method</Text>
          
          <View style={styles.providerSelector}>
            <Text style={styles.formLabel}>Provider</Text>
            <View style={styles.providerOptions}>
              <TouchableOpacity
                style={[
                  styles.providerOption,
                  newMethod.type === 'mtn_momo' && styles.providerOptionActive
                ]}
                onPress={() => setNewMethod({ ...newMethod, type: 'mtn_momo' })}
              >
                <Text style={styles.providerEmoji}>📱</Text>
                <Text style={styles.providerName}>MTN MoMo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.providerOption,
                  newMethod.type === 'orange_money' && styles.providerOptionActive
                ]}
                onPress={() => setNewMethod({ ...newMethod, type: 'orange_money' })}
              >
                <Text style={styles.providerEmoji}>🍊</Text>
                <Text style={styles.providerName}>Orange Money</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.formLabel}>Phone Number</Text>
            <View style={styles.phoneInput}>
              <Smartphone size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                placeholder="+237 6XX XXX XXX"
                value={newMethod.phoneNumber}
                onChangeText={(text) => setNewMethod({ ...newMethod, phoneNumber: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.formButton, styles.addButton]}
              onPress={handleAddPaymentMethod}
            >
              <Text style={styles.addButtonText}>Add Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.addMethodButton}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Payment Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            • Mobile Money payments are processed securely through official provider APIs
          </Text>
          <Text style={styles.infoText}>
            • You&apos;ll receive SMS confirmations for all transactions
          </Text>
          <Text style={styles.infoText}>
            • Refunds are processed within 24-48 hours
          </Text>
          <Text style={styles.infoText}>
            • Your payment information is encrypted and secure
          </Text>
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
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  methodsList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerEmoji: {
    fontSize: 20,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addForm: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  providerSelector: {
    marginBottom: 20,
  },
  providerOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  providerOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  providerOptionActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  addMethodButton: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});