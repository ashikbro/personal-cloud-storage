import React, { useState, useRef } from 'react';
import { filesAPI } from '../services/api';
import '../styles/FileUpload.css';

const FileUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file) => {
    setError('');
    setUploading(true);
    setProgress(0);

    try {
      await filesAPI.upload(file, setProgress);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        if (onUploadSuccess) onUploadSuccess();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
      setProgress(0);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <form 
        className={`upload-form ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleChange}
        />
        
        <div 
          className="upload-area"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p>Uploading... {progress}%</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">☁️</div>
              <p className="upload-text">
                Drag and drop your file here or
              </p>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onButtonClick}
              >
                Browse Files
              </button>
            </>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default FileUpload;
