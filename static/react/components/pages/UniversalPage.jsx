import React, { useState, useRef, useEffect } from 'react';

const UniversalPage = () => {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [styles, setStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [enhance, setEnhance] = useState(false);
  const [enhanceMethod, setEnhanceMethod] = useState('auto');
  const fileInputRef = useRef(null);
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In a real app, this would be a fetch to the backend
        // For now, use hardcoded categories
        setCategories([
          { id: 'bride', name: 'Bride' },
          { id: 'groom', name: 'Groom' },
          { id: 'saloon', name: 'Saloon' }
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle category change
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setSelectedStyle('');
    setTemplates([]);
    
    // Set subcategories based on selected category
    if (category === 'bride') {
      setSubcategories([
        { id: 'bridal', name: 'Bridal Ceremonies' },
        { id: 'outfits', name: 'Outfits' },
        { id: 'jewelry', name: 'Jewelry' },
        { id: 'makeup', name: 'Makeup' }
      ]);
    } else if (category === 'groom') {
      setSubcategories([
        { id: 'traditional', name: 'Traditional Wear' },
        { id: 'modern', name: 'Modern Suits' },
        { id: 'accessories', name: 'Accessories' }
      ]);
    } else if (category === 'saloon') {
      setSubcategories([
        { id: 'bride-saloon', name: 'Bride Saloon' },
        { id: 'groom-saloon', name: 'Groom Saloon' }
      ]);
    } else {
      setSubcategories([]);
    }
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    setSelectedStyle('');
    setTemplates([]);
    
    // Set styles based on selected subcategory
    if (subcategory === 'bridal') {
      setStyles([
        { id: 'haldi', name: 'Haldi' },
        { id: 'mehendi', name: 'Mehendi' },
        { id: 'sangeeth', name: 'Sangeeth' },
        { id: 'wedding', name: 'Wedding' },
        { id: 'reception', name: 'Reception' }
      ]);
    } else if (subcategory === 'outfits') {
      setStyles([
        { id: 'casual', name: 'Casual' },
        { id: 'formal', name: 'Formal' },
        { id: 'party', name: 'Party' }
      ]);
    } else if (subcategory === 'traditional') {
      setStyles([
        { id: 'wedding', name: 'Wedding' },
        { id: 'formal', name: 'Formal' },
        { id: 'casual', name: 'Casual' }
      ]);
    } else if (subcategory === 'modern') {
      setStyles([
        { id: 'casual', name: 'Casual' },
        { id: 'formal', name: 'Formal' },
        { id: 'business', name: 'Business' }
      ]);
    } else if (subcategory === 'accessories') {
      setStyles([
        { id: 'turban', name: 'Turban' },
        { id: 'jewelry', name: 'Jewelry' }
      ]);
    } else if (subcategory === 'bride-saloon' || subcategory === 'groom-saloon') {
      setStyles([
        { id: 'hair', name: 'Hair Styles' },
        { id: 'makeup', name: 'Makeup' },
        { id: 'formal', name: 'Formal Look' }
      ]);
    } else {
      setStyles([]);
    }
  };
  
  // Handle style/item change
  const handleStyleChange = (e) => {
    const style = e.target.value;
    setSelectedStyle(style);
    
    // In a real app, this would trigger a fetch to get templates
    // For now, we'll just simulate it
    setTemplates([]);
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
    }
  };
  
  // Fetch templates
  const handleViewTemplates = () => {
    if (!selectedCategory || !selectedSubcategory || !selectedStyle) {
      setError('Please select a category, subcategory, and style first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Fetch templates from the server
    fetch(`/get-templates?category_type=${selectedCategory}&subcategory=${selectedSubcategory}&item_category=${selectedStyle}`)
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.success) {
          setTemplates(data.templates || []);
          setShowTemplates(true);
        } else {
          setError(data.message || 'Error fetching templates');
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('Network error: ' + err.message);
        console.error('Error:', err);
      });
  };
  
  // Process a template
  const processTemplate = (templatePath) => {
    if (!sourceImage) {
      setError('Please upload your photo first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('source', sourceImage);
    formData.append('template_path', templatePath);
    formData.append('enhance', enhance);
    formData.append('enhance_method', enhanceMethod);
    
    fetch('/process-template', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      setIsLoading(false);
      if (data.success) {
        // Add result to results array
        setResults(prev => [...prev, {
          result_url: data.result_path,
          category: `${selectedCategory} - ${selectedStyle}`
        }]);
      } else {
        setError(data.message || 'Error processing template');
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
  
  return (
    <div className="container-fluid" style={{ backgroundColor: '#191919', color: 'white', padding: '20px' }}>
      <div className="row mb-3">
        <div className="col-12">
          <h4 className="mt-2 mb-4">Face Swap Selection</h4>
        </div>
      </div>
      
      <div className="row">
        {/* Upload area */}
        <div className="col-md-4">
          <div 
            className="upload-area mb-3" 
            onClick={triggerFileInput}
            style={{
              height: '200px',
              border: '1px dashed #6c3bae',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(43, 23, 68, 0.2)'
            }}
          >
            {sourcePreview ? (
              <img 
                src={sourcePreview} 
                alt="Your uploaded face" 
                className="img-fluid mb-2 source-preview" 
                style={{ 
                  maxHeight: '180px', 
                  maxWidth: '90%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#6c3bae' }}></i>
                <p className="mt-2 mb-0">Drop photo or click to browse</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="d-none" 
            />
          </div>
        </div>
        
        {/* Selection options */}
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select 
                className="form-select" 
                value={selectedCategory}
                onChange={handleCategoryChange}
                style={{
                  backgroundColor: '#2b2b2b',
                  color: 'white',
                  border: '1px solid #444'
                }}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Subcategory</label>
              <select 
                className="form-select" 
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                style={{
                  backgroundColor: '#2b2b2b',
                  color: 'white',
                  border: '1px solid #444'
                }}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Style/Item</label>
              <select 
                className="form-select" 
                value={selectedStyle}
                onChange={handleStyleChange}
                disabled={!selectedSubcategory}
                style={{
                  backgroundColor: '#2b2b2b',
                  color: 'white',
                  border: '1px solid #444'
                }}
              >
                <option value="">Select Style/Item</option>
                {styles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="row mt-3">
            <div className="col-12">
              <p className="text-muted small">
                <i className="fas fa-info-circle me-1"></i>
                Upload your photo first, then select category options
              </p>
              
              <button 
                className="btn btn-sm btn-secondary mt-1"
                onClick={handleViewTemplates}
                disabled={!sourceImage || !selectedCategory || !selectedSubcategory || !selectedStyle || isLoading}
              >
                <i className="fas fa-images me-1"></i> View Templates
              </button>
              
              <div className="form-check form-check-inline ms-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enhanceCheck"
                  checked={enhance}
                  onChange={(e) => setEnhance(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="enhanceCheck">
                  Auto-enhance results
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
      
      {/* Templates display area */}
      {showTemplates && templates.length > 0 && (
        <div className="mt-4">
          <h5>Available Templates</h5>
          <div className="row">
            {templates.map((template, index) => (
              <div key={index} className="col-md-3 col-sm-6 mb-3">
                <div 
                  className="template-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => processTemplate(template.path)}
                >
                  <img 
                    src={template.url} 
                    alt={`Template ${index + 1}`} 
                    className="img-fluid rounded" 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Results display area */}
      {results.length > 0 && (
        <div className="mt-4">
          <h5>Your Results</h5>
          <div className="row">
            {results.map((result, index) => (
              <div key={index} className="col-md-3 col-sm-6 mb-3">
                <div className="result-card">
                  <img 
                    src={result.result_url} 
                    alt={`Result ${index + 1}`} 
                    className="img-fluid rounded swap-result" 
                    style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                  />
                  <p className="mt-2 small text-center">{result.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalPage;

export default UniversalPage;