import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Image } from 'react-bootstrap';

const UniversalPage = () => {
  // State for the different steps of the process
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Templates and upload state
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  
  // Results state
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [enhanceOptions, setEnhanceOptions] = useState({
    enhance: false,
    enhanceMethod: 'auto'
  });
  
  // Refs
  const fileInputRef = useRef(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch templates when a category, subcategory, and item are all selected
  useEffect(() => {
    if (selectedCategory && selectedSubcategory && selectedItem) {
      fetchTemplates();
    }
  }, [selectedCategory, selectedSubcategory, selectedItem]);
  
  // Reset selections when changing a higher-level selection
  useEffect(() => {
    if (selectedCategory) {
      setSelectedSubcategory(null);
      setSelectedItem(null);
      setTemplates([]);
    }
  }, [selectedCategory]);
  
  useEffect(() => {
    if (selectedSubcategory) {
      setSelectedItem(null);
      setTemplates([]);
    }
  }, [selectedSubcategory]);
  
  // Handle file selection for source image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSourceImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourcePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Fetch templates based on selected category, subcategory, and item
  const fetchTemplates = async () => {
    if (!selectedCategory || !selectedSubcategory || !selectedItem) return;
    
    try {
      setTemplatesLoading(true);
      
      // Map our UI categories to API parameters
      const categoryType = selectedCategory.id;
      const subcategory = selectedSubcategory.id;
      const itemCategory = selectedItem.id;
      
      const response = await fetch(`/get_templates?category_type=${categoryType}&subcategory=${subcategory}&item_category=${itemCategory}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please try again later.');
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };
  
  // Process face swap with selected templates
  const processTemplates = async () => {
    if (!sourceImage || templates.length === 0) {
      setError('Please select a source image and ensure templates are loaded');
      return;
    }
    
    try {
      setProcessing(true);
      setResults([]);
      
      const formData = new FormData();
      formData.append('source', sourceImage);
      formData.append('category', selectedCategory.id);
      formData.append('enhance', enhanceOptions.enhance);
      formData.append('enhance_method', enhanceOptions.enhanceMethod);
      
      const response = await fetch('/universal_face_swap', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process templates: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
        setError(null);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Error processing templates:', err);
      setError(`Face swap failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  // Reset all selections and start over
  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedItem(null);
    setTemplates([]);
    setSourceImage(null);
    setSourcePreview(null);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Render category selection
  const renderCategorySelection = () => {
    return (
      <Row className="mb-4">
        <Col md={12}>
          <h4 className="mb-3">Select Category</h4>
          <Row>
            {categories.map(category => (
              <Col key={category.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
                <Card 
                  className={`h-100 ${selectedCategory?.id === category.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                    <i className={`fa fa-${category.icon} fa-2x mb-2`}></i>
                    <Card.Title className="mb-0">{category.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    );
  };
  
  // Render subcategory selection
  const renderSubcategorySelection = () => {
    if (!selectedCategory) return null;
    
    return (
      <Row className="mb-4">
        <Col md={12}>
          <h4 className="mb-3">Select Subcategory</h4>
          <Row>
            {selectedCategory.subcategories.map(subcategory => (
              <Col key={subcategory.id} xs={6} sm={4} md={3} className="mb-3">
                <Card 
                  className={`h-100 ${selectedSubcategory?.id === subcategory.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                    <Card.Title>{subcategory.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    );
  };
  
  // Render item selection
  const renderItemSelection = () => {
    if (!selectedCategory || !selectedSubcategory) return null;
    
    return (
      <Row className="mb-4">
        <Col md={12}>
          <h4 className="mb-3">Select Style</h4>
          <Row>
            {selectedSubcategory.items.map(item => (
              <Col key={item.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
                <Card 
                  className={`h-100 ${selectedItem?.id === item.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                    <Card.Title>{item.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    );
  };
  
  // Render source upload
  const renderSourceUpload = () => {
    return (
      <Row className="mb-4">
        <Col md={12}>
          <h4 className="mb-3">Upload Your Photo</h4>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Control 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <Form.Text className="text-muted">
                  Select a clear photo of your face for best results
                </Form.Text>
              </Form.Group>
              
              <div className="mt-3">
                <Form.Check 
                  type="checkbox"
                  id="enhance-checkbox"
                  label="Enhance face after swapping"
                  checked={enhanceOptions.enhance}
                  onChange={(e) => setEnhanceOptions({...enhanceOptions, enhance: e.target.checked})}
                />
                
                {enhanceOptions.enhance && (
                  <Form.Group className="mt-2">
                    <Form.Label>Enhancement Method</Form.Label>
                    <Form.Select
                      value={enhanceOptions.enhanceMethod}
                      onChange={(e) => setEnhanceOptions({...enhanceOptions, enhanceMethod: e.target.value})}
                    >
                      <option value="auto">Auto (Best method)</option>
                      <option value="gfpgan">GFPGAN</option>
                      <option value="codeformer">CodeFormer</option>
                    </Form.Select>
                  </Form.Group>
                )}
              </div>
              
              <Button 
                variant="primary" 
                className="mt-3" 
                onClick={processTemplates}
                disabled={!sourceImage || templates.length === 0 || processing}
              >
                {processing ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : 'Create Your Look'}
              </Button>
              <Button 
                variant="outline-secondary" 
                className="mt-3 ms-2" 
                onClick={handleReset}
              >
                Start Over
              </Button>
            </Col>
            <Col md={6}>
              {sourcePreview ? (
                <div className="d-flex justify-content-center align-items-center">
                  <img 
                    src={sourcePreview} 
                    alt="Source Preview" 
                    className="img-fluid" 
                    style={{maxHeight: '300px', objectFit: 'contain'}}
                  />
                </div>
              ) : (
                <div className="text-center border rounded p-5">
                  <i className="fa fa-user fa-3x mb-3"></i>
                  <p>Your photo will appear here</p>
                </div>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };
  
  // Render templates
  const renderTemplates = () => {
    if (!selectedCategory || !selectedSubcategory || !selectedItem) return null;
    
    return (
      <Row className="mb-4">
        <Col md={12}>
          <h4 className="mb-3">Available Templates</h4>
          {templatesLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading templates...</p>
            </div>
          ) : templates.length > 0 ? (
            <Row>
              {templates.map(template => (
                <Col key={template.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
                  <div className="template-thumbnail">
                    <img 
                      src={template.url} 
                      alt={template.id}
                      className="img-fluid"
                      style={{width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'top'}}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              No templates available for this selection. Please try another category or style.
            </Alert>
          )}
        </Col>
      </Row>
    );
  };
  
  // Render results
  const renderResults = () => {
    if (results.length === 0) return null;
    
    return (
      <Row className="mb-4">
        <Col md={12}>
          <h4 className="mb-3">Your Results</h4>
          <Row>
            {results.map((result, index) => (
              <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-3">
                <Card>
                  <Card.Img 
                    variant="top" 
                    src={result.url} 
                    style={{height: '200px', objectFit: 'cover', objectPosition: 'top'}}
                  />
                  <Card.Body>
                    <Button variant="outline-primary" size="sm" className="w-100" href={result.url} target="_blank">
                      <i className="fa fa-download me-1"></i> Download
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    );
  };
  
  return (
    <Container fluid className="p-3">
      <h2 className="mb-4">Universal Face Swap</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading categories...</p>
        </div>
      ) : (
        <>
          {renderCategorySelection()}
          {renderSubcategorySelection()}
          {renderItemSelection()}
          {selectedItem && renderSourceUpload()}
          {selectedItem && renderTemplates()}
          {renderResults()}
        </>
      )}
    </Container>
  );
};

export default UniversalPage;