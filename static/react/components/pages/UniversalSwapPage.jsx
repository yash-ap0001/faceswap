import React, { useState, useRef } from 'react';

/**
 * UniversalSwapPage - A streamlined face swap component for quick and easy face swapping
 * across multiple categories with minimal user interaction (just upload and view results)
 * 
 * @param {string} category - The category to filter templates (groom, bride-saloon, groom-saloon)
 */
const UniversalSwapPage = ({ category = 'auto' }) => {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedCategory, setDetectedCategory] = useState(category);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  
  const categoryLabels = {
    'groom': 'Create Groom Look',
    'bride-saloon': 'Makeup & Hair',
    'groom-saloon': 'Groom Salon',
    'auto': 'Universal Face Swap'
  };
  
  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourcePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Automatically process the face swap when a file is selected
      handleSubmit(file);
    }
  };
  
  // Process the face swap
  const handleSubmit = async (file = sourceImage) => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('source', file);
    formData.append('category', detectedCategory);

    try {
      const response = await fetch('/process_universal', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setSuccessMessage('Face swap completed successfully!');
      } else {
        setError(data.message || 'Error processing face swap');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error processing face swap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Group results by category for display
  const groupedResults = results.reduce((groups, item) => {
    const key = item.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
  
  return (
    <div className="universal-swap-page" style={{ marginTop: '64px', position: 'relative' }}>
      <div className="universal-swap-container container">
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="text-center">{categoryLabels[category] || 'Universal Face Swap'}</h4>
            <p className="text-center text-muted smaller-text mb-4">
              Simply upload your photo and see yourself in various styles
            </p>
          </div>
        </div>
        
        <div className="row mb-4 justify-content-center">
          <div className="col-md-6 col-lg-4 text-center">
            <div className="upload-area mb-3" onClick={triggerFileInput}>
              {sourcePreview ? (
                <img 
                  src={sourcePreview} 
                  alt="Your uploaded face" 
                  className="img-fluid mb-2 source-preview" 
                  style={{ maxHeight: '250px', cursor: 'pointer' }}
                />
              ) : (
                <div className="upload-placeholder" style={{ cursor: 'pointer' }}>
                  <i className="bi bi-cloud-arrow-up fs-1"></i>
                  <p>Click to upload your photo</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*" 
                className="d-none" 
              />
            </div>
            
            <button
              className="btn btn-primary"
              onClick={() => sourceImage && handleSubmit()}
              disabled={!sourceImage || isLoading}
            >
              {isLoading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </span>
              ) : (
                'Try with new photo'
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}
        
        {Object.keys(groupedResults).length > 0 && (
          <div className="results-container">
            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="category-results mb-4">
                <h5 className="category-title">{category}</h5>
                <div className="row">
                  {items.map((result, index) => (
                    <div key={index} className="col-md-4 col-sm-6 mb-3">
                      <div className="result-card">
                        <img 
                          src={result.result_url} 
                          alt={`Result ${index + 1}`} 
                          className="img-fluid rounded swap-result" 
                          style={{ width: '100%', height: '350px', objectFit: 'cover', objectPosition: 'top' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalSwapPage;