import React, { useState, useEffect } from 'react';

const BulkUpload = () => {
  // State for form data
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categoryType, setCategoryType] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // New: categories state
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);

  // New: move modal state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveCategory, setMoveCategory] = useState('');
  const [moveSubcategory, setMoveSubcategory] = useState('');
  const [moveItem, setMoveItem] = useState('');
  const [moveSubcategories, setMoveSubcategories] = useState([]);
  const [moveItems, setMoveItems] = useState([]);
  const [moveStatus, setMoveStatus] = useState('');

  // Fetch categories from backend on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      });
  }, []);

  // Update subcategories when categoryType changes
  useEffect(() => {
    setSubcategory('');
    setItemCategory('');
    setItems([]);
    if (!categoryType) {
      setSubcategories([]);
      return;
    }
    const cat = categories.find(c => c.id === categoryType);
    setSubcategories(cat ? cat.subcategories : []);
  }, [categoryType, categories]);

  // Update items when subcategory changes
  useEffect(() => {
    setItemCategory('');
    if (!subcategory) {
      setItems([]);
      return;
    }
    const cat = categories.find(c => c.id === categoryType);
    const sub = cat && cat.subcategories.find(s => s.id === subcategory);
    setItems(sub ? sub.items : []);
  }, [subcategory, categoryType, categories]);

  // Move modal dropdown logic
  useEffect(() => {
    if (!moveCategory) {
      setMoveSubcategories([]);
      setMoveSubcategory('');
      setMoveItems([]);
      setMoveItem('');
      return;
    }
    const cat = categories.find(c => c.id === moveCategory);
    setMoveSubcategories(cat ? cat.subcategories : []);
    setMoveSubcategory('');
    setMoveItems([]);
    setMoveItem('');
  }, [moveCategory, categories]);

  useEffect(() => {
    if (!moveSubcategory) {
      setMoveItems([]);
      setMoveItem('');
      return;
    }
    const cat = categories.find(c => c.id === moveCategory);
    const sub = cat && cat.subcategories.find(s => s.id === moveSubcategory);
    setMoveItems(sub ? sub.items : []);
    setMoveItem('');
  }, [moveSubcategory, moveCategory, categories]);

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // Handle category type change
  const handleCategoryTypeChange = (event) => {
    setCategoryType(event.target.value);
    setSubcategory('');
    setItemCategory('');
  };

  // Handle subcategory change
  const handleSubcategoryChange = (event) => {
    setSubcategory(event.target.value);
    setItemCategory('');
  };

  // Handle item category change
  const handleItemCategoryChange = (event) => {
    setItemCategory(event.target.value);
  };

  // Handle template selection
  const handleTemplateSelect = (templatePath) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templatePath)) {
        return prev.filter(path => path !== templatePath);
      }
      return [...prev, templatePath];
    });
  };

  // Handle select all templates
  const handleSelectAllTemplates = () => {
    setSelectedTemplates(templates.map(template => template.path));
  };

  // Handle deselect all templates
  const handleDeselectAllTemplates = () => {
    setSelectedTemplates([]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFiles.length || !categoryType || !subcategory || !itemCategory) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category_type', categoryType);
    formData.append('subcategory', subcategory);
    formData.append('item_category', itemCategory);

    try {
      const response = await fetch('/upload-bulk-templates', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setUploadStatus('Upload complete!');
        setUploadSuccess(true);
        setSelectedFiles([]);
        refreshTemplates();
      } else {
        setUploadStatus('Upload failed: ' + data.message);
      }
    } catch (error) {
      setUploadStatus('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle template deletion
  const handleDeleteTemplates = async () => {
    if (!selectedTemplates.length) return;

    if (window.confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)?`)) {
      try {
        const response = await fetch('/delete-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_paths: selectedTemplates,
            category_type: categoryType,
            subcategory: subcategory,
            item_category: itemCategory
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSelectedTemplates([]);
          refreshTemplates();
        }
      } catch (error) {
        console.error('Error deleting templates:', error);
      }
    }
  };

  // Refresh templates
  const refreshTemplates = async () => {
    if (!categoryType || !subcategory || !itemCategory) return;

    try {
      const response = await fetch(`/get_templates?category_type=${categoryType}&subcategory=${subcategory}&item_category=${itemCategory}`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Load templates on category change
  useEffect(() => {
    if (categoryType && subcategory && itemCategory) {
      refreshTemplates();
    }
  }, [categoryType, subcategory, itemCategory]);

  // Move templates handler
  const handleMoveTemplates = async () => {
    if (!moveCategory || !moveSubcategory || !moveItem || selectedTemplates.length === 0) {
      setMoveStatus('Please select new category, subcategory, item, and at least one template.');
      return;
    }
    setMoveStatus('Moving...');
    try {
      const response = await fetch('/move-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_paths: selectedTemplates,
          category_type: moveCategory,
          subcategory: moveSubcategory,
          item_category: moveItem
        })
      });
      const data = await response.json();
      if (data.success) {
        setMoveStatus('Templates moved successfully!');
        setShowMoveModal(false);
        setSelectedTemplates([]);
        refreshTemplates();
      } else {
        setMoveStatus('Move failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      setMoveStatus('Move failed: ' + error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-center">Template Management</h4>
      
      {/* Folder Selection Dropdowns */}
      <div className="row mb-4">
        <div className="col-md-4 mb-2">
          <label htmlFor="categoryType" className="form-label small">Category</label>
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            id="categoryType"
            value={categoryType}
            onChange={handleCategoryTypeChange}
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <label htmlFor="subcategory" className="form-label small">Subcategory</label>
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            id="subcategory"
            value={subcategory}
            onChange={handleSubcategoryChange}
            disabled={!categoryType}
          >
            <option value="" disabled>Select subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <label htmlFor="itemCategory" className="form-label small">Item</label>
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            id="itemCategory"
            value={itemCategory}
            onChange={handleItemCategoryChange}
            disabled={!subcategory}
          >
            <option value="" disabled>Select item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Management Section - only show if folder is selected */}
      {categoryType && subcategory && itemCategory && (
      <div className="row g-4">
          <div className="col-12">
            <div className="bg-dark p-4 rounded shadow-sm border-0">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Manage Templates</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary px-2"
                    onClick={handleSelectAllTemplates}
                  >
                    <i className="fas fa-check-square me-1" />Select All
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary px-2"
                    onClick={handleDeselectAllTemplates}
                  >
                    <i className="fas fa-square me-1" />Deselect
                  </button>
                  <button
                    className="btn btn-sm btn-danger px-2"
                    onClick={handleDeleteTemplates}
                    disabled={!selectedTemplates.length}
                  >
                    <i className="fas fa-trash-alt me-1" />Delete
                  </button>
                  <button
                    className="btn btn-sm btn-warning px-2"
                    onClick={() => setShowMoveModal(true)}
                    disabled={!selectedTemplates.length}
                  >
                    <i className="fas fa-arrows-alt me-1" />Move
                  </button>
                  <button
                    className="btn btn-sm btn-outline-light px-2"
                    onClick={refreshTemplates}
                  >
                    <i className="fas fa-sync-alt" />
                  </button>
                </div>
              </div>
              <div className="row g-2">
                {templates.map((template) => (
                  <div key={template.path} className="col-4 col-md-3 mb-2">
                    <div className="card h-100 bg-dark border-0 shadow-sm">
                      <div className="form-check position-absolute top-0 start-0 m-1" style={{ zIndex: 10 }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedTemplates.includes(template.path)}
                          onChange={() => handleTemplateSelect(template.path)}
                        />
                      </div>
                      <div className="position-relative">
                        <img
                          src={template.url}
                          className="card-img-top"
                          alt={template.name}
                          style={{
                            height: '180px',
                            objectFit: 'cover',
                            objectPosition: 'center 20%',
                            borderRadius: '8px',
                            border: selectedTemplates.includes(template.path) ? '2px solid #ffc107' : '2px solid transparent',
                            transition: 'border 0.2s'
                          }}
                        />
                        {template.is_main && (
                          <div className="position-absolute top-0 end-0 m-1">
                            <span className="badge bg-primary">Main</span>
                          </div>
                        )}
                      </div>
                      <div className="p-1 bg-dark text-center">
                        <small className="text-light text-truncate d-block" style={{ fontSize: '0.7rem' }}>
                          {template.name ? template.name.substring(0, 15) : ''}
                          {template.name && template.name.length > 15 ? '...' : ''}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="col-12 text-center py-4">
                    <p className="text-muted mb-0">No templates available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Move Modal here (existing code) */}
          {showMoveModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Move Templates</h5>
                    <button type="button" className="btn-close" onClick={() => setShowMoveModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2">
                      <label className="form-label small">Category</label>
                      <select className="form-select" value={moveCategory} onChange={e => setMoveCategory(e.target.value)}>
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">Subcategory</label>
                      <select className="form-select" value={moveSubcategory} onChange={e => setMoveSubcategory(e.target.value)} disabled={!moveCategory}>
                        <option value="">Select subcategory</option>
                        {moveSubcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">Item</label>
                      <select className="form-select" value={moveItem} onChange={e => setMoveItem(e.target.value)} disabled={!moveSubcategory}>
                        <option value="">Select item</option>
                        {moveItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    {moveStatus && <div className="alert alert-info py-1 small mt-2">{moveStatus}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-warning" onClick={handleMoveTemplates}>Move</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Section (optional, can be below or hidden if not needed) */}
      <div className="row g-4 mt-4">
        <div className="col-lg-6">
          <div className="bg-dark p-4 rounded shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Upload Templates</h5>
            </div>
            
            <form>
              <div className="mb-3">
                <label htmlFor="images" className="form-label small">Select Images</label>
                <input
                  type="file"
                  className="form-control form-control-sm bg-dark text-light border-secondary"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <div className="form-text text-muted small mt-1">First image becomes main template</div>
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <small className="text-light">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                    </small>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-primary w-100"
                  onClick={handleUpload}
                  disabled={!selectedFiles.length || !categoryType || !subcategory || !itemCategory || loading}
                >
                  {loading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
                </button>
              </div>
            </form>

            {uploadStatus && (
              <div className="my-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-2 small text-light">{uploadStatus}</div>
              </div>
            )}

            {uploadSuccess && (
              <div className="my-3">
                <div className="p-2 rounded bg-success bg-opacity-10 text-success small">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-check-circle text-success me-2" />
                    <div>
                      <strong>Upload successful!</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload; 