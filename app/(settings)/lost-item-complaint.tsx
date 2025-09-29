import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform
} from 'react-native';
import { Stack } from 'expo-router';
import { Camera, Upload, MapPin, Phone, Mail, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';

interface LostItemForm {
  itemName: string;
  description: string;
  lastSeenLocation: string;
  dateLost: string;
  timeLost: string;
  contactPhone: string;
  contactEmail: string;
  estimatedValue: string;
  itemPhoto?: string;
}

export default function LostItemComplaintScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [form, setForm] = useState<LostItemForm>({
    itemName: '',
    description: '',
    lastSeenLocation: '',
    dateLost: '',
    timeLost: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    estimatedValue: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Camera roll permission is required to upload photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setForm(prev => ({ ...prev, itemPhoto: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setForm(prev => ({ ...prev, itemPhoto: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const validateForm = (): string | null => {
    if (!form.itemName.trim()) return 'Item name is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.lastSeenLocation.trim()) return 'Location where item was last seen is required';
    if (!form.dateLost.trim()) return 'Date when item was lost is required';
    if (!form.contactPhone.trim()) return 'Contact phone number is required';
    if (!form.contactEmail.trim()) return 'Contact email is required';
    if (!form.contactEmail.includes('@')) return 'Please enter a valid email address';

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would submit to your backend
      const complaintData = {
        ...form,
        userId: user?.id,
        userName: user?.name,
        submittedAt: new Date().toISOString()
      };

      console.log('Submitting lost item complaint:', complaintData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Complaint Submitted',
        'Your lost item complaint has been submitted successfully. Our team will investigate and contact you within 24-48 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhoto = () => {
    setForm(prev => ({ ...prev, itemPhoto: undefined }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Report Lost Item' }} />

      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Report Lost Item</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Help us find your lost item by providing detailed information
        </Text>
      </View>

      <View style={[styles.form, { backgroundColor: colors.surface }]}>
        {/* Item Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Item Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Black leather wallet"
              value={form.itemName}
              onChangeText={(text) => setForm(prev => ({ ...prev, itemName: text }))}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }
              ]}
              placeholder="Detailed description of the item, including color, size, brand, distinctive features..."
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Estimated Value (XAF)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., 50000"
              value={form.estimatedValue}
              onChangeText={(text) => setForm(prev => ({ ...prev, estimatedValue: text }))}
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Location & Time */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>When & Where</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Last Seen Location *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Back seat of taxi, near central market"
              value={form.lastSeenLocation}
              onChangeText={(text) => setForm(prev => ({ ...prev, lastSeenLocation: text }))}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Date Lost *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="YYYY-MM-DD"
                value={form.dateLost}
                onChangeText={(text) => setForm(prev => ({ ...prev, dateLost: text }))}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Time Lost *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="HH:MM"
                value={form.timeLost}
                onChangeText={(text) => setForm(prev => ({ ...prev, timeLost: text }))}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Your phone number"
              value={form.contactPhone}
              onChangeText={(text) => setForm(prev => ({ ...prev, contactPhone: text }))}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="your.email@example.com"
              value={form.contactEmail}
              onChangeText={(text) => setForm(prev => ({ ...prev, contactEmail: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Photo (Optional)</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Upload a photo to help identify your lost item
          </Text>

          {form.itemPhoto ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: form.itemPhoto }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.primary }]} onPress={takePhoto}>
                <Camera size={20} color="white" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.secondary }]} onPress={pickImage}>
                <Upload size={20} color="white" />
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isSubmitting ? colors.textSecondary : colors.primary },
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { color: 'white' }]}>
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
