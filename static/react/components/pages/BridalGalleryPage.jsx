import React, { useState, useEffect } from 'react';

/**
 * BridalGalleryPage component for browsing bridal templates
 */
const BridalGalleryPage = () => {
  const [ceremonyType, setCeremonyType] = useState('haldi');
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch templates when component mounts or ceremony type changes
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

  // Open image in modal
  const openImageModal = (template) => {
    setSelectedImage(template);
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
    
    const currentIndex = templates.findIndex(t => t.id === selectedImage.id);
    if (currentIndex < templates.length - 1) {
      setSelectedImage(templates[currentIndex + 1]);
      setZoomLevel(1); // Reset zoom level
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    if (!selectedImage) return;
    
    const currentIndex = templates.findIndex(t => t.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(templates[currentIndex - 1]);
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

  // Handle keyboard navigation
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

  return (
    <div className="bridal-gallery-page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="m-0">Bridal Gallery</h6>
        <div className="btn-group btn-group-sm" role="group">
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
      
      <div className="mb-3">
        <div className="container-fluid p-0">
          <div className="row g-2">
            {isLoading ? (
              <div className="col-12 text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : templates.length > 0 ? (
              templates.map(template => (
                <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={template.id}>
                  <div 
                    className="gallery-item"
                    onClick={() => openImageModal(template)}
                  >
                    <img 
                      src={template.url} 
                      className="img-fluid rounded shadow-sm" 
                      alt={template.id}
                    />
                    <div className="overlay">
                      <div className="zoom-icon">
                        <i className="fas fa-search-plus"></i>
                      </div>
                    </div>
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
      </div>
      
      {/* Image Modal - Minimalist Design */}
      {isModalOpen && selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-body p-0">
              <div className="image-container" style={{ overflow: 'hidden' }}>
                <img 
                  src={selectedImage.url} 
                  style={{ 
                    transform: `scale(${zoomLevel})`,
                    transition: 'transform 0.3s ease'
                  }} 
                  className="img-fluid" 
                  alt={selectedImage.id}
                />
              </div>
            </div>
            
            {/* Floating navigation controls */}
            <div className="floating-controls">
              <button 
                className="btn btn-sm btn-dark me-1"
                onClick={prevImage}
                disabled={templates.findIndex(t => t.id === selectedImage.id) === 0}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <button 
                className="btn btn-sm btn-dark ms-1 me-2"
                onClick={nextImage}
                disabled={templates.findIndex(t => t.id === selectedImage.id) === templates.length - 1}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              
              <button className="btn btn-sm btn-dark me-1" onClick={zoomOut}>
                <i className="fas fa-search-minus"></i>
              </button>
              
              <button className="btn btn-sm btn-dark me-1" onClick={zoomIn}>
                <i className="fas fa-search-plus"></i>
              </button>
              
              <button className="btn btn-sm btn-dark ms-2" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for gallery and modal */}
      <style jsx>{`
        .gallery-item {
          position: relative;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s ease;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .gallery-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        @media (max-width: 576px) {
          .gallery-item, .gallery-item img {
            height: 160px;
          }
          
          .col-6 {
            padding: 4px;
          }
        }
        
        .gallery-item:hover {
          transform: scale(1.03);
        }
        
        .gallery-item .overlay {
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
        
        .gallery-item:hover .overlay {
          opacity: 1;
        }
        
        .zoom-icon {
          color: white;
          font-size: 2rem;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        
        .modal-content {
          background: #343a40;
          border-radius: 8px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        
        .modal-header {
          padding: 1rem;
          border-bottom: 1px solid #6c757d;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-body {
          padding: 1rem;
          overflow: hidden;
          flex-grow: 1;
        }
        
        .modal-footer {
          padding: 1rem;
          border-top: 1px solid #6c757d;
        }
        
        .image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 60vh;
        }
        
        .floating-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.6);
          padding: 8px 12px;
          border-radius: 30px;
          backdrop-filter: blur(5px);
          z-index: 1060;
        }
        
        .floating-controls button {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #343a40;
          border: none;
          opacity: 0.9;
          transition: all 0.2s ease;
        }
        
        .floating-controls button:hover:not(:disabled) {
          background-color: #495057;
          transform: scale(1.1);
          opacity: 1;
        }
        
        .floating-controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .modal-content {
          background: transparent;
          border: none;
          box-shadow: none;
        }
        
        .modal-body {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default BridalGalleryPage;