const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  documentType: {
    type: String,
    enum: ['passport', 'driver_license', 'national_id', 'vehicle_registration'],
    required: [true, 'Document type is required']
  },
  documentNumber: {
    type: String,
    required: [true, 'Document number is required']
  },
  documentImage: {
    type: String,
    required: [true, 'Document image is required']
  },
  verificationData: {
    type: Object,
    verificationMethod: {
      type: String,
      enum: ['exness', 'manual', 'third_party'],
      default: 'manual'
    },
    submittedAt: Date,
    ipAddress: String,
    userAgent: String,
    confidence: Number,
    riskScore: String,
    externalVerificationId: String
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
