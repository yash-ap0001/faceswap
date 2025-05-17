import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">FaceSwap AI</h1>
      <div className="card">
        <h2>Welcome to FaceSwap AI</h2>
        <p>Choose a feature to get started:</p>
        <div className="mt-4">
          <Link to="/universal" className="btn btn-primary me-2">Universal Face Swap</Link>
          <Link to="/bridal-gallery" className="btn btn-primary me-2">Bridal Gallery</Link>
          <Link to="/bridal-swap" className="btn btn-primary me-2">Bridal Swap</Link>
          <Link to="/bulk-upload" className="btn btn-primary">Bulk Upload</Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 