import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="hero-section">
          <h1 className="hero-title">☁️ Personal Cloud Storage</h1>
          <p className="hero-subtitle">
            Secure, self-hosted cloud storage with file uploads, previews, and encryption
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure Authentication</h3>
              <p>JWT token-based authentication with encrypted passwords</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">☁️</div>
              <h3>AWS S3 Storage</h3>
              <p>Reliable cloud storage powered by Amazon S3</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>Easy Upload</h3>
              <p>Drag-and-drop interface with upload progress</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👁️</div>
              <h3>File Preview</h3>
              <p>Preview PDFs and images directly in browser</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Optional Encryption</h3>
              <p>AES-256 encryption for enhanced security</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Admin Dashboard</h3>
              <p>Manage users and monitor storage usage</p>
            </div>
          </div>
          
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta primary">
              Get Started
            </Link>
            <Link to="/login" className="btn-cta secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
