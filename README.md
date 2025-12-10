# Personal Cloud Storage

A secure, self-hosted personal cloud storage solution with React frontend, Node.js backend, and AWS S3 for storage. Features include secure file uploads, previews for PDFs/images, optional encryption, admin dashboard, and token-based authentication.

## Features

- 🔐 **Secure Authentication**: Token-based JWT authentication
- ☁️ **AWS S3 Storage**: Reliable cloud storage with S3 integration
- 📤 **File Upload**: Drag-and-drop file upload with progress tracking
- 👁️ **File Preview**: Preview PDFs and images directly in the browser
- 🔒 **Optional Encryption**: Enable file encryption for enhanced security
- 📊 **Admin Dashboard**: Manage users, monitor storage usage, and view statistics
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 💾 **Storage Management**: Track and manage storage quotas per user

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- AWS S3
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Vite for fast development

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- AWS account with S3 bucket configured

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ashikbro/personal-cloud-storage.git
cd personal-cloud-storage
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cloud-storage

# JWT Secret (change this to a strong secret)
JWT_SECRET=your-secret-key-here-change-in-production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# File Encryption (optional)
ENCRYPTION_ENABLED=false
ENCRYPTION_KEY=your-32-character-encryption-key

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. AWS S3 Configuration

1. Create an S3 bucket in your AWS account
2. Configure CORS for your bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

3. Create an IAM user with S3 permissions and get access keys
4. Update the `.env` file with your AWS credentials

### 5. MongoDB Setup

Make sure MongoDB is running locally:

```bash
mongod
```

Or use MongoDB Atlas for a cloud-hosted database and update the `MONGODB_URI` in your `.env` file.

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### User Registration and Login

1. Navigate to `http://localhost:3000`
2. Click "Register" to create a new account
3. Fill in your name, email, and password
4. After registration, you'll be automatically logged in

### Uploading Files

1. From the dashboard, drag and drop files or click "Browse Files"
2. Upload progress will be displayed
3. Uploaded files appear in the file list

### File Preview

- Click the eye icon (👁️) to preview images and PDFs
- Preview opens in a modal with the file content

### File Download

- Click the download icon (⬇️) to download any file
- Files are downloaded directly from S3

### File Deletion

- Click the trash icon (🗑️) to delete a file
- Confirm the deletion in the popup dialog

### Admin Dashboard

If you're an admin user:

1. Click "Admin Panel" in the header
2. View system statistics including:
   - Total users
   - Total files
   - Storage usage
3. Manage users and their storage limits
4. View all files in the system

### Creating an Admin User

After starting the backend, you can manually create an admin user by:

1. Register a normal user account
2. Connect to MongoDB and update the user's role:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get user files
- `GET /api/files/:id/download` - Get download URL
- `GET /api/files/:id/preview` - Get preview URL
- `DELETE /api/files/:id` - Delete file

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)
- `GET /api/admin/files` - Get all files (admin only)
- `PATCH /api/admin/users/:id/storage` - Update user storage limit (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes and API endpoints
- Optional file encryption
- Storage limit enforcement
- Admin-only routes

## File Encryption

To enable file encryption:

1. Set `ENCRYPTION_ENABLED=true` in your `.env` file
2. Provide a 32-character encryption key
3. Files will be automatically encrypted on upload
4. Encrypted files are marked with a lock icon (🔒)

**Note**: Changing the encryption key after files are encrypted will make them unreadable.

## Storage Management

- Default storage limit per user: 5GB
- Admins can adjust storage limits per user
- Storage usage is tracked automatically
- Users cannot upload files that exceed their limit

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file

### AWS S3 Upload Error
- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure CORS is configured on the bucket

### JWT Token Error
- Clear browser localStorage
- Re-login to get a new token

### Port Already in Use
- Change `PORT` in backend `.env` file
- Update proxy settings in `frontend/vite.config.js`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub.
