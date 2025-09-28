const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const KYCDocument = require('../models/kycDocumentModel');
const User = require('../models/userModel');

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
  getKYCDocuments,
  getKYCDocument,
  updateKYCDocument,
  deleteKYCDocument,
  getKYCStats
};
