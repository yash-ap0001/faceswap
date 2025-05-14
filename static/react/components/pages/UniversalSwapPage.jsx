import React, { useState, useRef, useEffect } from 'react';
import LoadingIndicator from '../common/LoadingIndicator';

/**
 * Universal Face Swap component that works across multiple categories (Groom, Saloon) with minimal clicks
 * This provides a streamlined face swap experience requiring only photo upload and swap action
 */
const UniversalSwapPage = ({ category = 'auto' }) => {
  // State for selected image file
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // State for results
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for auto-detected or user-selected category
  const [activeCategory, setActiveCategory] = useState(category);
  
  // Reference to file input
  const fileInputRef = useRef(null);
  
  // Available categories and their template types
  const categories = {
    'groom': {
      name: 'Groom Styles',
      templateTypes: ['traditional', 'modern', 'accessories']
    },
    'bride-saloon': {
      name: 'Bride Saloon Styles',
      templateTypes: ['makeup', 'hair', 'full']
    },
    'groom-saloon': {
      name: 'Groom Saloon Styles',
      templateTypes: ['hair', 'beard', 'full']
    }
  };
  
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Auto process if we're in ultra-minimal mode
      processSwap(file);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // If we already have a file, process it with the new category
    if (selectedFile) {
      processSwap(selectedFile, category);
    }
  };
  
  // Process face swap
  const processSwap = async (file, category = activeCategory) => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('source', file);
      formData.append('category', category);
      
      // Add category-specific data
      if (category === 'auto') {
        // In auto mode, we'll try all categories
        formData.append('process_all', 'true');
      }
      
      // Send the request
      const response = await fetch('/universal-face-swap', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        
        // If category was auto, set it to the detected category
        if (category === 'auto' && data.detected_category) {
          setActiveCategory(data.detected_category);
        }
      } else {
        setError(data.message || 'Failed to process face swap');
      }
    } catch (err) {
      console.error('Error processing face swap:', err);
      setError('Failed to process face swap. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Open result image in modal/new tab
  const viewFullImage = (imageUrl) => {
    // Open in modal or new tab
    window.open(imageUrl, '_blank');
  };
  
  return (
    <div className="universal-swap-container">
      {/* Minimal Header */}
      <div className="swap-header text-center mb-3">
        <h4 className="mb-0">Universal Face Swap</h4>
        <small className="text-muted">Upload your photo to see yourself in multiple styles</small>
      </div>
      
      {/* Main content area */}
      <div className="swap-content">
        {/* Upload Area - Only shown if no file selected or explicitly in upload mode */}
        {!previewImage && (
          <div className="upload-area text-center p-5 border rounded mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="d-none"
            />
            
            <div className="upload-placeholder">
              <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
              <h5>Upload Your Photo</h5>
              <p className="text-muted small">Click to select or drag an image here</p>
              <button
                className="btn btn-primary mt-2"
                onClick={triggerFileInput}
              >
                Select Photo
              </button>
            </div>
          </div>
        )}
        
        {/* Preview & Quick Actions - Only shown when file is selected */}
        {previewImage && (
          <div className="user-preview d-flex align-items-center justify-content-between mb-4">
            <div className="preview-image-container me-3">
              <img
                src={previewImage}
                alt="Your uploaded photo"
                className="preview-image rounded"
                style={{ maxHeight: '150px', maxWidth: '150px', objectFit: 'cover' }}
              />
            </div>
            
            <div className="preview-actions flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">Your Photo</h5>
                  <p className="text-muted mb-2 small">
                    {selectedFile?.name || 'Image selected'}
                  </p>
                </div>
                
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={triggerFileInput}
                  >
                    Change Photo
                  </button>
                  
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => processSwap(selectedFile)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Generate All Styles'}
                  </button>
                </div>
              </div>
              
              {/* Category selector - Optional, can be hidden for ultra-minimal UI */}
              <div className="category-selector mt-3 d-flex overflow-auto">
                {Object.keys(categories).map((cat) => (
                  <div 
                    key={cat}
                    className={`category-option me-2 p-2 border rounded ${activeCategory === cat ? 'border-primary' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                    style={{ cursor: 'pointer', minWidth: '120px', textAlign: 'center' }}
                  >
                    <small>{categories[cat].name}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        {/* Results Grid - Responsive grid of results */}
        {loading ? (
          <div className="text-center py-5">
            <LoadingIndicator />
            <p className="mt-3">Processing your face with multiple templates...</p>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="results-container mt-4">
                <h5 className="mb-3">Results ({results.length})</h5>
                
                <div className="results-grid row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                  {results.map((result, index) => (
                    <div key={index} className="col">
                      <div className="result-card h-100 border-0">
                        <div 
                          className="result-image-container position-relative"
                          onClick={() => viewFullImage(result.result_url)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={result.result_url}
                            alt={`Face swap result ${index + 1}`}
                            className="result-image img-fluid rounded"
                            style={{ 
                              width: '100%', 
                              height: '300px', 
                              objectFit: 'cover',
                              objectPosition: 'top'
                            }}
                          />
                          
                          {/* Optional category label */}
                          <div className="image-tag position-absolute bottom-0 start-0 m-2">
                            <span className="badge bg-dark bg-opacity-75 small">
                              {result.category || 'Style ' + (index + 1)}
                            </span>
                          </div>
                          
                          {/* View full icon */}
                          <div className="image-action position-absolute top-0 end-0 m-2">
                            <span className="badge bg-primary bg-opacity-75">
                              <i className="fas fa-expand-alt"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UniversalSwapPage;