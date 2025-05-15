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
    if (category) {
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      if (subcategory && subcategory.items) {
        setItems(subcategory.items);
        
        // Enable item dropdown
        document.getElementById('itemSelect').disabled = false;
        
        // Reset item selection
        setSelectedItem('');
      }
    }
  };
  
  // Handle item change
  const handleItemChange = (e) => {
    setSelectedItem(e.target.value);
    
    // Enable view templates button if source file is uploaded
    if (sourceFile) {
      document.getElementById('viewTemplatesBtn').disabled = false;
    }
  };
  
  // Handle view templates button click
  const handleViewTemplates = () => {
    if (!selectedCategory || !selectedSubcategory || !selectedItem) {
      setError('Please select all category options first');
      return;
    }
    
    setLoading(true);
    setTemplates([]);
    setError(null);
    setShowTemplates(true);
    setShowResults(false);
    
    // Find category, subcategory and item details for API request
    const category = categories.find(cat => cat.id === selectedCategory);
    const subcategory = category.subcategories.find(sub => sub.id === selectedSubcategory);
    const item = subcategory.items.find(i => i.id === selectedItem);
    
    // Construct API URL
    const url = `/api/templates?category_type=${category.key}&subcategory=${subcategory.key}&item_category=${item.key}`;
    
    console.log("Fetching templates with URL:", url);
    
    fetch(url)
      .then(response => {
        console.log("Got response with status:", response.status);
        return response.json();
      })
      .then(data => {
        console.log("Received data:", data);
        setLoading(false);
        if (data.templates && data.templates.length > 0) {
          console.log("Setting templates with count:", data.templates.length);
          setTemplates(data.templates);
        } else if (data.success === true && (!data.templates || data.templates.length === 0)) {
          setError('No templates found for the selected category');
        } else {
          setError(data.error || 'Error loading templates');
        }
      })
      .catch(error => {
        setLoading(false);
        setError('Error loading templates: ' + error.message);
        console.error('Error fetching templates:', error);
      });
  };
  
  // Handle template selection
  const handleTemplateSelection = (template) => {
    // Toggle selection
    if (selectedTemplates.some(t => t.path === template.path)) {
      setSelectedTemplates(selectedTemplates.filter(t => t.path !== template.path));
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
    }
    
    // Enable process button if at least one template is selected
    const processBtn = document.getElementById('processTemplatesBtn');
    if (processBtn) {
      if (selectedTemplates.length > 0 || !selectedTemplates.some(t => t.path === template.path)) {
        processBtn.disabled = false;
      } else if (selectedTemplates.length === 1 && selectedTemplates[0].path === template.path) {
        processBtn.disabled = true;
      }
    }
  };
  
  
  // Handle process button click
  const handleProcessTemplates = () => {
    if (!sourceFile || selectedTemplates.length === 0) {
      setError('Please upload a photo and select at least one template');
      return;
    }
    
    setProcessingResults(true);
    setResults([]);
    setError(null);
    
    console.log('Selected templates for processing:', selectedTemplates);
    
    const formData = new FormData();
    formData.append('source', sourceFile);
    formData.append('enhance', enhance);
    formData.append('enhance_method', enhanceMethod);
    
    // Add selected templates - using templates[] format which the backend expects
    selectedTemplates.forEach((template) => {
      console.log('Adding template path:', template.path);
      formData.append('templates[]', template.path);
    });
    
    // Log the form data being sent
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    fetch('/multi_face_swap', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Process response:', data);
        setProcessingResults(false);
        if (data.success) {
          // Use the URL directly from the backend response
          const formattedResults = data.results.map(result => ({
            ...result,
            // Ensure URL exists
            url: result.url || (result.result_path.startsWith('/') ? result.result_path : '/' + result.result_path)
          }));
          
          console.log('Formatted results:', formattedResults);
          setResults(formattedResults);
          setShowResults(true);
          setShowTemplates(false);
        } else {
          setError(data.error || data.message || 'Error processing face swap');
          console.error('Error from server:', data.error || data.message);
        }
      })
      .catch(error => {
        setProcessingResults(false);
        setError('Network error: ' + error.message);
        console.error('Error:', error);
      });
  };
  
  // Handle back to templates button
  const handleBackToTemplates = () => {
    setShowResults(false);
    setShowTemplates(true);
  };
  
  // Handle image viewer functions
  const openImageViewer = (images, startIndex = 0) => {
    setViewerImages(images);
    setCurrentImageIndex(startIndex);
    setZoomLevel(1);
    
    // Open modal using Bootstrap
    const modal = new window.bootstrap.Modal(document.getElementById('imageViewerModal'));
    modal.show();
    
    // Update navigation info if element exists
    const navInfoEl = document.getElementById('imageNavInfo');
    if (navInfoEl) {
      navInfoEl.textContent = `Image ${startIndex + 1} of ${images.length}`;
    }
  };
  
  // Function to open a single template in the viewer
  const openTemplateInViewer = (template) => {
    // If template is an object with url, use that, otherwise assume it's a URL string
    const templateUrl = typeof template === 'object' ? template.url : template;
    openImageViewer([templateUrl], 0);
  };
  
  const handlePrevImage = () => {
    const newIndex = (currentImageIndex - 1 + viewerImages.length) % viewerImages.length;
    setCurrentImageIndex(newIndex);
    setZoomLevel(1);
    
    // Update navigation info if element exists
    const navInfoEl = document.getElementById('imageNavInfo');
    if (navInfoEl) {
      navInfoEl.textContent = `Image ${newIndex + 1} of ${viewerImages.length}`;
    }
  };
  
  const handleNextImage = () => {
    const newIndex = (currentImageIndex + 1) % viewerImages.length;
    setCurrentImageIndex(newIndex);
    setZoomLevel(1);
    
    // Update navigation info if element exists
    const navInfoEl = document.getElementById('imageNavInfo');
    if (navInfoEl) {
      navInfoEl.textContent = `Image ${newIndex + 1} of ${viewerImages.length}`;
    }
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  // Set up event listeners for modal after component mounts
  useEffect(() => {
    // Set up event listeners once the component mounts
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    
    if (prevImageBtn) prevImageBtn.addEventListener('click', handlePrevImage);
    if (nextImageBtn) nextImageBtn.addEventListener('click', handleNextImage);
    if (zoomInBtn) zoomInBtn.addEventListener('click', handleZoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', handleZoomOut);
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', handleResetZoom);
    
    // Clean up event listeners when component unmounts
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
      {/* Image Viewer Modal with Pure Black Glass Effect and No Header */}
      <div className="modal fade" id="imageViewerModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen modal-dialog-centered p-2" style={{ maxWidth: '98vw', maxHeight: '98vh' }}>
          <div className="modal-content bg-black" style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: 'none', borderRadius: 0, backgroundColor: 'rgba(0,0,0,0.9)' }}>
            {/* Close button */}
            <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3 z-3" data-bs-dismiss="modal" aria-label="Close"></button>
            
            {/* Navigation Info */}
            <span className="text-white-50 position-absolute top-0 start-50 translate-middle-x mt-3 z-3" id="imageNavInfo">Image 1 of 1</span>
            
            <div className="modal-body p-0 position-relative d-flex align-items-center justify-content-center" style={{ minHeight: '95vh' }}>
              {/* Left Navigation Button */}
              <button id="prevImageBtn" className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y btn btn-dark text-white rounded-circle p-3 mx-4" style={{ zIndex: 10, opacity: 0.8, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <i className="fas fa-chevron-left fa-2x"></i>
              </button>
              
              <div className="image-zoom-container d-flex align-items-center justify-content-center" style={{ height: '90vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img id="zoomImage" src={viewerImages[currentImageIndex] || ''} alt="Zoomed Image" style={{ maxHeight: '95%', maxWidth: '95%', position: 'relative', objectFit: 'contain', transform: `scale(${zoomLevel})` }} />
              </div>
              
              {/* Right Navigation Button */}
              <button id="nextImageBtn" className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y btn btn-dark text-white rounded-circle p-3 mx-4" style={{ zIndex: 10, opacity: 0.8, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <i className="fas fa-chevron-right fa-2x"></i>
              </button>
              
              {/* Controls Bar */}
              <div className="position-absolute bottom-0 start-0 end-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
                <div className="btn-group" role="group">
                  <button id="zoomInBtn" className="btn btn-dark rounded-start border-secondary"><i className="fas fa-search-plus"></i></button>
                  <button id="zoomOutBtn" className="btn btn-dark border-secondary"><i className="fas fa-search-minus"></i></button>
                  <button id="resetZoomBtn" className="btn btn-dark rounded-end border-secondary"><i className="fas fa-sync-alt"></i></button>
                </div>
                
                <a id="downloadImageBtn" href="#" download className="btn btn-primary">
                  <i className="fas fa-download"></i> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo-container">
            <h1 className="logo-text brand-name">Face Swap App</h1>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="main-container">
          <div className="content-container">
            {/* Combined Upload and Options Card */}
            <div className="card mb-3 bg-black text-light">
              <div className="card-body pt-3">
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
                          <img id="sourcePreview" className="source-preview" src={sourcePreview} style={{ maxHeight: '100px', margin: '0 auto', objectFit: 'contain' }} />
                          <div className="position-absolute top-0 end-0">
                            <button 
                              type="button" 
                              id="changePhotoBtn" 
                              className="btn btn-sm btn-light rounded-circle" 
                              style={{ width: '24px', height: '24px', padding: 0, fontSize: '12px' }}
                              onClick={() => {
                                document.getElementById('previewContainer').style.display = 'none';
                                document.getElementById('uploadArea').style.display = 'flex';
                                document.getElementById('optionsInfo').innerHTML = '<p class="mb-1"><i class="fas fa-info-circle me-1"></i> Upload your photo first, then select category options</p>';
                              }}
                            >
                              <i className="fas fa-redo"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Dropdowns */}
                  <div className="col-md-8">
                    <div className="row g-2">
                      {/* Category Dropdown */}
                      <div className="col-md-4 mb-2">
                        <label htmlFor="categorySelect" className="form-label small">Category</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="categorySelect"
                          value={selectedCategory}
                          onChange={handleCategoryChange}
                        >
                          <option value="" disabled>Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Subcategory Dropdown */}
                      <div className="col-md-4 mb-2">
                        <label htmlFor="subcategorySelect" className="form-label small">Subcategory</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="subcategorySelect" 
                          disabled={!selectedCategory}
                          value={selectedSubcategory}
                          onChange={handleSubcategoryChange}
                        >
                          <option value="" disabled>Select Subcategory</option>
                          {subcategories.map(subcategory => (
                            <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Item Dropdown */}
                      <div className="col-md-4 mb-2">
                        <label htmlFor="itemSelect" className="form-label small">Style/Item</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="itemSelect" 
                          disabled={!selectedSubcategory}
                          value={selectedItem}
                          onChange={handleItemChange}
                        >
                          <option value="" disabled>Select Style/Item</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Options info message */}
                    <div id="optionsInfo" className="mt-2 small">
                      <p className="mb-1"><i className="fas fa-info-circle me-1"></i> Upload your photo first, then select category options</p>
                    </div>
                    
                    {/* View templates button */}
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <button 
                        className="btn btn-sm btn-primary" 
                        id="viewTemplatesBtn"
                        disabled={!sourceFile || !selectedCategory || !selectedSubcategory || !selectedItem}
                        onClick={handleViewTemplates}
                      >
                        <i className="fas fa-images me-1"></i> View Templates
                      </button>
                      
                      {/* Enhancement options */}
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
            </div>
            
            {/* Error message */}
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle me-2"></i> {error}
              </div>
            )}
            
            {/* Templates Display Card (only visible after selecting options) */}
            {showTemplates && (
              <div className="card bg-black text-light">
                <div className="card-body pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Available Templates</h6>
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
                          disabled={selectedTemplates.length === 0}
                          onClick={handleProcessTemplates}
                        >
                          <i className="fas fa-magic me-1"></i> Process Selected
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
                              <img 
                                src={template.url.startsWith('/') ? template.url : '/' + template.url} 
                                className="template-preview"
                                alt={`Template ${index + 1}`}
                                style={{
                                  height: '200px',
                                  objectFit: 'cover',
                                  objectPosition: 'center 30%',
                                  borderRadius: '6px 6px 0 0',
                                  transition: 'transform 0.2s ease',
                                  width: '100%'
                                }}
                                onError={(e) => {
                                  console.log("Image failed to load:", template.url);
                                  e.target.src = '/static/placeholder.png';
                                  e.target.style.objectFit = 'contain';
                                }}
                              />
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <input 
                                      className="form-check-input me-2" 
                                      type="checkbox" 
                                      checked={selectedTemplates.some(t => t.path === template.path)}
                                      onChange={() => handleTemplateSelection(template)}
                                      onClick={(e) => e.stopPropagation()}
                                      id={`template-check-${index}`} 
                                    />
                                  </div>
                                  <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openTemplateInViewer(template);
                                    }}
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Results Display Card (only visible after processing) */}
            {showResults && (
              <div className="card bg-black text-light">
                <div className="card-body pt-3">
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
                                objectPosition: 'center 30%',
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