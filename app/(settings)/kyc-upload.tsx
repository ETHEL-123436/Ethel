import { useAuth } from "@/providers/auth-provider";
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

interface VehiclePhotos {
  front?: string;
  side?: string;
  back?: string;
  inside?: string;
  plate?: string;
}

interface KYCDocument {
  type: 'passport' | 'drivers_license' | 'national_id' | 'vehicle_registration';
  title: string;
  description: string;
  required: boolean;
  uri?: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
}

type FormStep = 'personal' | 'vehicle' | 'documents' | 'review';

export default function KYCUploadScreen() {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [isDriver] = useState(user?.role === 'driver');

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

  const [vehiclePhotos, setVehiclePhotos] = useState<VehiclePhotos>({
    front: undefined,
    side: undefined,
    back: undefined,
    inside: undefined,
    plate: undefined,
  });

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
      case 'personal': return 'Personal Information';
      case 'vehicle': return 'Vehicle Information';
      case 'documents': return isDriver ? 'Documents & Photos' : 'Document Upload';
      case 'review': return 'Review & Submit';
      default: return 'Personal Information';
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (isDoc) {
          setDocuments(prev => prev.map(doc =>
            doc.type === target
              ? { ...doc, uri: result.assets[0].uri, status: 'uploaded' as const }
              : doc
          ));
        } else {
          setVehiclePhotos(prev => ({ ...prev, [target]: result.assets[0].uri }));
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
      });

      if (!result.canceled && result.assets[0]) {
        if (isDoc) {
          setDocuments(prev => prev.map(doc =>
            doc.type === target
              ? { ...doc, uri: result.assets[0].uri, status: 'uploaded' as const }
              : doc
          ));
        } else {
          setVehiclePhotos(prev => ({ ...prev, [target]: result.assets[0].uri }));
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
      await updateProfile({ kycStatus: 'pending' });

      Alert.alert(
        'Application Submitted!',
        'Your KYC application has been submitted successfully. You will be notified once the review is complete.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.fullName}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, fullName: text }))}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.phoneNumber}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phoneNumber: text }))}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.dateOfBirth}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: text }))}
          placeholder="DD/MM/YYYY"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={personalInfo.address}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, address: text }))}
          placeholder="Enter your full address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.city}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, city: text }))}
          placeholder="Enter your city"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Emergency Contact Name *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.emergencyContact}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, emergencyContact: text }))}
          placeholder="Enter emergency contact name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Emergency Contact Phone *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.emergencyPhone}
          onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, emergencyPhone: text }))}
          placeholder="Enter emergency contact phone"
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
                <CheckCircle size={20} color="#4CAF50" />
              ) : (
                <Upload size={20} color="#999" />
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
              <Camera size={16} color="#667eea" />
              <Text style={styles.uploadButtonText}>
                {document.uri ? 'Change Photo' : 'Upload Photo'}
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
      { key: 'front', title: 'Front View *' },
      { key: 'side', title: 'Side View *' },
      { key: 'back', title: 'Back View *' },
      { key: 'inside', title: 'Inside View *' },
      { key: 'plate', title: 'Plate Number (Clear Photo) *' },
    ];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>
          Upload clear photos of your vehicle from different angles.
        </Text>

        {photoUploads.map(({ key, title }) => (
          <View key={key} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{title}</Text>
              </View>
              <View style={styles.documentStatus}>
                {vehiclePhotos[key] ? (
                  <CheckCircle size={20} color="#4CAF50" />
                ) : (
                  <Upload size={20} color="#999" />
                )}
              </View>
            </View>

            {vehiclePhotos[key] && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: vehiclePhotos[key] }} style={styles.previewImage} />
              </View>
            )}

            <TouchableOpacity
              style={[styles.uploadButton, vehiclePhotos[key] ? styles.changeButton : {}]}
              onPress={() => showImagePicker(key, false)}
            >
              <Camera size={16} color="#667eea" />
              <Text style={styles.uploadButtonText}>{vehiclePhotos[key] ? 'Change Photo' : 'Upload Photo'}</Text>
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

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Personal Information</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Full Name:</Text>
          <Text style={styles.reviewValue}>{personalInfo.fullName}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Phone:</Text>
          <Text style={styles.reviewValue}>{personalInfo.phoneNumber}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Date of Birth:</Text>
          <Text style={styles.reviewValue}>{personalInfo.dateOfBirth}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Address:</Text>
          <Text style={styles.reviewValue}>{personalInfo.address}</Text>
        </View>
      </View>

      {isDriver && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Vehicle Information</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Make & Model:</Text>
            <Text style={styles.reviewValue}>{vehicleInfo.make} {vehicleInfo.model}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Year:</Text>
            <Text style={styles.reviewValue}>{vehicleInfo.year}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>License Plate:</Text>
            <Text style={styles.reviewValue}>{vehicleInfo.plateNumber}</Text>
          </View>
        </View>
      )}

      {isDriver && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Vehicle Photos</Text>
          {Object.entries(vehiclePhotos).map(([key, value]) => value && (
            <View key={key} style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>{key.charAt(0).toUpperCase() + key.slice(1)} View:</Text>
              <Text style={styles.reviewValue}>✓ Uploaded</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Uploaded Documents</Text>
        {documents.filter(doc => doc.status === 'uploaded').map((doc) => (
          <View key={doc.type} style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>{doc.title}:</Text>
            <Text style={styles.reviewValue}>✓ Uploaded</Text>
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
      <Stack.Screen options={{ title: "Complete Your Profile" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.progressTitle}>{getStepTitle(currentStep)}</Text>
          </View>

          {/* Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            {currentStep !== 'personal' && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <ChevronLeft size={20} color="#667eea" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep !== 'review' ? (
              <TouchableOpacity
                style={[styles.nextButton, !canProceedToNext() && styles.nextButtonDisabled]}
                onPress={nextStep}
                disabled={!canProceedToNext()}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.submitButton} onPress={submitDocuments}>
                <FileText size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Application</Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  progressCircleActive: {
    backgroundColor: '#667eea',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  progressTextActive: {
    color: 'white',
  },
  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 24,
  },
  progressLineActive: {
    backgroundColor: '#667eea',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  stepContent: {
    gap: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  changeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    backgroundColor: '#e8f5e8',
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
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
  reviewSection: {
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
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    color: '#666',
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    color: '#333',
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
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
    backgroundColor: '#4CAF50',
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
