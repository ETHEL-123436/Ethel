import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from "expo-router";
import { Camera, CheckCircle, ChevronLeft, ChevronRight, FileText, Upload } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface PersonalInfo {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  licenseNumber: string;
}

interface VehiclePhoto {
  uri: string;
  base64: string | null;
  type: string;
  fileName: string;
}

interface VehiclePhotos {
  front?: VehiclePhoto;
  side?: VehiclePhoto;
  back?: VehiclePhoto;
  inside?: VehiclePhoto;
  plate?: VehiclePhoto;
}

interface KYCDocument {
  type: 'passport' | 'drivers_license' | 'national_id' | 'vehicle_registration';
  title: string;
  description: string;
  required: boolean;
  uri?: string;
  imageData?: {
    uri: string;
    base64: string | null;
    type: string;
    fileName: string;
  };
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
}

type FormStep = 'personal' | 'vehicle' | 'documents' | 'review';

// Create dynamic styles function
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  progressCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressTextActive: {
    color: 'white',
  },
  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 24,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepContent: {
    gap: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  documentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.text,
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
    color: colors.text,
  },
  documentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  changeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: (colors.success || '#4CAF50') + '20',
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success || '#4CAF50',
  },
  guidelines: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  guidelinesList: {
    gap: 6,
  },
  guideline: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  submitButton: {
    backgroundColor: colors.success || '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default function KYCUploadScreen() {
  const { user, updateProfile } = useAuth();
  const { colors, t } = useTheme();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [isDriver] = useState(user?.role === 'driver');
  const styles = createStyles(colors);

  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    dateOfBirth: '',
    address: '',
    city: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    make: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
    licenseNumber: ''
  });

  const [vehiclePhotos, setVehiclePhotos] = useState<VehiclePhotos>({});

  const [documents, setDocuments] = useState<KYCDocument[]>([
    {
      type: 'national_id',
      title: 'National ID Card',
      description: 'Upload a clear photo of your national ID card',
      required: true,
      status: 'pending'
    },
    {
      type: 'passport',
      title: 'Passport (Optional)',
      description: 'Upload your passport for additional verification',
      required: false,
      status: 'pending'
    },
    {
      type: 'drivers_license',
      title: 'Driver\'s License',
      description: 'Upload your valid driver\'s license (drivers only)',
      required: isDriver,
      status: 'pending'
    },
    {
      type: 'vehicle_registration',
      title: 'Vehicle Registration',
      description: 'Upload vehicle registration documents (drivers only)',
      required: isDriver,
      status: 'pending'
    }
  ]);

  const totalSteps = isDriver ? 4 : 3;

  const getStepNumber = (step: FormStep) => {
    switch (step) {
      case 'personal': return 1;
      case 'vehicle': return 2;
      case 'documents': return isDriver ? 3 : 2;
      case 'review': return isDriver ? 4 : 3;
      default: return 1;
    }
  };

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'personal': return t('personalInformation');
      case 'vehicle': return t('vehicleInformation');
      case 'documents': return isDriver ? t('documentsPhotos') : t('documentUpload');
      case 'review': return t('reviewSubmit');
      default: return t('personalInformation');
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'personal':
        return personalInfo.fullName && personalInfo.phoneNumber && personalInfo.dateOfBirth && personalInfo.address;
      case 'vehicle':
        return isDriver ? (vehicleInfo.make && vehicleInfo.model && vehicleInfo.year && vehicleInfo.plateNumber) : true;
      case 'documents':
        if (isDriver) {
          return vehiclePhotos.front && vehiclePhotos.side && vehiclePhotos.back && vehiclePhotos.inside && vehiclePhotos.plate && documents.filter(doc => doc.required).every(doc => doc.status === 'uploaded');
        }
        const requiredDocs = documents.filter(doc => doc.required);
        return requiredDocs.every(doc => doc.status === 'uploaded');
      case 'review':
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!canProceedToNext()) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before proceeding.');
      return;
    }

    switch (currentStep) {
      case 'personal':
        setCurrentStep(isDriver ? 'vehicle' : 'documents');
        break;
      case 'vehicle':
        setCurrentStep('documents');
        break;
      case 'documents':
        setCurrentStep('review');
        break;
      default:
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'vehicle':
        setCurrentStep('personal');
        break;
      case 'documents':
        setCurrentStep(isDriver ? 'vehicle' : 'personal');
        break;
      case 'review':
        setCurrentStep('documents');
        break;
      default:
        break;
    }
  };

  const pickImage = async (target: KYCDocument['type'] | keyof VehiclePhotos, isDoc: boolean) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // Include base64 data
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Store both URI and base64 data for upload
        const imageData = {
          uri: asset.uri,
          base64: asset.base64 || null,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `image_${Date.now()}.jpg`
        };

        if (isDoc) {
          setDocuments(prev => prev.map(doc =>
            doc.type === target
              ? { ...doc, uri: asset.uri, imageData, status: 'uploaded' as const }
              : doc
          ));
        } else {
          setVehiclePhotos(prev => ({ ...prev, [target]: imageData }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async (target: KYCDocument['type'] | keyof VehiclePhotos, isDoc: boolean) => {
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
        base64: true, // Include base64 data
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Store both URI and base64 data for upload
        const imageData = {
          uri: asset.uri,
          base64: asset.base64 || null,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`
        };

        if (isDoc) {
          setDocuments(prev => prev.map(doc =>
            doc.type === target
              ? { ...doc, uri: asset.uri, imageData, status: 'uploaded' as const }
              : doc
          ));
        } else {
          setVehiclePhotos(prev => ({ ...prev, [target]: imageData }));
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePicker = (target: KYCDocument['type'] | keyof VehiclePhotos, isDoc: boolean = true) => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add the document',
      [
        { text: 'Camera', onPress: () => takePhoto(target, isDoc) },
        { text: 'Gallery', onPress: () => pickImage(target, isDoc) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const submitDocuments = async () => {
    if (!user?.token) {
      Alert.alert('Error', 'You must be logged in to submit an application.');
      return;
    }

    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not configured.');
      }

      // Prepare data with base64 images
      const kycData = {
        personalInfo,
        vehicleInfo: isDriver ? vehicleInfo : undefined,
        documents: documents.map(doc => ({
          type: doc.type,
          title: doc.title,
          base64Data: doc.imageData?.base64 || null,
          fileName: doc.imageData?.fileName || null,
          status: doc.status
        })),
        vehiclePhotos: isDriver ? Object.fromEntries(
          Object.entries(vehiclePhotos).map(([key, photoData]) => [
            key,
            photoData && typeof photoData === 'object' ? {
              base64Data: photoData.base64 || null,
              fileName: photoData.fileName || null
            } : null
          ])
        ) : undefined
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(kycData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to submit KYC application');
      }

      // Update local user status
      await updateProfile({ kycStatus: 'pending' });

      Alert.alert(
        t('applicationSubmitted'),
        t('applicationSubmittedMsg'),
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    }
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('fullName')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.fullName}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, fullName: text }))}
          placeholder={`${t('enter')} ${t('fullName').toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('phoneNumber')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.phoneNumber}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phoneNumber: text }))}
          placeholder={`${t('enter')} ${t('phoneNumber').toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('dateOfBirth')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.dateOfBirth}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: text }))}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('address')} *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.address}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, address: text }))}
          placeholder={`${t('enter')} ${t('address').toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('city')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.city}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, city: text }))}
          placeholder={`${t('enter')} ${t('city').toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('emergencyContact')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.emergencyContact}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, emergencyContact: text }))}
          placeholder={`${t('enter')} ${t('emergencyContact').toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t('emergencyPhone')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={personalInfo.emergencyPhone}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, emergencyPhone: text }))}
          placeholder={`${t('enter')} ${t('emergencyPhone').toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderVehicleInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Please provide your vehicle information for verification
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Make *</Text>
        <TextInput
          style={styles.input}
          value={vehicleInfo.make}
          onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, make: text }))}
          placeholder="e.g., Toyota, Honda, Ford"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Model *</Text>
        <TextInput
          style={styles.input}
          value={vehicleInfo.model}
          onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, model: text }))}
          placeholder="e.g., Camry, Civic, Focus"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Year *</Text>
        <TextInput
          style={styles.input}
          value={vehicleInfo.year}
          onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, year: text }))}
          placeholder="e.g., 2020"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Color *</Text>
        <TextInput
          style={styles.input}
          value={vehicleInfo.color}
          onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, color: text }))}
          placeholder="e.g., White, Black, Blue"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Plate Number *</Text>
        <TextInput
          style={styles.input}
          value={vehicleInfo.plateNumber}
          onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, plateNumber: text }))}
          placeholder="e.g., ABC-123-DE"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Driver`s License Number *</Text>
        <TextInput
          style={styles.input}
          value={vehicleInfo.licenseNumber}
          onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, licenseNumber: text }))}
          placeholder="Enter your driver's license number"
        />
      </View>
    </View>
  );

  const renderDocumentsAndPhotosStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Upload clear photos of your required documents
      </Text>

      {isDriver && renderVehiclePhotosStep()}

      {documents.filter(doc => doc.required).map((document) => (
        <View key={document.type} style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{document.title}</Text>
              <Text style={styles.documentDescription}>{document.description}</Text>
            </View>
            <View style={styles.documentStatus}>
              {document.status === 'uploaded' ? (
                <CheckCircle size={20} color={colors.success || '#4CAF50'} />
              ) : (
                <Upload size={20} color={colors.textSecondary} />
              )}
            </View>
          </View>

          {document.uri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: document.uri }} style={styles.previewImage} />
            </View>
          )}

          <View style={styles.documentActions}>
            <TouchableOpacity
              style={[styles.uploadButton, document.uri ? styles.changeButton : {}]}
              onPress={() => showImagePicker(document.type)}
            >
              <Camera size={16} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                {document.uri ? t('changePhoto') : t('uploadPhoto')}
              </Text>
            </TouchableOpacity>

            {document.status === 'uploaded' && (
              <View style={styles.statusIndicator}>
                <Text style={styles.statusIndicatorText}>UPLOADED</Text>
              </View>
            )}
          </View>
        </View>
      ))}

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
    </View>
  );

  const renderVehiclePhotosStep = () => {
    const photoUploads: { key: keyof VehiclePhotos; title: string }[] = [
      { key: 'front', title: t('frontView') },
      { key: 'side', title: t('sideView') },
      { key: 'back', title: t('backView') },
      { key: 'inside', title: t('insideView') },
      { key: 'plate', title: t('plateNumber') },
    ];

    return (
      <View style={styles.stepContent}>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          {t('vehiclePhotosDesc')}
        </Text>

        {photoUploads.map(({ key, title }) => (
          <View key={key} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{title}</Text>
              </View>
              <View style={styles.documentStatus}>
                {vehiclePhotos[key] ? (
                  <CheckCircle size={20} color={colors.success || '#4CAF50'} />
                ) : (
                  <Upload size={20} color={colors.textSecondary} />
                )}
              </View>
            </View>

            {vehiclePhotos[key] && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: vehiclePhotos[key].uri }} style={styles.previewImage} />
              </View>
            )}

            <TouchableOpacity
              style={[styles.uploadButton, vehiclePhotos[key] ? styles.changeButton : {}]}
              onPress={() => showImagePicker(key, false)}
            >
              <Camera size={16} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>{vehiclePhotos[key] ? t('changePhoto') : t('uploadPhoto')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Please review your information before submitting
      </Text>

      <View style={[styles.reviewSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.reviewTitle, { color: colors.text }]}>{t('personalInformation')}</Text>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('fullName')}:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{personalInfo.fullName}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('phoneNumber')}:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{personalInfo.phoneNumber}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('dateOfBirth')}:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{personalInfo.dateOfBirth}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('address')}:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{personalInfo.address}</Text>
        </View>
      </View>

      {isDriver && (
        <View style={[styles.reviewSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.reviewTitle, { color: colors.text }]}>{t('vehicleInformation')}</Text>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('vehicleMake')} & {t('vehicleModel')}:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{vehicleInfo.make} {vehicleInfo.model}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('vehicleYear')}:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{vehicleInfo.year}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('licensePlate')}:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{vehicleInfo.plateNumber}</Text>
          </View>
        </View>
      )}

      {isDriver && (
        <View style={[styles.reviewSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.reviewTitle, { color: colors.text }]}>{t('vehiclePhotos')}</Text>
          {Object.entries(vehiclePhotos).map(([key, value]) => value && (
            <View key={key} style={styles.reviewItem}>
              <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{key.charAt(0).toUpperCase() + key.slice(1)} {t('view')}:</Text>
              <Text style={[styles.reviewValue, { color: colors.text }]}>✓ {t('uploaded')}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.reviewSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.reviewTitle, { color: colors.text }]}>{t('uploadedDocuments')}</Text>
        {documents.filter(doc => doc.status === 'uploaded').map((doc) => (
          <View key={doc.type} style={styles.reviewItem}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{doc.title}:</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>✓ {t('uploaded')}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return renderPersonalInfoStep();
      case 'vehicle':
        return renderVehicleInfoStep();
      case 'documents':
        return renderDocumentsAndPhotosStep();
      case 'review':
        return renderReviewStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('completeYourProfile') }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <View key={step} style={styles.progressStep}>
                  <View style={[
                    styles.progressCircle,
                    step <= getStepNumber(currentStep) && styles.progressCircleActive
                  ]}>
                    <Text style={[
                      styles.progressText,
                      step <= getStepNumber(currentStep) && styles.progressTextActive
                    ]}>
                      {step}
                    </Text>
                  </View>
                  {step < totalSteps && <View style={[
                    styles.progressLine,
                    step < getStepNumber(currentStep) && styles.progressLineActive
                  ]} />}
                </View>
              ))}
            </View>
            <Text style={[styles.progressTitle, { color: colors.text }]}>{getStepTitle(currentStep)}</Text>
          </View>

          {/* Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            {currentStep !== 'personal' && (
              <TouchableOpacity style={[styles.backButton, { borderColor: colors.primary }]} onPress={prevStep}>
                <ChevronLeft size={20} color={colors.primary} />
                <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('back')}</Text>
              </TouchableOpacity>
            )}

            {currentStep !== 'review' ? (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: canProceedToNext() ? colors.primary : '#ccc' }, !canProceedToNext() && styles.nextButtonDisabled]}
                onPress={nextStep}
                disabled={!canProceedToNext()}
              >
                <Text style={styles.nextButtonText}>{t('next')}</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success || '#4CAF50' }]} onPress={submitDocuments}>
                <FileText size={20} color="white" />
                <Text style={styles.submitButtonText}>{t('submitApplication')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

