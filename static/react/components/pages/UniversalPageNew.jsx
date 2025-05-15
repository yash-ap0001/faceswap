import React, { useState, useEffect, useRef } from 'react';
import './UniversalPage.css';

/**
 * UniversalPageNew - React version of the universal_page.html template
 * This component maintains the exact same structure and styling as the HTML template
 */
const UniversalPageNew = () => {
  // State for form elements
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for file upload
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // State for template selection
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [processingResults, setProcessingResults] = useState(false);
  
  // State for image viewer modal
  const [viewerImages, setViewerImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // State for enhancement options
  const [enhance, setEnhance] = useState(false);
  const [enhanceMethod, setEnhanceMethod] = useState('auto');
  
  // Fetch categories when component mounts
  useEffect(() => {
    fetch('/api/categories')
      .then(response => response.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          console.error('No categories found');
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      });
  }, []);
  
  // Handle file upload
  const handleFileUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSourceFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourcePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Show preview container
      document.getElementById('previewContainer').style.display = 'block';
      document.getElementById('uploadArea').style.display = 'none';
      document.getElementById('optionsInfo').innerHTML = '<p class="mb-1 text-success"><i class="fas fa-check-circle me-1"></i> Photo uploaded! Now select category options below</p>';
    }
  };
  
  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    
    // Find the selected category
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.subcategories) {
      setSubcategories(category.subcategories);
      
      // Enable subcategory dropdown
      document.getElementById('subcategorySelect').disabled = false;
      
      // Reset subcategory and item selection
      setSelectedSubcategory('');
      setSelectedItem('');
      setItems([]);
      document.getElementById('itemSelect').disabled = true;
    }
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
    
    // Find the selected subcategory
    const category = categories.find(cat => cat.id === selectedCategory);
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    
    if (subcategory && subcategory.items) {
      setItems(subcategory.items);
      
      // Enable item dropdown
      document.getElementById('itemSelect').disabled = false;
      
      // Reset item selection
      setSelectedItem('');
    }
  };
  
  // Handle item change
  const handleItemChange = (e) => {
    const itemId = e.target.value;
    setSelectedItem(itemId);
  };
  
  // Reset upload
  const handleResetUpload = () => {
    setSourceFile(null);
    setSourcePreview(null);
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('optionsInfo').innerHTML = '<p class="small mb-1">Upload your photo first, then select category options</p>';
    document.getElementById('fileInput').value = '';
  };
  
  // Handle view templates button
  const handleViewTemplates = () => {
    if (!sourceFile || !selectedItem) {
      return;
    }
    
    setLoading(true);
    setTemplates([]);
    setError(null);
    
    // Find the category, subcategory, and item names for the template query
    const category = categories.find(cat => cat.id === selectedCategory);
    const subcategory = category.subcategories.find(sub => sub.id === selectedSubcategory);
    const item = subcategory.items.find(i => i.id === selectedItem);
    
    // Construct the query parameters
    const params = {
      category_type: category.id, 
      subcategory: subcategory.id, 
      item_category: item.id
    };
    
    const queryString = new URLSearchParams(params).toString();
    
    // Fetch templates
    fetch(`/get_templates?${queryString}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        return response.json();
      })
      .then(data => {
        console.log("Received data:", data);
        setLoading(false);
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          setShowTemplates(true);
        } else {
          setError('No templates found for the selected options.');
        }
      })
      .catch(error => {
        console.error('Error fetching templates:', error);
        setLoading(false);
        setError(`Failed to fetch templates: ${error.message}`);
      });
  };
  
  // Handle template selection
  const handleTemplateSelection = (template) => {
    // Check if the template is already selected
    const isSelected = selectedTemplates.some(t => t.path === template.path);
    
    if (isSelected) {
      // Remove from selection
      setSelectedTemplates(selectedTemplates.filter(t => t.path !== template.path));
    } else {
      // Add to selection
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };
  
  // Handle process templates button
  const handleProcessTemplates = () => {
    if (selectedTemplates.length === 0 || !sourceFile) {
      return;
    }
    
    setProcessingResults(true);
    setResults([]);
    setError(null);
    
    // Create form data for the request
    const formData = new FormData();
    formData.append('source', sourceFile);
    
    // Add selected templates
    selectedTemplates.forEach((template, index) => {
      formData.append(`template_${index}`, template.path);
    });
    
    // Add template count
    formData.append('template_count', selectedTemplates.length);
    
    // Add enhancement options
    if (enhance) {
      formData.append('enhance', 'true');
      formData.append('enhance_method', enhanceMethod);
    }
    
    // Send the request
    fetch('/bridal_swap_multi', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to process templates');
        }
        return response.json();
      })
      .then(data => {
        console.log('Process response:', data);
        setProcessingResults(false);
        if (data.success) {
          setResults(data.results.map(result => ({
            url: result.result_url,
            template: result.template_path
          })));
          setShowTemplates(false);
          setShowResults(true);
        } else {
          setError(data.error || 'Failed to process templates');
        }
      })
      .catch(error => {
        console.error('Error processing templates:', error);
        setProcessingResults(false);
        setError(`Failed to process templates: ${error.message}`);
      });
  };
  
  // Handle back to templates button
  const handleBackToTemplates = () => {
    setShowResults(false);
    setShowTemplates(true);
  };
  
  // Image viewer functions
  const openImageViewer = (images, index = 0) => {
    setViewerImages(images);
    setCurrentImageIndex(index);
    setZoomLevel(1);
    
    // Show the modal using Bootstrap API
    const modal = new window.bootstrap.Modal(document.getElementById('imageViewerModal'));
    modal.show();
    
    // Update navigation info if element exists
    const navInfoElement = document.getElementById('imageNavInfo');
    if (navInfoElement) {
      navInfoElement.textContent = `Image ${index + 1} of ${images.length}`;
    }
  };
  
  const handlePrevImage = () => {
    const newIndex = (currentImageIndex - 1 + viewerImages.length) % viewerImages.length;
    setCurrentImageIndex(newIndex);
    setZoomLevel(1);
    
    // Update navigation info
    const navInfoElement = document.getElementById('imageNavInfo');
    if (navInfoElement) {
      navInfoElement.textContent = `Image ${newIndex + 1} of ${viewerImages.length}`;
    }
  };
  
  const handleNextImage = () => {
    const newIndex = (currentImageIndex + 1) % viewerImages.length;
    setCurrentImageIndex(newIndex);
    setZoomLevel(1);
    
    // Update navigation info
    const navInfoElement = document.getElementById('imageNavInfo');
    if (navInfoElement) {
      navInfoElement.textContent = `Image ${newIndex + 1} of ${viewerImages.length}`;
    }
  };
  
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.2, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  // Effect for handling navigation button clicks
  useEffect(() => {
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    
    if (prevImageBtn) prevImageBtn.addEventListener('click', handlePrevImage);
    if (nextImageBtn) nextImageBtn.addEventListener('click', handleNextImage);
    if (zoomInBtn) zoomInBtn.addEventListener('click', handleZoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', handleZoomOut);
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', handleResetZoom);
    
    return () => {
      if (prevImageBtn) prevImageBtn.removeEventListener('click', handlePrevImage);
      if (nextImageBtn) nextImageBtn.removeEventListener('click', handleNextImage);
      if (zoomInBtn) zoomInBtn.removeEventListener('click', handleZoomIn);
      if (zoomOutBtn) zoomOutBtn.removeEventListener('click', handleZoomOut);
      if (resetZoomBtn) resetZoomBtn.removeEventListener('click', handleResetZoom);
    };
  }, [viewerImages, currentImageIndex]);
  
  // Update download button URL when current image changes
  useEffect(() => {
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    if (downloadImageBtn && viewerImages.length > 0) {
      downloadImageBtn.href = viewerImages[currentImageIndex];
      const fileName = viewerImages[currentImageIndex].split('/').pop();
      downloadImageBtn.setAttribute('download', fileName);
    }
  }, [viewerImages, currentImageIndex]);
  
  // Update zoom level on image when it changes
  useEffect(() => {
    const zoomImage = document.getElementById('zoomImage');
    if (zoomImage) {
      zoomImage.style.transform = `scale(${zoomLevel})`;
    }
  }, [zoomLevel]);
  
  return (
    <>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo-container">
            {/* Logo/branding removed as requested */}
          </div>
        </header>
        
        {/* Main Content */}
        <div className="main-container">
          <div className="content-container">
            {/* Main upload and options section (removed card) */}
            <div className="mb-3 bg-black text-light py-3 px-3">
              <div className="row">
                {/* Left Column - Upload */}
                <div className="col-md-4">
                  <div className="d-flex flex-column h-100">
                    <div 
                      className="upload-area mb-2" 
                      id="uploadArea" 
                      style={{ minHeight: '100px', padding: '10px', position: 'relative' }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <i className="fas fa-cloud-upload-alt fa-lg text-light-purple"></i>
                      <p className="mt-1 mb-1 small">Drop photo or click to browse</p>
                      <input 
                        type="file" 
                        id="fileInput" 
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </div>
                    <div className="text-center position-relative">
                      <div id="previewContainer" style={{ display: 'none' }}>
                        <img 
                          id="imagePreview" 
                          src={sourcePreview} 
                          alt="Preview" 
                          className="img-fluid" 
                          style={{ maxHeight: '180px', objectFit: 'contain' }}
                        />
                        <button 
                          type="button" 
                          className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1" 
                          onClick={handleResetUpload}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                    <div id="optionsInfo" className="mt-1">
                      <p className="small mb-1">Upload your photo first, then select category options</p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Selection Options */}
                <div className="col-md-8">
                  <div className="row align-items-center">
                    <div className="col-md-4 mb-2">
                      <label htmlFor="categorySelect" className="form-label small mb-1">Category</label>
                      <select 
                        id="categorySelect" 
                        className="form-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <label htmlFor="subcategorySelect" className="form-label small mb-1">Subcategory</label>
                      <select 
                        id="subcategorySelect" 
                        className="form-select"
                        value={selectedSubcategory}
                        onChange={handleSubcategoryChange}
                        disabled={!selectedCategory}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <label htmlFor="itemSelect" className="form-label small mb-1">Style/Item</label>
                      <select 
                        id="itemSelect" 
                        className="form-select"
                        value={selectedItem}
                        onChange={handleItemChange}
                        disabled={!selectedSubcategory}
                      >
                        <option value="">Select Style/Item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div id="templateInfo" className="small text-muted">
                      {showTemplates && templates.length > 0 && (
                        <span>After selecting templates, click "Process Selected" to start face swap</span>
                      )}
                    </div>
                    <div className="d-flex align-items-center">
                      <button 
                        id="viewTemplatesBtn"
                        className="btn btn-sm btn-primary"
                        onClick={handleViewTemplates}
                        disabled={!selectedItem || !sourceFile}
                      >
                        <i className="fas fa-images me-1"></i> View Templates
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhancement options */}
                  <div className="d-flex justify-content-end align-items-center mt-2">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="enhanceSwitch" 
                        checked={enhance}
                        onChange={(e) => setEnhance(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="enhanceSwitch">Auto Enhance</label>
                    </div>
                  </div>
                  
                  {/* Enhancement method (visible when enhance is checked) */}
                  {enhance && (
                    <div className="mt-2">
                      <select 
                        className="form-select form-select-sm" 
                        value={enhanceMethod}
                        onChange={(e) => setEnhanceMethod(e.target.value)}
                      >
                        <option value="auto">Auto detection</option>
                        <option value="gfpgan">GFPGAN (better details)</option>
                        <option value="codeformer">CodeFormer (smoother)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle me-2"></i> {error}
              </div>
            )}
            
            {/* Templates Display Section (only visible after selecting options) */}
            {showTemplates && (
              <div className="bg-black text-light p-3">
                <div className="d-flex justify-content-end align-items-center mb-3">
                  <span className="badge bg-primary">{templates.length} templates</span>
                </div>
                {loading ? (
                  <div className="text-center py-5" id="loading">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading templates...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-secondary me-2">Selected: {selectedTemplates.length}</span>
                        <button 
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => setSelectedTemplates([])}
                          disabled={selectedTemplates.length === 0}
                        >
                          Clear Selection
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedTemplates(templates)}
                        >
                          Select All
                        </button>
                      </div>
                      <button 
                        id="processTemplatesBtn"
                        className="btn btn-primary"
                        disabled={selectedTemplates.length === 0 || processingResults}
                        onClick={handleProcessTemplates}
                      >
                        {processingResults ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-magic me-1"></i> Process Selected
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="row" id="templatesContainer">
                      {templates.map((template, index) => (
                        <div className="col-lg-3 col-md-4 col-sm-6 mb-3" key={index}>
                          <div 
                            className={`card template-card ${selectedTemplates.some(t => t.path === template.path) ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTemplateSelection(template)}
                          >
                            <div className="position-relative">
                              {/* Controls overlay on top of image */}
                              <div className="position-absolute top-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center" 
                                   style={{ background: 'rgba(0,0,0,0.5)', zIndex: 2, borderRadius: '6px' }}>
                                <div className="d-flex align-items-center">
                                  <input 
                                    className="form-check-input me-2" 
                                    type="checkbox" 
                                    checked={selectedTemplates.some(t => t.path === template.path)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleTemplateSelection(template);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <button
                                  className="btn btn-sm btn-dark p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openImageViewer([template.url], 0);
                                  }}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                              
                              <img 
                                src={template.url} 
                                className="card-img-top template-image" 
                                alt={`Template ${index + 1}`}
                                style={{
                                  height: '180px',
                                  objectFit: 'cover',
                                  objectPosition: 'center 20%', /* Adjusted to better center on faces */
                                  borderRadius: '6px'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Results Display Section (only visible after processing) */}
            {showResults && (
              <div className="bg-black text-light p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Results</h6>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleBackToTemplates}
                  >
                    <i className="fas fa-arrow-left me-1"></i> Back to Templates
                  </button>
                </div>
                {processingResults ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Processing...</span>
                    </div>
                    <p className="mt-3">Processing your templates. This may take a moment...</p>
                  </div>
                ) : (
                  <div className="row" id="resultsContainer">
                    {results.map((result, index) => (
                      <div className="col-lg-3 col-md-4 col-sm-6 mb-3" key={index}>
                        <div className="card result-card">
                          <img 
                            src={result.url} 
                            className="result-image"
                            alt={`Result ${index + 1}`}
                            style={{
                              height: '200px',
                              objectFit: 'cover',
                              objectPosition: 'center 20%', /* Adjusted to better center on faces */
                              borderRadius: '6px 6px 0 0',
                              width: '100%',
                              cursor: 'pointer'
                            }}
                            onClick={() => openImageViewer(results.map(r => r.url), index)}
                          />
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="badge bg-success">Result {index + 1}</span>
                              <a 
                                href={result.url} 
                                download 
                                className="btn btn-sm btn-outline-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="fas fa-download"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Image Viewer Modal with Pure Black Background */}
      <div className="modal fade" id="imageViewerModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen modal-dialog-centered p-2" style={{ maxWidth: '98vw', maxHeight: '98vh' }}>
          <div className="modal-content" style={{ backgroundColor: '#000000', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: 'none', borderRadius: 0 }}>
            <div className="modal-body d-flex flex-column justify-content-center align-items-center p-0 position-relative">
              {/* Close button */}
              <button 
                type="button" 
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3 z-3" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
              
              {/* Navigation Info */}
              <span className="text-white-50 position-absolute top-0 start-50 translate-middle-x mt-3 z-3" id="imageNavInfo">
                Image 1 of 1
              </span>
              
              {viewerImages.length > 0 && (
                <div 
                  className="modal-body p-0 position-relative d-flex align-items-center justify-content-center"
                  style={{ minHeight: '95vh' }}
                >
                  {/* Left Navigation Button */}
                  {viewerImages.length > 1 && (
                    <button 
                      id="prevImageBtn"
                      className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y btn btn-dark text-white rounded-circle p-3 mx-4"
                      style={{ zIndex: 10, opacity: 0.8, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.7)' }}
                      onClick={handlePrevImage}
                    >
                      <i className="fas fa-chevron-left fa-2x"></i>
                    </button>
                  )}
                  
                  {/* Image container with zoom */}
                  <div 
                    className="image-container d-flex justify-content-center align-items-center"
                    style={{ 
                      height: '90vh', 
                      width: '100%',
                      cursor: 'move',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      id="zoomImage" 
                      src={viewerImages[currentImageIndex]} 
                      alt={`Viewer image ${currentImageIndex + 1}`}
                      style={{ 
                        maxHeight: '90vh', 
                        maxWidth: '100%', 
                        objectFit: 'contain',
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  </div>
                  
                  {/* Right Navigation Button */}
                  {viewerImages.length > 1 && (
                    <button 
                      id="nextImageBtn"
                      className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y btn btn-dark text-white rounded-circle p-3 mx-4"
                      style={{ zIndex: 10, opacity: 0.8, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.7)' }}
                      onClick={handleNextImage}
                    >
                      <i className="fas fa-chevron-right fa-2x"></i>
                    </button>
                  )}
                </div>
              )}
              
              {/* Controls - Zoom and Download */}
              <div className="controls position-absolute bottom-0 w-100 p-3 d-flex justify-content-center">
                <div className="bg-dark bg-opacity-75 rounded-pill px-4 py-2 d-flex gap-3">
                  <button 
                    id="zoomOutBtn"
                    className="btn btn-outline-light" 
                    onClick={handleZoomOut}
                  >
                    <i className="fas fa-search-minus"></i>
                  </button>
                  
                  <button 
                    id="resetZoomBtn"
                    className="btn btn-outline-light" 
                    onClick={handleResetZoom}
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                  
                  <button 
                    id="zoomInBtn"
                    className="btn btn-outline-light" 
                    onClick={handleZoomIn}
                  >
                    <i className="fas fa-search-plus"></i>
                  </button>
                  
                  <a 
                    id="downloadImageBtn"
                    className="btn btn-outline-light" 
                    href={viewerImages[currentImageIndex]} 
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-download"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversalPageNew;