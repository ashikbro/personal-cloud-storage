import React, { useState } from 'react';
import { filesAPI } from '../services/api';
import '../styles/FileList.css';

const FileList = ({ files, onFileDeleted }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes) => {
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const data = await filesAPI.downloadFile(fileId);
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  const handlePreview = async (file) => {
    const previewableMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf'
    ];

    if (!previewableMimeTypes.includes(file.mimeType)) {
      alert('Preview not available for this file type');
      return;
    }

    try {
      const data = await filesAPI.previewFile(file.id);
      setPreviewUrl(data.url);
      setPreviewType(file.mimeType);
      setShowPreview(true);
    } catch (err) {
      console.error('Preview failed:', err);
      alert('Failed to load preview');
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await filesAPI.deleteFile(fileId);
        if (onFileDeleted) onFileDeleted();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete file');
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    return '📁';
  };

  if (!files || files.length === 0) {
    return (
      <div className="file-list-empty">
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="file-list">
        <div className="file-list-header">
          <div className="file-col-name">Name</div>
          <div className="file-col-size">Size</div>
          <div className="file-col-date">Uploaded</div>
          <div className="file-col-actions">Actions</div>
        </div>
        
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-col-name">
              <span className="file-icon">{getFileIcon(file.mimeType)}</span>
              <span className="file-name">{file.filename}</span>
              {file.encrypted && <span className="encrypted-badge">🔒</span>}
            </div>
            <div className="file-col-size">{formatFileSize(file.size)}</div>
            <div className="file-col-date">{formatDate(file.uploadedAt)}</div>
            <div className="file-col-actions">
              <button 
                className="btn-icon" 
                onClick={() => handlePreview(file)}
                title="Preview"
              >
                👁️
              </button>
              <button 
                className="btn-icon" 
                onClick={() => handleDownload(file.id, file.filename)}
                title="Download"
              >
                ⬇️
              </button>
              <button 
                className="btn-icon btn-danger" 
                onClick={() => handleDelete(file.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPreview && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={closePreview}>✕</button>
            {previewType?.startsWith('image/') && (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            )}
            {previewType === 'application/pdf' && (
              <iframe src={previewUrl} className="preview-pdf" title="PDF Preview" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FileList;
