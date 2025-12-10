import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, filesData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getAllFiles()
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setFiles(filesData.files);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStorage = async (userId) => {
    const newLimit = prompt('Enter new storage limit (in bytes):');
    if (newLimit && !isNaN(newLimit)) {
      try {
        await adminAPI.updateUserStorage(userId, parseInt(newLimit));
        loadData();
      } catch (err) {
        alert('Failed to update storage limit');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure? This will delete all user files!')) {
      try {
        await adminAPI.deleteUser(userId);
        loadData();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Files
          </button>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          All Files
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'stats' && stats && (
          <div className="stats-section">
            <div className="stat-cards">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.stats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h3>Total Files</h3>
                <p className="stat-value">{stats.stats.totalFiles}</p>
              </div>
              <div className="stat-card">
                <h3>Storage Used</h3>
                <p className="stat-value">{formatBytes(stats.stats.totalStorageUsed)}</p>
              </div>
              <div className="stat-card">
                <h3>Storage Limit</h3>
                <p className="stat-value">{formatBytes(stats.stats.totalStorageLimit)}</p>
              </div>
            </div>

            <div className="storage-breakdown">
              <h3>Storage by User</h3>
              <div className="storage-list">
                {stats.storageByUser.map(user => (
                  <div key={user.userId} className="storage-item">
                    <div className="storage-user">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="storage-usage">
                      <span>{formatBytes(user.storageUsed)} / {formatBytes(user.storageLimit)}</span>
                      <span className="storage-percent">{user.percentageUsed}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-files">
              <h3>Recent Uploads</h3>
              <div className="recent-files-list">
                {stats.recentFiles.map(file => (
                  <div key={file.id} className="recent-file-item">
                    <span className="file-name">{file.filename}</span>
                    <span className="file-size">{formatBytes(file.size)}</span>
                    <span className="file-user">{file.uploadedBy}</span>
                    <span className="file-date">{formatDate(file.uploadedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Storage Used</th>
                  <th>Storage Limit</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td>{formatBytes(user.storageUsed)}</td>
                    <td>{formatBytes(user.storageLimit)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button 
                        className="btn-small" 
                        onClick={() => handleUpdateStorage(user.id)}
                      >
                        Update Limit
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          className="btn-small btn-danger" 
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="files-section">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Uploaded By</th>
                  <th>Upload Date</th>
                  <th>Encrypted</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
                  <tr key={file.id}>
                    <td>{file.filename}</td>
                    <td>{formatBytes(file.size)}</td>
                    <td>{file.mimeType}</td>
                    <td>{file.uploadedBy}</td>
                    <td>{formatDate(file.uploadedAt)}</td>
                    <td>{file.encrypted ? '🔒 Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
