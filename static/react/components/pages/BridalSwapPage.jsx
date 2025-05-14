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

  // Fetch templates when ceremony type changes
  useEffect(() => {
    fetchTemplates(ceremonyType);
  }, [ceremonyType]);

  // Fetch templates for a specific ceremony
  const fetchTemplates = async (ceremony) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/get_templates?ceremony_type=${ceremony}&category_type=bride&subcategory=bridal&item_category=${ceremony}`);
      const data = await response.json();
      
      if (data.success && data.templates) {
        setTemplates(data.templates);
      } else {
        console.error('Error fetching templates:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
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
      
      if (result.success) {
        setResults([{
          template_path: template.path,
          result_path: result.result_path,
          enhanced: result.enhanced,
          enhance_method: result.enhance_method
        }]);
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
    
    selectedTemplates.forEach((template, index) => {
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
      
      if (result.success) {
        setResults(result.results);
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
      <h1 className="mb-4">Create Your Bridal Look</h1>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Upload Your Photo</h5>
              <div className="form-group mb-3">
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleSourceImageChange}
                />
              </div>
              
              {sourcePreview && (
                <div className="source-preview mb-3">
                  <img 
                    src={sourcePreview} 
                    className="img-fluid rounded" 
                    alt="Your Photo" 
                  />
                </div>
              )}
              
              <div className="form-group mb-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox"
                    id="enhanceSwitch"
                    checked={enhanceEnabled}
                    onChange={() => setEnhanceEnabled(!enhanceEnabled)}
                  />
                  <label className="form-check-label" htmlFor="enhanceSwitch">
                    Enhance Face
                  </label>
                </div>
              </div>
              
              {enhanceEnabled && (
                <div className="form-group mb-3">
                  <label className="form-label">Enhancement Method</label>
                  <select 
                    className="form-select"
                    value={enhanceMethod}
                    onChange={(e) => setEnhanceMethod(e.target.value)}
                  >
                    <option value="auto">Auto (Best)</option>
                    <option value="gfpgan">GFPGAN</option>
                    <option value="codeformer">CodeFormer</option>
                  </select>
                </div>
              )}
              
              <div className="d-grid gap-2">
                <button 
                  className={`btn ${isMultiSelectMode ? 'btn-warning' : 'btn-primary'}`}
                  onClick={toggleMultiSelectMode}
                >
                  {isMultiSelectMode ? 'Cancel Multi-Select' : 'Multi-Select Mode'}
                </button>
                
                {isMultiSelectMode && selectedTemplates.length > 0 && (
                  <button 
                    className="btn btn-success"
                    onClick={processMultipleTemplates}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Process Selected Templates'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {isMultiSelectMode && selectedTemplates.length > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Selected Templates ({selectedTemplates.length})</h5>
                <div className="row g-2">
                  {selectedTemplates.map((template, index) => (
                    <div className="col-4" key={`selected-${template.id}`}>
                      <div className="position-relative">
                        <img 
                          src={template.url} 
                          className="img-fluid rounded" 
                          alt={`Template ${index + 1}`} 
                        />
                        <button 
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          onClick={() => toggleTemplateSelection(template)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Select Ceremony</h5>
              <div className="d-flex justify-content-center mb-3">
                <div className="btn-group" role="group">
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
              </div>
              
              <div className="row g-3">
                {isLoading && templates.length === 0 ? (
                  <div className="col-12 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : templates.length > 0 ? (
                  templates.map(template => (
                    <div className="col-md-4" key={template.id}>
                      <div 
                        className={`position-relative template-card ${selectedTemplates.some(t => t.path === template.path) ? 'selected' : ''}`}
                        onClick={() => toggleTemplateSelection(template)}
                      >
                        <img 
                          src={template.url} 
                          className="img-fluid rounded" 
                          alt={template.id} 
                        />
                        {isMultiSelectMode && (
                          <div className="position-absolute top-0 end-0 p-2">
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
                  <div className="col-12 text-center">
                    <p>No templates available for this ceremony type.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Results</h5>
                <div className="row g-3">
                  {results.map((result, index) => (
                    <div className="col-md-4" key={`result-${index}`}>
                      <div className="position-relative">
                        <img 
                          src={`/${result.result_path}?t=${Date.now()}`} 
                          className="img-fluid rounded" 
                          alt={`Result ${index + 1}`} 
                        />
                        {result.enhanced && (
                          <span className="position-absolute top-0 start-0 badge bg-info m-2">
                            Enhanced ({result.enhance_method})
                          </span>
                        )}
                        <a 
                          href={`/${result.result_path}?t=${Date.now()}`} 
                          className="btn btn-sm btn-primary position-absolute bottom-0 end-0 m-2"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BridalSwapPage;