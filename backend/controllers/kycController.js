const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const KYCDocument = require('../models/kycDocumentModel');
const User = require('../models/userModel');
const { uploadToCloudinary } = require('../utils/cloudinaryUploader');
const { Buffer } = require('buffer');

const getKYCDocuments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};

  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by user if provided
  if (req.query.userId) {
    query.userId = req.query.userId;
  }

  // Execute query
  const documents = await KYCDocument.find(query)
    .populate('userId', 'name email role')
    .populate('reviewedBy', 'name email')
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Get total count
  const total = await KYCDocument.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      data: documents,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

const getKYCDocument = asyncHandler(async (req, res, next) => {
  const document = await KYCDocument.findById(req.params.id)
    .populate('userId', 'name email role')
    .populate('reviewedBy', 'name email');

  if (!document) {
    return next(new ErrorResponse('KYC document not found', 404));
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

const updateKYCDocument = asyncHandler(async (req, res, next) => {
  const { status, reviewNotes } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Valid status is required (pending, approved, rejected)', 400));
  }

  const document = await KYCDocument.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse('KYC document not found', 404));
  }

  // Update document
  document.status = status;
  document.reviewNotes = reviewNotes;
  document.reviewedBy = req.user.id;
  document.reviewedAt = new Date();

  await document.save();

  // Update user's KYC status
  await User.findByIdAndUpdate(document.userId, { kycStatus: status });

  // Populate the updated document
  await document.populate('userId', 'name email role');
  await document.populate('reviewedBy', 'name email');

  res.status(200).json({
    success: true,
    data: document
  });
});

const deleteKYCDocument = asyncHandler(async (req, res, next) => {
  const document = await KYCDocument.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse('KYC document not found', 404));
  }

  await document.remove();

  res.status(200).json({
    success: true,
    message: 'KYC document deleted successfully'
  });
});

const submitKYC = asyncHandler(async (req, res, next) => {
  console.log('KYC Submit Request received for user:', req.user?.id);

  const {
    personalInfo,
    vehicleInfo,
    documents,
    vehiclePhotos
  } = req.body;

  // Validate required fields
  if (!personalInfo || !documents) {
    console.log('KYC Submit: Missing required fields');
    return next(new ErrorResponse('Personal information and documents are required', 400));
  }

  // Check if user already has a pending KYC application
  const existingApplication = await KYCDocument.findOne({
    userId: req.user.id,
    status: 'pending'
  });

  if (existingApplication) {
    console.log('KYC Submit: User already has pending application');
    return next(new ErrorResponse('You already have a pending KYC application', 400));
  }

  console.log('KYC Submit: Processing documents for user:', req.user.id);

  // Process documents with base64 data
  const processedDocuments = [];
  for (const doc of documents) {
    if (doc.base64Data) {
      try {
        // Convert base64 to buffer and upload
        const buffer = Buffer.from(doc.base64Data, 'base64');
        const fileName = doc.fileName || `document_${doc.type}_${Date.now()}.jpg`;

        // Ensure uploads directory exists
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const tempPath = path.join(uploadsDir, `temp_${Date.now()}_${fileName}`);

        // Write buffer to temporary file
        fs.writeFileSync(tempPath, buffer);

        // Upload to cloudinary
        const uploadResult = await uploadToCloudinary(tempPath, { folder: 'kyc_documents' });

        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        processedDocuments.push({
          type: doc.type,
          title: doc.title,
          uri: uploadResult.secure_url,
          status: doc.status
        });
      } catch (error) {
        console.error(`Error processing document ${doc.type}:`, error);
        return next(new ErrorResponse(`Failed to process document ${doc.type}: ${error.message}`, 500));
      }
    } else {
      processedDocuments.push({
        type: doc.type,
        title: doc.title,
        status: doc.status
      });
    }
  }

  // Process vehicle photos for drivers
  let processedVehiclePhotos = undefined;
  if (req.user.role === 'driver' && vehiclePhotos) {
    processedVehiclePhotos = {};
    const vehiclePhotoFields = ['front', 'side', 'back', 'inside', 'plate'];

    for (const field of vehiclePhotoFields) {
      const photoData = vehiclePhotos[field];
      if (photoData && photoData.base64Data) {
        try {
          // Convert base64 to buffer and upload
          const buffer = Buffer.from(photoData.base64Data, 'base64');
          const fileName = photoData.fileName || `vehicle_${field}_${Date.now()}.jpg`;

          // Ensure uploads directory exists
          const fs = require('fs');
          const path = require('path');
          const uploadsDir = path.join(process.cwd(), 'uploads');

          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const tempPath = path.join(uploadsDir, `temp_${Date.now()}_${fileName}`);

          // Write buffer to temporary file
          fs.writeFileSync(tempPath, buffer);

          // Upload to cloudinary
          const uploadResult = await uploadToCloudinary(tempPath, { folder: 'vehicle_photos' });

          // Clean up temp file
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }

          processedVehiclePhotos[field] = uploadResult.secure_url;
        } catch (error) {
          console.error(`Error processing vehicle photo ${field}:`, error);
          return next(new ErrorResponse(`Failed to process vehicle photo ${field}: ${error.message}`, 500));
        }
      }
    }
  }

  // Create KYC document
  const kycDocument = await KYCDocument.create({
    userId: req.user.id,
    personalInfo,
    vehicleInfo: req.user.role === 'driver' ? vehicleInfo : undefined,
    documents: processedDocuments,
    vehiclePhotos: processedVehiclePhotos,
    status: 'pending',
    uploadedAt: new Date()
  });

  console.log('KYC Submit: Document created successfully for user:', req.user.id);

  // Update user's KYC status
  await User.findByIdAndUpdate(req.user.id, { kycStatus: 'pending' });

  console.log('KYC Submit: User KYC status updated for user:', req.user.id);

  res.status(201).json({
    success: true,
    data: kycDocument,
    message: 'KYC application submitted successfully'
  });
});

const getKYCStats = asyncHandler(async (req, res, next) => {
  const stats = await KYCDocument.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsMap = {
    pending: 0,
    approved: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    statsMap[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      ...statsMap
    }
  });
});

module.exports = {
  submitKYC,
  getKYCDocuments,
  getKYCDocument,
  updateKYCDocument,
  deleteKYCDocument,
  getKYCStats
};
