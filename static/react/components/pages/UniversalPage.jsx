import React, { useState, useRef } from 'react';

const UniversalPage = () => {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enhance, setEnhance] = useState(false);
  const [enhanceMethod, setEnhanceMethod] = useState('auto');
  const [detectedCategory, setDetectedCategory] = useState('auto');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  
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
  const handleSubmit = (file) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSuccessMessage('');
    
    const formData = new FormData();
    formData.append('source', file || sourceImage);
    formData.append('category', 'auto');
    formData.append('enhance', enhance);
    formData.append('enhance_method', enhanceMethod);
    
    fetch('/universal-face-swap', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      setIsLoading(false);
      if (data.success) {
        setResults(data.results);
        setDetectedCategory(data.detected_category);
        setSuccessMessage(`Generated ${data.count} face swap images successfully!`);
      } else {
        setError(data.message || 'Error processing face swap');
      }
    })
    .catch(err => {
      setIsLoading(false);
      setError('Network error: ' + err.message);
      console.error('Error:', err);
    });
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
    <div className="universal-swap-container container">
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="text-center">Universal Face Swap</h4>
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
              <div className="upload-placeholder" style={{ 
                cursor: 'pointer',
                border: '2px dashed #5c2a91',
                borderRadius: '8px',
                padding: '40px 20px',
                backgroundColor: 'rgba(92, 42, 145, 0.05)'
              }}>
                <i className="fas fa-cloud-upload-alt fs-1 mb-3" style={{ color: '#5c2a91' }}></i>
                <p className="mb-0">Click to upload your photo</p>
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
          
          <div className="form-check mb-2 text-start">
            <input
              className="form-check-input"
              type="checkbox"
              id="enhanceCheck"
              checked={enhance}
              onChange={(e) => setEnhance(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="enhanceCheck">
              Enhance face quality
            </label>
          </div>
          
          {enhance && (
            <div className="mb-3">
              <select 
                className="form-select"
                value={enhanceMethod}
                onChange={(e) => setEnhanceMethod(e.target.value)}
              >
                <option value="auto">Auto enhancement</option>
                <option value="gfpgan">GFPGAN (better for details)</option>
                <option value="codeformer">CodeFormer (smoother results)</option>
              </select>
            </div>
          )}
          
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
                  <div key={index} className="col-md-3 col-sm-6 mb-3">
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
  );
};

export default UniversalPage;