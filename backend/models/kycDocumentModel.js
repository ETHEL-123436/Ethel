const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  // Personal Information
  personalInfo: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    emergencyContact: { type: String },
    emergencyPhone: { type: String }
  },
  // Vehicle Information (for drivers only)
  vehicleInfo: {
    make: String,
    model: String,
    year: String,
    color: String,
    plateNumber: String,
    licenseNumber: String
  },
  // Documents array
  documents: [{
    type: { type: String, enum: ['passport', 'drivers_license', 'national_id', 'vehicle_registration'] },
    title: String,
    uri: String,
    status: { type: String, enum: ['pending', 'uploaded', 'approved', 'rejected'], default: 'uploaded' }
  }],
  // Vehicle Photos (for drivers only)
  vehiclePhotos: {
    front: String,
    side: String,
    back: String,
    inside: String,
    plate: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
kycDocumentSchema.index({ userId: 1, status: 1 });
kycDocumentSchema.index({ status: 1 });

// Static method to get KYC stats
kycDocumentSchema.statics.getKYCStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('KYCDocument', kycDocumentSchema);
