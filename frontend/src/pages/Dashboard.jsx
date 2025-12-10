import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { filesAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await filesAPI.getFiles();
      setFiles(data.files);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatStorageSize = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2);
  };

  const storagePercentage = user ? (user.storageUsed / user.storageLimit * 100).toFixed(1) : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>☁️ Cloud Storage</h1>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          {user?.role === 'admin' && (
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          )}
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="storage-info">
          <h3>Storage Usage</h3>
          <div className="storage-bar">
            <div 
              className="storage-fill" 
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <p>
            {formatStorageSize(user?.storageUsed || 0)} GB of {formatStorageSize(user?.storageLimit || 0)} GB used ({storagePercentage}%)
          </p>
        </div>

        <div className="upload-section">
          <h2>Upload File</h2>
          <FileUpload onUploadSuccess={loadFiles} />
        </div>

        <div className="files-section">
          <h2>My Files</h2>
          {loading ? (
            <p>Loading files...</p>
          ) : (
            <FileList files={files} onFileDeleted={loadFiles} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
