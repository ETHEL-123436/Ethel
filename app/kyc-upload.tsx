import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { Stack, router } from "expo-router";
import { Upload, Camera, FileText, CheckCircle, Clock, XCircle } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/providers/auth-provider";

interface KYCDocument {
  type: 'id_card' | 'drivers_license' | 'vehicle_registration';
  title: string;
  description: string;
  required: boolean;
  uri?: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
}

export default function KYCUploadScreen() {
  const { user, updateUser } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([
    {
      type: 'id_card',
      title: 'National ID Card',
      description: 'Upload a clear photo of your national ID card',
      required: true,
      status: 'pending'
    },
    {
      type: 'drivers_license',
      title: 'Driver\'s License',
      description: 'Upload your valid driver\'s license (drivers only)',
      required: user?.role === 'driver',
      status: 'pending'
    },
    {
      type: 'vehicle_registration',
      title: 'Vehicle Registration',
      description: 'Upload vehicle registration documents (drivers only)',
      required: user?.role === 'driver',
      status: 'pending'
    }
  ]);

  // Update documents when user data is available
  React.useEffect(() => {
    if (user) {
      setDocuments(prev => prev.map(doc => ({
        ...doc,
        required: doc.type === 'id_card' ? true : user.role === 'driver'
      })));
    }
  }, [user]);

  const pickImage = async (documentType: KYCDocument['type']) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => prev.map(doc => 
          doc.type === documentType 
            ? { ...doc, uri: result.assets[0].uri, status: 'uploaded' as const }
            : doc
        ));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async (documentType: KYCDocument['type']) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => prev.map(doc => 
          doc.type === documentType 
            ? { ...doc, uri: result.assets[0].uri, status: 'uploaded' as const }
            : doc
        ));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePicker = (documentType: KYCDocument['type']) => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add the document',
      [
        { text: 'Camera', onPress: () => takePhoto(documentType) },
        { text: 'Gallery', onPress: () => pickImage(documentType) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const submitDocuments = async () => {
    const requiredDocs = documents.filter(doc => doc.required);
    const uploadedDocs = requiredDocs.filter(doc => doc.status === 'uploaded');

    if (uploadedDocs.length < requiredDocs.length) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }

    try {
      // Simulate document submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user KYC status
      await updateUser({ kycStatus: 'pending' });
      
      Alert.alert(
        'Documents Submitted!',
        'Your KYC documents have been submitted for review. You will be notified once the review is complete.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error submitting documents:', error);
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    }
  };

  const getStatusIcon = (status: KYCDocument['status']) => {
    switch (status) {
      case 'uploaded':
        return <Clock size={20} color="#ffc107" />;
      case 'approved':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'rejected':
        return <XCircle size={20} color="#f44336" />;
      default:
        return <Upload size={20} color="#999" />;
    }
  };

  const getStatusColor = (status: KYCDocument['status']) => {
    switch (status) {
      case 'uploaded':
        return '#ffc107';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      default:
        return '#999';
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "KYC Verification" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Document Verification</Text>
            <Text style={styles.subtitle}>
              Upload the required documents to verify your identity and start using RideShare
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={styles.statusInfo}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: user?.kycStatus === 'approved' ? '#4CAF50' : '#ffc107' }
              ]}>
                <Text style={styles.statusText}>
                  {user?.kycStatus?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
              <Text style={styles.statusDescription}>
                {user?.kycStatus === 'approved' 
                  ? 'Your documents have been verified'
                  : 'Upload documents to complete verification'
                }
              </Text>
            </View>
          </View>

          <View style={styles.documentsSection}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            
            {documents.filter(doc => doc.required).map((document) => (
              <View key={document.type} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{document.title}</Text>
                    <Text style={styles.documentDescription}>{document.description}</Text>
                  </View>
                  <View style={styles.documentStatus}>
                    {getStatusIcon(document.status)}
                  </View>
                </View>

                {document.uri && (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: document.uri }} style={styles.previewImage} />
                  </View>
                )}

                <View style={styles.documentActions}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => showImagePicker(document.type)}
                  >
                    <Camera size={16} color="#667eea" />
                    <Text style={styles.uploadButtonText}>
                      {document.uri ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                  </TouchableOpacity>
                  
                  {document.status !== 'pending' && (
                    <View style={[
                      styles.statusIndicator,
                      { borderColor: getStatusColor(document.status) }
                    ]}>
                      <Text style={[
                        styles.statusIndicatorText,
                        { color: getStatusColor(document.status) }
                      ]}>
                        {document.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
            <View style={styles.guidelinesList}>
              <Text style={styles.guideline}>• Ensure the document is clearly visible</Text>
              <Text style={styles.guideline}>• Take photos in good lighting</Text>
              <Text style={styles.guideline}>• Avoid glare and shadows</Text>
              <Text style={styles.guideline}>• Make sure all text is readable</Text>
              <Text style={styles.guideline}>• Use original documents only</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitDocuments}
          >
            <FileText size={20} color="white" />
            <Text style={styles.submitButtonText}>Submit Documents</Text>
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
  content: {
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  documentsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  documentInfo: {
    flex: 1,
    gap: 4,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
  },
  documentStatus: {
    marginLeft: 12,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  guidelines: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  guidelinesList: {
    gap: 6,
  },
  guideline: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});