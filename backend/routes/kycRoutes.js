const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  submitKYC,
  getKYCDocuments,
  getKYCDocument,
  updateKYCDocument,
  deleteKYCDocument,
  getKYCStats
} = require('../controllers/kycController');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/', // Temporary storage
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/submit', protect, submitKYC);
router.get('/stats', protect, getKYCStats);
router.get('/', protect, getKYCDocuments);
router.get('/:id', protect, getKYCDocument);
router.put('/:id', protect, updateKYCDocument);
router.delete('/:id', protect, deleteKYCDocument);

module.exports = router;