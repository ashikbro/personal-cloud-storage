const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Multer S3 configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `${req.userId}/${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Helper functions for S3 operations
const deleteFileFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };
  
  return await s3.deleteObject(params).promise();
};

const getSignedUrl = (key, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: expiresIn
  };
  
  return s3.getSignedUrl('getObject', params);
};

const getFileFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };
  
  return await s3.getObject(params).promise();
};

module.exports = {
  s3,
  upload,
  deleteFileFromS3,
  getSignedUrl,
  getFileFromS3
};
