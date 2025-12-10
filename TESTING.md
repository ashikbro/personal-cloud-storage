# Testing Guide for Personal Cloud Storage

This document provides a comprehensive guide for testing all features of the personal cloud storage application.

## Prerequisites

Before testing, ensure:
1. MongoDB is running locally or you have a connection string
2. AWS S3 bucket is configured with proper credentials
3. Backend `.env` file is configured with valid values
4. Both backend and frontend dependencies are installed

## Installation

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cloud-storage
JWT_SECRET=test-secret-key-change-in-production
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
ENCRYPTION_ENABLED=false
ENCRYPTION_KEY=test-key-32-characters-long-ok
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

## Test Cases

### 1. Landing Page
- [ ] Navigate to `http://localhost:3000`
- [ ] Verify landing page displays with features
- [ ] Click "Get Started" button → should redirect to register
- [ ] Click "Sign In" button → should redirect to login

### 2. User Registration
- [ ] Navigate to `/register`
- [ ] Test validation: try submitting empty form
- [ ] Test password mismatch: enter different passwords
- [ ] Test short password: enter password < 6 characters
- [ ] Successfully register with valid credentials:
  - Name: "Test User"
  - Email: "test@example.com"
  - Password: "password123"
- [ ] Verify redirect to dashboard after successful registration
- [ ] Verify JWT token is stored in localStorage
- [ ] Verify user sees storage usage bar showing 0 GB used

### 3. User Login
- [ ] Logout from dashboard
- [ ] Navigate to `/login`
- [ ] Test with incorrect credentials → should show error
- [ ] Login with correct credentials
- [ ] Verify redirect to dashboard
- [ ] Verify user data is loaded (name, storage info)

### 4. File Upload
- [ ] From dashboard, test drag-and-drop:
  - Drag an image file over the upload area
  - Verify drag-active styling appears
  - Drop the file
  - Verify upload progress bar appears
  - Verify file appears in the file list after upload
- [ ] Test browse files:
  - Click "Browse Files" button
  - Select a PDF file
  - Verify upload completes successfully
- [ ] Test upload progress:
  - Upload a larger file (10+ MB)
  - Verify progress percentage updates
- [ ] Verify storage usage updates after upload

### 5. File List and Management
- [ ] Verify uploaded files display with:
  - Correct file icon based on type
  - File name
  - File size in appropriate units
  - Upload date
  - Action buttons (preview, download, delete)
- [ ] Test file sorting by upload date (newest first)

### 6. File Preview
- [ ] Click preview button (👁️) on an image file:
  - Verify preview modal opens
  - Verify image displays correctly
  - Verify close button works
  - Click outside modal to close
- [ ] Click preview button on a PDF file:
  - Verify PDF displays in iframe
  - Verify PDF can be scrolled if multi-page
- [ ] Try preview on non-previewable file type:
  - Verify appropriate message is shown

### 7. File Download
- [ ] Click download button (⬇️) on any file
- [ ] Verify file downloads in new tab/window
- [ ] Verify downloaded file opens correctly
- [ ] Verify file content is intact

### 8. File Deletion
- [ ] Click delete button (🗑️) on a file
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion → file remains
- [ ] Delete file → confirm
- [ ] Verify file is removed from list
- [ ] Verify storage usage decreases

### 9. Storage Management
- [ ] Upload multiple files
- [ ] Verify storage bar updates in real-time
- [ ] Verify percentage calculation is correct
- [ ] Test storage limit:
  - Note: Default limit is 5GB
  - Upload files to approach limit
  - Verify error when limit exceeded

### 10. Admin User Creation
From MongoDB shell or MongoDB Compass:
```javascript
use cloud-storage
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)
```

- [ ] Logout and login again
- [ ] Verify "Admin Panel" button appears in header

### 11. Admin Dashboard - Statistics
- [ ] Click "Admin Panel" button
- [ ] Verify statistics cards show:
  - Total Users count
  - Total Files count
  - Total Storage Used
  - Total Storage Limit
- [ ] Verify "Storage by User" section shows all users
- [ ] Verify "Recent Uploads" shows last 10 files

### 12. Admin Dashboard - Users Management
- [ ] Click "Users" tab
- [ ] Verify all users are listed
- [ ] Verify user information displays:
  - Name, email, role
  - Storage used and limit
  - Created date
- [ ] Test "Update Limit" button:
  - Click on a user's "Update Limit"
  - Enter new storage limit in bytes (e.g., 10737418240 for 10GB)
  - Verify limit updates successfully
- [ ] Test "Delete" button (non-admin user only):
  - Create a second test user first
  - Delete the user
  - Verify user and their files are removed

### 13. Admin Dashboard - All Files
- [ ] Click "All Files" tab
- [ ] Verify all files from all users are listed
- [ ] Verify each file shows:
  - Filename
  - Size
  - MIME type
  - Uploaded by (username)
  - Upload date
  - Encryption status

### 14. Authentication & Security
- [ ] Test JWT token expiration:
  - Login and note the token in localStorage
  - Wait for token to expire (or manually remove it)
  - Try to access protected route
  - Verify redirect to login
- [ ] Test protected routes without auth:
  - Clear localStorage
  - Try to access `/dashboard` → redirect to login
  - Try to access `/admin` → redirect to login
- [ ] Test admin-only routes as regular user:
  - Login as regular user
  - Try to access `/admin`
  - Verify redirect to dashboard

### 15. Rate Limiting
- [ ] Test authentication rate limiting:
  - Attempt to login 6+ times with wrong password within 15 minutes
  - Verify "Too many authentication attempts" error after 5 attempts
- [ ] Test file upload rate limiting:
  - Upload 51+ files within 1 hour
  - Verify "Too many upload requests" error after 50 uploads
- [ ] Test general API rate limiting:
  - Make 101+ API requests within 15 minutes
  - Verify rate limit error

### 16. Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify all layouts adapt properly
- [ ] Verify buttons and inputs are usable on touch devices

### 17. Error Handling
- [ ] Test with MongoDB disconnected:
  - Stop MongoDB
  - Try to register/login
  - Verify appropriate error messages
- [ ] Test with invalid AWS credentials:
  - Use wrong AWS keys
  - Try to upload file
  - Verify error message
- [ ] Test with network errors:
  - Stop backend
  - Try to upload file from frontend
  - Verify error handling

### 18. Browser Compatibility
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Verify all features work across browsers

### 19. Optional: File Encryption
To test encryption:
1. Update backend `.env`: `ENCRYPTION_ENABLED=true`
2. Restart backend server
3. Upload a file
4. Verify file shows lock icon (🔒) in file list
5. Download and verify file decrypts correctly

### 20. Performance
- [ ] Test upload of large file (100MB)
- [ ] Test with 100+ files in list
- [ ] Verify pagination or virtual scrolling (if implemented)
- [ ] Verify no memory leaks in browser console

## API Testing with curl

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Files (requires token)
```bash
curl http://localhost:5000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upload File (requires token)
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.jpg"
```

## Common Issues & Solutions

### MongoDB Connection Error
**Problem**: "MongooseServerSelectionError"
**Solution**: Ensure MongoDB is running: `mongod` or check connection string

### AWS S3 Upload Error
**Problem**: "Access Denied" or "InvalidAccessKeyId"
**Solution**: 
- Verify AWS credentials in `.env`
- Check IAM permissions include S3 PutObject
- Verify bucket name is correct

### CORS Error
**Problem**: "Access to fetch blocked by CORS policy"
**Solution**: Ensure backend CORS is configured and running on port 5000

### Port Already in Use
**Problem**: "Error: listen EADDRINUSE: address already in use"
**Solution**: 
- Kill process using the port
- Or change PORT in `.env`

### JWT Token Error
**Problem**: "Invalid token" or "jwt malformed"
**Solution**:
- Clear browser localStorage
- Login again to get new token
- Verify JWT_SECRET is set in `.env`

## Test Completion Checklist

- [ ] All 20 test cases completed
- [ ] No console errors during testing
- [ ] All features work as expected
- [ ] Documentation is accurate
- [ ] Security features are functioning
- [ ] Application is ready for deployment

## Notes

Record any issues found during testing:
1. 
2. 
3. 

Record any improvements or feature requests:
1. 
2. 
3.
