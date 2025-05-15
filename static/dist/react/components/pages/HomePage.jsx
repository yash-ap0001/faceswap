import React, { useState, useEffect } from 'react';

/**
 * Home page component with very clean and minimal design
 * Using template images and dark purple theme, with auto-changing feature
 */
const HomePage = () => {
  // Define the dark purple theme colors
  const colors = {
    darkPurple: '#6a0dad',
    mediumPurple: '#8a2be2',
    lightPurple: '#9d4edd',
    darkBg: '#1a1a1a',
    cardBg: '#212121'
  };

  // Define template images grouped by ceremony using the pinterest directory
  const ceremonyImages = {
    haldi: [
      '/templates/uploads/pinterest/haldi/haldi_2.jpg',
      '/templates/uploads/pinterest/haldi/haldi_3.jpg',
      '/templates/uploads/pinterest/haldi/haldi_10.jpg',
      '/templates/uploads/pinterest/haldi/haldi_11.jpg'
    ],
    mehendi: [
      '/templates/uploads/pinterest/mehendi/mehendi_1.jpg',
      '/templates/uploads/pinterest/mehendi/mehendi_2.jpg',
      '/templates/uploads/pinterest/mehendi/mehendi_3.jpg',
      '/templates/uploads/pinterest/mehendi/mehendi_4.jpg'
    ],
    wedding: [
      '/templates/uploads/pinterest/wedding/wedding_1.jpg',
      '/templates/uploads/pinterest/wedding/wedding_3.jpg',
      '/templates/uploads/pinterest/wedding/wedding_4.jpg',
      '/templates/uploads/pinterest/wedding/wedding_5.jpg'
    ],
    reception: [
      '/templates/uploads/pinterest/reception/reception_1.jpg',
      '/templates/uploads/pinterest/reception/reception_2.jpg',
      '/templates/uploads/pinterest/reception/reception_3.jpg',
      '/templates/uploads/pinterest/reception/reception_4.jpg'
    ]
  };

  // Ceremony titles
  const ceremonyTitles = {
    haldi: 'Haldi',
    mehendi: 'Mehendi',
    wedding: 'Wedding',
    reception: 'Reception'
  };

  // Order of ceremonies
  const ceremonyOrder = ['haldi', 'mehendi', 'wedding', 'reception'];

  // State for the current image indices for each ceremony
  const [currentIndices, setCurrentIndices] = useState({
    haldi: 0,
    mehendi: 0,
    wedding: 0,
    reception: 0
  });

  // Effect for auto-changing images
  useEffect(() => {
    const intervals = {};
    
    // Set interval for each ceremony type
    Object.keys(ceremonyImages).forEach(ceremony => {
      intervals[ceremony] = setInterval(() => {
        setCurrentIndices(prev => ({
          ...prev,
          [ceremony]: (prev[ceremony] + 1) % ceremonyImages[ceremony].length
        }));
      }, 3000); // Change image every 3 seconds
    });

    return () => {
      // Clear all intervals on component unmount
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  return (
    <div className="home-page" style={{backgroundColor: '#121212', padding: '20px 10px'}}>
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
            color: colors.mediumPurple,
            fontWeight: '800',
            fontSize: '2.2rem'
          }}>
            VOW
          </span>
          <span style={{
            marginLeft: '10px',
            color: 'white',
            fontWeight: '700',
            fontStyle: 'italic',
            fontSize: '2rem'
          }}>
            BRIDE
          </span>
        </h1>
      </div>

      {/* Row of ceremony images */}
      <div className="container px-2">
        <div className="row g-0">
          {ceremonyOrder.map(ceremony => (
            <div className="col-md-3" key={ceremony}>
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
                  {ceremonyImages[ceremony].map((src, index) => (
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
                      />
                    </div>
                  ))}
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
                {/* Navigation dots hidden as requested */}
              </div>
            </div>
          ))}
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