const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/userModel');
const KYCDocument = require('../models/kycDocumentModel');

// @desc    Submit passenger verification documents
// @route   POST /api/passenger/verify
// @access  Private (Passenger only)
exports.submitPassengerVerification = asyncHandler(async (req, res, next) => {
  const { documentType, documentNumber, documentImage, verificationData } = req.body;

  // Validate required fields
  if (!documentType || !documentNumber || !documentImage) {
    return next(new ErrorResponse('Document type, number, and image are required', 400));
  }

  // Validate document type for passengers
  const validPassengerDocTypes = ['passport', 'national_id', 'driver_license'];
  if (!validPassengerDocTypes.includes(documentType)) {
    return next(new ErrorResponse('Invalid document type for passenger verification', 400));
  }

  // Check if user already has pending verification
  const existingVerification = await KYCDocument.findOne({
    userId: req.user.id,
    status: 'pending',
    documentType: { $in: validPassengerDocTypes }
  });

  if (existingVerification) {
    return next(new ErrorResponse('You already have a pending verification request', 400));
  }

  // Create KYC document for passenger verification
  const verificationDoc = await KYCDocument.create({
    userId: req.user.id,
    documentType,
    documentNumber,
    documentImage,
    verificationData: {
      ...verificationData,
      verificationMethod: 'exness',
      submittedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  });

  // Update user's passenger verification status
  await User.findByIdAndUpdate(req.user.id, {
    passengerVerificationStatus: 'pending',
    passengerVerificationSubmittedAt: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'Passenger verification submitted successfully',
    data: {
      verificationId: verificationDoc._id,
      status: 'pending',
      submittedAt: verificationDoc.createdAt
    }
  });
});

// @desc    Get passenger verification status
// @route   GET /api/passenger/verification-status
// @access  Private (Passenger only)
exports.getPassengerVerificationStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('kycDocuments');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get passenger verification documents
  const passengerDocs = await KYCDocument.find({
    userId: req.user.id,
    documentType: { $in: ['passport', 'national_id', 'driver_license'] }
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      verificationStatus: user.passengerVerificationStatus || 'not_submitted',
      documents: passengerDocs,
      canSubmitVerification: user.passengerVerificationStatus !== 'pending'
    }
  });
});

exports.uploadPassengerDocument = asyncHandler(async (req, res, next) => {
  const { documentType, documentNumber, documentImage } = req.body;

  if (!documentType || !documentNumber || !documentImage) {
    return next(new ErrorResponse('Document type, number, and image are required', 400));
  }

  // Create additional document
  const document = await KYCDocument.create({
    userId: req.user.id,
    documentType,
    documentNumber,
    documentImage,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Additional document uploaded successfully',
    data: document
  });
});

// @desc    Exness verification method - external API call
// @route   POST /api/passenger/exness-verify
// @access  Private (Passenger only)
exports.exnessVerification = asyncHandler(async (req, res, next) => {
  const { documentType, documentNumber, personalInfo } = req.body;

  // Validate required fields
  if (!documentType || !documentNumber || !personalInfo) {
    return next(new ErrorResponse('Document type, number, and personal info are required', 400));
  }

  // Simulate Exness verification API call
  // In real implementation, this would call the actual Exness API
  const exnessVerificationResult = await simulateExnessVerification({
    documentType,
    documentNumber,
    personalInfo,
    userId: req.user.id
  });

  // Update user verification status based on Exness result
  await User.findByIdAndUpdate(req.user.id, {
    exnessVerificationStatus: exnessVerificationResult.status,
    exnessVerificationResult: exnessVerificationResult,
    exnessVerifiedAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Exness verification completed',
    data: {
      verificationStatus: exnessVerificationResult.status,
      confidence: exnessVerificationResult.confidence,
      verifiedAt: new Date()
    }
  });
});

// @desc    Get passenger verification history
// @route   GET /api/passenger/verification-history
// @access  Private (Passenger only)
exports.getPassengerVerificationHistory = asyncHandler(async (req, res, next) => {
  const verificationHistory = await KYCDocument.find({
    userId: req.user.id,
    documentType: { $in: ['passport', 'national_id', 'driver_license'] }
  })
  .populate('reviewedBy', 'name email')
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: verificationHistory.length,
    data: verificationHistory
  });
});

// Helper function to simulate Exness verification
const simulateExnessVerification = async (verificationData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate verification result (in real app, this would call actual Exness API)
  const mockResults = {
    status: 'approved',
    confidence: 0.95,
    verificationId: 'EXN_' + Date.now(),
    verifiedAt: new Date(),
    details: {
      documentValid: true,
      identityMatch: true,
      riskScore: 'low'
    }
  };

  return mockResults;
};

module.exports = {
  submitPassengerVerification: exports.submitPassengerVerification,
  getPassengerVerificationStatus: exports.getPassengerVerificationStatus,
  uploadPassengerDocument: exports.uploadPassengerDocument,
  exnessVerification: exports.exnessVerification,
  getPassengerVerificationHistory: exports.getPassengerVerificationHistory
};
