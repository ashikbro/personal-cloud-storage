const express = require('express');
const router = express.Router();
const { upload, deleteFileFromS3, getSignedUrl } = require('../config/aws');
const { auth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const File = require('../models/File');
const User = require('../models/User');

// Upload file
router.post('/upload', auth, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const user = await User.findById(req.userId);
    
    // Check storage limit
    if (user.storageUsed + req.file.size > user.storageLimit) {
      await deleteFileFromS3(req.file.key);
      return res.status(400).json({ error: 'Storage limit exceeded' });
    }
    
    // Save file metadata
    const file = new File({
      filename: req.file.key.split('/').pop(),
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      s3Key: req.file.key,
      s3Url: req.file.location,
      userId: req.userId,
      encrypted: process.env.ENCRYPTION_ENABLED === 'true'
    });
    
    await file.save();
    
    // Update user storage
    user.storageUsed += req.file.size;
    await user.save();
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// Get all files for user
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.userId }).sort({ uploadedAt: -1 });
    
    res.json({
      files: files.map(file => ({
        id: file._id,
        filename: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        encrypted: file.encrypted
      }))
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file download URL
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Update last accessed
    file.lastAccessed = new Date();
    await file.save();
    
    // Generate signed URL
    const signedUrl = getSignedUrl(file.s3Key, 3600); // 1 hour expiry
    
    res.json({
      url: signedUrl,
      filename: file.originalName,
      mimeType: file.mimeType
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete from S3
    await deleteFileFromS3(file.s3Key);
    
    // Update user storage
    const user = await User.findById(req.userId);
    user.storageUsed = Math.max(0, user.storageUsed - file.size);
    await user.save();
    
    // Delete from database
    await File.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file preview (for images and PDFs)
router.get('/:id/preview', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if file is previewable
    const previewableMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf'
    ];
    
    if (!previewableMimeTypes.includes(file.mimeType)) {
      return res.status(400).json({ error: 'File type not previewable' });
    }
    
    // Generate signed URL with longer expiry for preview
    const signedUrl = getSignedUrl(file.s3Key, 7200); // 2 hours
    
    res.json({
      url: signedUrl,
      filename: file.originalName,
      mimeType: file.mimeType
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
