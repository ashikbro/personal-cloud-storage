const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

// Encrypt buffer
const encryptBuffer = (buffer) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32', 'utf8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
};

// Decrypt buffer
const decryptBuffer = (encryptedData, ivHex) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32', 'utf8').slice(0, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  
  return decrypted;
};

// Encrypt file stream
const encryptFile = (buffer) => {
  if (process.env.ENCRYPTION_ENABLED === 'true') {
    return encryptBuffer(buffer);
  }
  return { encryptedData: buffer, iv: null };
};

// Decrypt file stream
const decryptFile = (encryptedData, iv) => {
  if (iv) {
    return decryptBuffer(encryptedData, iv);
  }
  return Buffer.from(encryptedData, 'hex');
};

module.exports = {
  encryptFile,
  decryptFile
};
