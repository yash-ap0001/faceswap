import React, { useState, useEffect } from 'react';

/**
 * BridalSwapPage component for face swapping functionality
 */
const BridalSwapPage = () => {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [ceremonyType, setCeremonyType] = useState('haldi');
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhanceEnabled, setEnhanceEnabled] = useState(true);
  const [enhanceMethod, setEnhanceMethod] = useState('auto');
  const [results, setResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch templates when ceremony type changes
  useEffect(() => {
    fetchTemplates(ceremonyType);
  }, [ceremonyType]);

  // Fetch templates for a specific ceremony
  const fetchTemplates = async (ceremony) => {
    setIsLoading(true);
    try {
      try {
        // First try the primary API endpoint
        const response = await fetch(
          `/get_templates?ceremony_type=${ceremony}&category_type=bride&subcategory=bridal&item_category=${ceremony}`
        );
        const data = await response.json();
        
        if (data.success && data.templates && data.templates.length > 0) {
          console.log(`Received template data for ${ceremony}:`, data);
          setTemplates(data.templates);
          setIsLoading(false);
          return;
        } else {
          console.error('Error in template data structure:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching templates from primary endpoint:', error);
      }
      
      // If primary endpoint fails, try the fallback API endpoint
      try {
        const fallbackResponse = await fetch(
          `/api/fallback/templates?ceremony_type=${ceremony}&category_type=bride&subcategory=bridal&item_category=${ceremony}`
        );
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.success && fallbackData.templates && fallbackData.templates.length > 0) {
          console.log(`Received fallback template data for ${ceremony}:`, fallbackData);
          setTemplates(fallbackData.templates);
          setIsLoading(false);
          return;
        } else {
          console.error('Error in fallback template data structure:', fallbackData.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching templates from fallback endpoint:', error);
      }
      
      // If both endpoints fail, create static fallback templates
      const staticFallbackTemplates = Array.from({ length: 6 }, (_, i) => ({
        id: `${ceremony}_${i + 1}`,
        path: `static/images/templates/${ceremony}/${i + 1}.jpg`,
        url: `/static/images/templates/${ceremony}/${i + 1}.jpg`,
        category_type: 'bride',
        subcategory: 'bridal',
        item_category: ceremony,
        template_type: 'fallback'
      }));
      
      console.log(`Using static fallback templates for ${ceremony}`);
      setTemplates(staticFallbackTemplates);
    } catch (error) {
      console.error('Error in template handling:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle source image upload
  const handleSourceImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSourcePreview(e.target.result);
      setSourceImage(file);
    };
    reader.readAsDataURL(file);
  };

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      // When turning off multi-select, clear selected templates
      setSelectedTemplates([]);
    }
  };

  // Toggle template selection
  const toggleTemplateSelection = (template) => {
    if (isMultiSelectMode) {
      // In multi-select mode, toggle selection
      if (selectedTemplates.some(t => t.path === template.path)) {
        setSelectedTemplates(selectedTemplates.filter(t => t.path !== template.path));
      } else {
        setSelectedTemplates([...selectedTemplates, template]);
      }
    } else {
      // In single select mode, just process this template
      processTemplate(template);
    }
  };
  
  // Open image in modal
  const openImageModal = (result) => {
    setSelectedImage(result);
    setIsModalOpen(true);
    setZoomLevel(1); // Reset zoom level
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };
  
  // Navigate to next image
  const nextImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = results.findIndex(r => r.result_path === selectedImage.result_path);
    if (currentIndex < results.length - 1) {
      setSelectedImage(results[currentIndex + 1]);
      setZoomLevel(1); // Reset zoom level
    }
  };
  
  // Navigate to previous image
  const prevImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = results.findIndex(r => r.result_path === selectedImage.result_path);
    if (currentIndex > 0) {
      setSelectedImage(results[currentIndex - 1]);
      setZoomLevel(1); // Reset zoom level
    }
  };
  
  // Zoom in
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  // Zoom out
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'Escape':
          closeModal();
          break;
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedImage]);

  // Process a single template
  const processTemplate = async (template) => {
    if (!sourceImage) {
      alert('Please upload a source image first');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('source', sourceImage);
    formData.append('template_path', template.path);
    formData.append('enhance', enhanceEnabled ? 'true' : 'false');
    formData.append('enhance_method', enhanceMethod);

    try {
      const response = await fetch('/process_template', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      // Debug logging for response
      console.log('Process template response:', result);
      
      if (result.success) {
        const resultItem = {
          template_path: template.path,
          result_path: result.result_path,
          enhanced: result.enhanced,
          enhance_method: result.enhance_method
        };
        console.log('Setting result item:', resultItem);
        setResults([resultItem]);
      } else {
        alert(result.message || 'Error processing template');
      }
    } catch (error) {
      console.error('Error processing template:', error);
      alert('Error processing template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process multiple templates
  const processMultipleTemplates = async () => {
    if (!sourceImage) {
      alert('Please upload a source image first');
      return;
    }

    if (selectedTemplates.length === 0) {
      alert('Please select at least one template');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('source', sourceImage);
    
    selectedTemplates.forEach((template) => {
      formData.append(`templates[]`, template.path);
    });
    
    formData.append('enhance', enhanceEnabled ? 'true' : 'false');
    formData.append('enhance_method', enhanceMethod);

    try {
      const response = await fetch('/multi_face_swap', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      console.log("Multi-swap API response:", result);
      
      if (result.success && result.results && Array.isArray(result.results)) {
        setResults(result.results);
        setIsMultiSelectMode(false); // Switch back to single view mode after processing
      } else {
        alert(result.message || 'Error processing templates');
      }
    } catch (error) {
      console.error('Error processing templates:', error);
      alert('Error processing templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bridal-swap-page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="m-0">Create Your Bridal Look</h6>
        
        <div className="form-check form-switch ms-3">
          <input 
            className="form-check-input" 
            type="checkbox"
            id="multiSelectSwitch"
            checked={isMultiSelectMode}
            onChange={toggleMultiSelectMode}
          />
          <label className="form-check-label small" htmlFor="multiSelectSwitch">
            Multi-Select
          </label>
        </div>
      </div>
      
      <div className="row g-2">
        <div className="col-md-3">
          <div className="mb-3">
            <div className="d-flex mb-2 align-items-center">
              <small className="text-muted me-2">Your photo:</small>
              <input 
                type="file" 
                className="form-control form-control-sm" 
                accept="image/*"
                onChange={handleSourceImageChange}
              />
            </div>
            
            {sourcePreview && (
              <div className="source-preview">
                <img 
                  src={sourcePreview} 
                  className="img-fluid rounded shadow-sm" 
                  alt="Your Photo" 
                  style={{maxHeight: '180px'}}
                />
              </div>
            )}
              
            <div className="d-flex align-items-center mt-2">
              <div className="form-check form-switch me-3">
                <input 
                  className="form-check-input" 
                  type="checkbox"
                  id="enhanceSwitch"
                  checked={enhanceEnabled}
                  onChange={() => setEnhanceEnabled(!enhanceEnabled)}
                />
                <label className="form-check-label small" htmlFor="enhanceSwitch">
                  Enhance
                </label>
              </div>
              
              {enhanceEnabled && (
                <select 
                  className="form-select form-select-sm"
                  value={enhanceMethod}
                  onChange={(e) => setEnhanceMethod(e.target.value)}
                  style={{width: 'auto'}}
                >
                  <option value="auto">Auto</option>
                  <option value="gfpgan">GFPGAN</option>
                  <option value="codeformer">CodeFormer</option>
                </select>
              )}
            </div>
            
            {isMultiSelectMode && selectedTemplates.length > 0 && (
              <button 
                className="btn btn-primary btn-sm mt-3 w-100"
                onClick={processMultipleTemplates}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Process ${selectedTemplates.length} Templates`}
              </button>
            )}
          </div>
          
          {isMultiSelectMode && selectedTemplates.length > 0 && (
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <small className="text-muted me-2">Selected Templates ({selectedTemplates.length})</small>
              </div>
              <div className="row g-1">
                {selectedTemplates.map((template, index) => (
                  <div className="col-4" key={`selected-${template.id}`}>
                    <div className="position-relative mb-1">
                      <img 
                        src={template.url} 
                        className="img-fluid rounded shadow-sm" 
                        alt={`Template ${index + 1}`} 
                      />
                      <button 
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0"
                        style={{width: '18px', height: '18px', fontSize: '10px'}}
                        onClick={() => toggleTemplateSelection(template)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-9">
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <div className="btn-group btn-group-sm me-2" role="group">
                {['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'].map(ceremony => (
                  <button
                    key={ceremony}
                    type="button"
                    className={`btn ${ceremonyType === ceremony ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCeremonyType(ceremony)}
                  >
                    {ceremony.charAt(0).toUpperCase() + ceremony.slice(1)}
                  </button>
                ))}
              </div>
              
              {isLoading && (
                <div className="spinner-border spinner-border-sm text-primary ms-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
            
            <div className="row g-2">
              {templates.length > 0 ? (
                templates.map(template => (
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={template.id}>
                    <div 
                      className={`position-relative template-card ${selectedTemplates.some(t => t.path === template.path) ? 'selected' : ''}`}
                      onClick={() => toggleTemplateSelection(template)}
                    >
                      <img 
                        src={template.url} 
                        className="img-fluid rounded shadow-sm" 
                        alt={template.id} 
                      />
                      {isMultiSelectMode && (
                        <div className="position-absolute top-0 end-0 p-1">
                          <div className={`form-check ${selectedTemplates.some(t => t.path === template.path) ? 'checked' : ''}`}>
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={selectedTemplates.some(t => t.path === template.path)}
                              readOnly
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-2">
                  <small>No templates available for this ceremony type.</small>
                </div>
              )}
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="mt-3">
              <div className="d-flex align-items-center mb-2">
                <small className="text-muted me-2">Results</small>
              </div>
              <div className="row g-2">
                {results.map((result, index) => (
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={`result-${index}`}>
                    <div className="position-relative result-container">
                      <img 
                        src={`${result.result_path}?t=${Date.now()}`} 
                        className="img-fluid rounded shadow-sm result-image" 
                        alt={`Result ${index + 1}`} 
                        onClick={() => openImageModal(result)}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          console.error(`Failed to load image: ${result.result_path}`);
                          e.target.src = "/static/images/error-placeholder.jpg";
                        }}
                      />
                      <div className="overlay" onClick={() => openImageModal(result)}>
                        <div className="zoom-icon">
                          <i className="fas fa-search-plus"></i>
                        </div>
                      </div>
                      {result.enhanced && (
                        <span className="position-absolute top-0 start-0 badge bg-info m-1" style={{fontSize: '0.65rem'}}>
                          {result.enhance_method}
                        </span>
                      )}
                      <a 
                        href={`${result.result_path}?t=${Date.now()}`} 
                        className="btn btn-sm btn-primary position-absolute bottom-0 end-0 m-1 p-0"
                        style={{width: '24px', height: '24px', fontSize: '12px'}}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-download"></i>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .template-card {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 0.25rem;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .template-card img, .position-relative img, .result-image {
          object-fit: cover;
          width: 100%;
          height: 200px;
        }
        
        .result-container {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 0.25rem;
          position: relative;
        }
        
        .result-container .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .result-container:hover .overlay {
          opacity: 1;
        }
        
        .zoom-icon {
          color: white;
          font-size: 2rem;
        }

        @media (max-width: 576px) {
          .template-card, .template-card img, .position-relative img, .result-image, .result-container {
            height: 160px;
          }
          
          .col-6 {
            padding: 4px;
          }
          
          .btn-sm {
            width: 20px !important;
            height: 20px !important;
            font-size: 10px !important;
          }
        }
        
        .template-card:hover {
          transform: scale(1.02);
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
        }
        
        .template-card.selected {
          border: 2px solid #0d6efd;
        }
        
        .form-check.checked .form-check-input {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        /* Modal styles */
        .modal-backdrop {
          opacity: 0.85;
        }
        
        .modal-fullscreen {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        .modal-content {
          height: 100%;
          border: 0;
          border-radius: 0;
        }
      `}</style>
      
      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{display: 'block'}}>
          <div className="modal-backdrop fade show" style={{ 
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }} onClick={closeModal}></div>
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center p-2">
                <div>
                  <button className="btn btn-sm btn-dark me-2" onClick={prevImage} disabled={results.findIndex(r => r.result_path === selectedImage.result_path) === 0}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button className="btn btn-sm btn-dark" onClick={nextImage} disabled={results.findIndex(r => r.result_path === selectedImage.result_path) === results.length - 1}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                <div className="text-center text-white">
                  {results.findIndex(r => r.result_path === selectedImage.result_path) + 1} / {results.length}
                </div>
                <div>
                  <button className="btn btn-sm btn-dark me-2" onClick={zoomOut}>
                    <i className="fas fa-search-minus"></i>
                  </button>
                  <button className="btn btn-sm btn-dark me-2" onClick={zoomIn}>
                    <i className="fas fa-search-plus"></i>
                  </button>
                  <button className="btn btn-sm btn-dark" onClick={closeModal}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div className="modal-body d-flex justify-content-center align-items-center overflow-hidden">
                <div style={{ 
                  overflow: 'auto', 
                  height: '100%', 
                  width: '100%', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={`${selectedImage.result_path}?t=${Date.now()}`} 
                    className="img-fluid" 
                    alt="Result image"
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div className="position-absolute bottom-0 end-0 p-3">
                <div className="btn-group">
                  <button className="btn btn-sm btn-dark" onClick={zoomOut}>
                    <i className="fas fa-search-minus"></i>
                  </button>
                  <button className="btn btn-sm btn-dark" onClick={zoomIn}>
                    <i className="fas fa-search-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BridalSwapPage;