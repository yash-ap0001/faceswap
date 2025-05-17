import React, { useState, useEffect } from 'react';

/**
 * Home page component with very clean and minimal design
 * Using template images and dark purple theme, with auto-changing feature
 */
const HomePage = () => {
  // Define the dark purple theme colors
  const colors = {
    darkPurple: '#2b1744', // Updated to the exact dark purple shade requested
    mediumPurple: '#8a2be2',
    lightPurple: '#9d4edd',
    darkBg: '#1a1a1a',
    cardBg: '#212121'
  };

  // State to store template images for each ceremony
  const [ceremonyImages, setCeremonyImages] = useState({
    haldi: [],
    mehendi: [],
    sangeeth: [],
    wedding: [],
    reception: []
  });

  // State to track if images are loading
  const [loading, setLoading] = useState(true);

  // Ceremony titles
  const ceremonyTitles = {
    haldi: 'Haldi',
    mehendi: 'Mehendi',
    sangeeth: 'Sangeeth',
    wedding: 'Wedding',
    reception: 'Reception'
  };

  // Order of ceremonies
  const ceremonyOrder = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'];

  // Default fallback images in case API fails
  const defaultImages = {
    haldi: [
      '/static/templates/bride/haldi/haldi_1.jpg',
      '/static/templates/bride/haldi/haldi_2.jpg',
      '/static/templates/bride/haldi/haldi_3.jpg',
      '/static/templates/bride/haldi/haldi_4.jpg'
    ],
    mehendi: [
      '/static/templates/bride/mehendi/mehendi_1.jpg',
      '/static/templates/bride/mehendi/mehendi_2.jpg',
      '/static/templates/bride/mehendi/mehendi_3.jpg',
      '/static/templates/bride/mehendi/mehendi_4.jpg'
    ],
    sangeeth: [
      '/static/templates/bride/sangeeth/sangeeth_1.jpg',
      '/static/templates/bride/sangeeth/sangeeth_2.jpg',
      '/static/templates/bride/sangeeth/sangeeth_3.jpg',
      '/static/templates/bride/sangeeth/sangeeth_4.jpg'
    ],
    wedding: [
      '/static/templates/bride/wedding/wedding_1.jpg',
      '/static/templates/bride/wedding/wedding_2.jpg',
      '/static/templates/bride/wedding/wedding_3.jpg',
      '/static/templates/bride/wedding/wedding_4.jpg'
    ],
    reception: [
      '/static/templates/bride/reception/reception_1.jpg',
      '/static/templates/bride/reception/reception_2.jpg',
      '/static/templates/bride/reception/reception_3.jpg',
      '/static/templates/bride/reception/reception_4.jpg'
    ]
  };

  // State for the current image indices for each ceremony
  const [currentIndices, setCurrentIndices] = useState({
    haldi: 0,
    mehendi: 0,
    sangeeth: 0,
    wedding: 0,
    reception: 0
  });

  // Simple in-memory cache for ceremony images
  let ceremonyImagesCache = null;

  // Fetch templates from API for each ceremony
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Use cache if available
        if (ceremonyImagesCache) {
          setCeremonyImages(ceremonyImagesCache);
          setLoading(false);
          return;
        }
        const templates = {};
        
        // Fetch templates for each ceremony type
        for (const ceremony of ceremonyOrder) {
          try {
            const response = await fetch(`/api/templates?category_type=bride&subcategory=bridal&item_category=${ceremony}`);
            if (response.ok) {
              const data = await response.json();
              if (data.templates && data.templates.length > 0) {
                // Get up to 4 template images
                templates[ceremony] = data.templates
                  .slice(0, 4)
                  .map(template => template.url);
              } else {
                // Use default images if no templates found
                templates[ceremony] = defaultImages[ceremony];
              }
            } else {
              templates[ceremony] = defaultImages[ceremony];
            }
          } catch (error) {
            console.error(`Error fetching ${ceremony} templates:`, error);
            templates[ceremony] = defaultImages[ceremony];
          }
        }
        
        setCeremonyImages(templates);
        // Store in cache
        ceremonyImagesCache = templates;
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Fall back to default images
        setCeremonyImages(defaultImages);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  // Effect for auto-changing images
  useEffect(() => {
    if (loading) return;
    
    const intervals = {};
    
    // Set interval for each ceremony type
    Object.keys(ceremonyImages).forEach(ceremony => {
      if (ceremonyImages[ceremony] && ceremonyImages[ceremony].length > 0) {
        intervals[ceremony] = setInterval(() => {
          setCurrentIndices(prev => ({
            ...prev,
            [ceremony]: (prev[ceremony] + 1) % ceremonyImages[ceremony].length
          }));
        }, 3000); // Change image every 3 seconds
      }
    });

    return () => {
      // Clear all intervals on component unmount
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [loading, ceremonyImages]);

  return (
    <div className="home-page" style={{ padding: '20px 10px', position: 'relative' }}>
      {/* Brand logo */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1rem'
      }}>
        <h1 style={{
          margin: 0,
          padding: 0,
          letterSpacing: '2px'
        }}>
          <span style={{
            color: colors.darkPurple,
            fontWeight: '800',
            fontSize: '2.2rem'
          }}>
            BRIDE
          </span>
          <span style={{
            marginLeft: '10px',
            color: 'white',
            fontWeight: '700',
            fontStyle: 'italic',
            fontSize: '2rem'
          }}>
            FACE SWAP
          </span>
        </h1>
      </div>

      {/* Row of ceremony images */}
      <div className="container px-2">
        <div className="row g-0">
          {loading ? (
            // Loading state
            <>
              {[1, 2, 3, 4].map(num => (
                <div className="col-md-3" key={`loading-${num}`}>
                  <div style={{
                    backgroundColor: colors.cardBg,
                    overflow: 'hidden',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                    height: '100%'
                  }}>
                    <div style={{
                      height: '280px',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#1a1a1a'
                    }}>
                      <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      padding: '15px',
                      textAlign: 'center',
                      position: 'relative',
                      marginTop: '-50px'
                    }}>
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Images loaded
            ceremonyOrder.map(ceremony => (
              <div className="col" key={ceremony}>
                <div style={{
                  backgroundColor: colors.cardBg,
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                  height: '100%'
                }}>
                  <div style={{
                    height: '280px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {ceremonyImages[ceremony] && ceremonyImages[ceremony].length > 0 ? (
                      ceremonyImages[ceremony].map((src, index) => (
                        <div 
                          key={index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: index === currentIndices[ceremony] ? 1 : 0,
                            transition: 'opacity 1s ease-in-out',
                            zIndex: index === currentIndices[ceremony] ? 1 : 0
                          }}
                        >
                          <img 
                            src={src} 
                            alt={`${ceremonyTitles[ceremony]} Image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                            onError={(e) => {
                              console.error(`Failed to load image: ${src}`);
                              e.target.src = '/static/placeholder.jpg';
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: '#1a1a1a'
                      }}>
                        <p style={{color: '#666', textAlign: 'center'}}>No images available</p>
                      </div>
                    )}
                  </div>
                  <div style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '15px',
                    textAlign: 'center',
                    position: 'relative',
                    marginTop: '-50px'
                  }}>
                    <h4 style={{
                      color: 'white',
                      margin: 0,
                      fontWeight: '400',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {ceremonyTitles[ceremony]}
                    </h4>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Simple How It Works Section */}
        <div style={{
          backgroundColor: colors.cardBg,
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            textAlign: 'center',
            color: colors.lightPurple,
            marginBottom: '1.5rem',
            fontWeight: '300'
          }}>
            How It Works
          </h3>
          
          <div className="row text-center">
            <div className="col-3">
              <i className="fas fa-upload fa-2x" style={{color: colors.lightPurple}}></i>
              <p style={{color: 'white', marginTop: '10px', fontSize: '0.9rem'}}>Upload</p>
            </div>
            <div className="col-3">
              <i className="fas fa-list fa-2x" style={{color: colors.lightPurple}}></i>
              <p style={{color: 'white', marginTop: '10px', fontSize: '0.9rem'}}>Select</p>
            </div>
            <div className="col-3">
              <i className="fas fa-images fa-2x" style={{color: colors.lightPurple}}></i>
              <p style={{color: 'white', marginTop: '10px', fontSize: '0.9rem'}}>Templates</p>
            </div>
            <div className="col-3">
              <i className="fas fa-magic fa-2x" style={{color: colors.lightPurple}}></i>
              <p style={{color: 'white', marginTop: '10px', fontSize: '0.9rem'}}>Generate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;