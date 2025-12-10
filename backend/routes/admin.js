const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const File = require('../models/File');

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get system statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    
    // Calculate total storage used
    const users = await User.find();
    const totalStorageUsed = users.reduce((sum, user) => sum + user.storageUsed, 0);
    const totalStorageLimit = users.reduce((sum, user) => sum + user.storageLimit, 0);
    
    // Get recent uploads
    const recentFiles = await File.find()
      .sort({ uploadedAt: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    // Storage by user
    const storageByUser = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      percentageUsed: (user.storageUsed / user.storageLimit * 100).toFixed(2)
    })).sort((a, b) => b.storageUsed - a.storageUsed);
    
    res.json({
      stats: {
        totalUsers,
        totalFiles,
        totalStorageUsed,
        totalStorageLimit,
        percentageUsed: (totalStorageUsed / totalStorageLimit * 100).toFixed(2)
      },
      recentFiles: recentFiles.map(file => ({
        id: file._id,
        filename: file.originalName,
        size: file.size,
        uploadedBy: file.userId.name,
        uploadedAt: file.uploadedAt
      })),
      storageByUser
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user storage limit
router.patch('/users/:id/storage', adminAuth, async (req, res) => {
  try {
    const { storageLimit } = req.body;
    
    if (!storageLimit || storageLimit <= 0) {
      return res.status(400).json({ error: 'Invalid storage limit' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { storageLimit },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Storage limit updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    console.error('Update storage error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin user' });
    }
    
    // Delete all user files
    const files = await File.find({ userId: req.params.id });
    for (const file of files) {
      const { deleteFileFromS3 } = require('../config/aws');
      await deleteFileFromS3(file.s3Key);
      await File.findByIdAndDelete(file._id);
    }
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User and associated files deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all files (admin only)
router.get('/files', adminAuth, async (req, res) => {
  try {
    const files = await File.find()
      .populate('userId', 'name email')
      .sort({ uploadedAt: -1 });
    
    res.json({
      files: files.map(file => ({
        id: file._id,
        filename: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedBy: file.userId.name,
        uploadedAt: file.uploadedAt,
        encrypted: file.encrypted
      }))
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
