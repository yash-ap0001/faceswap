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

  // Define template images for auto-changing
  const templateImages = [
    {
      src: '/static/results/result_1747231562_haldi_5.jpg',
      title: 'Haldi Ceremony'
    },
    {
      src: '/static/results/result_1747229949_wedding_5.jpg',
      title: 'Wedding Ceremony'
    },
    {
      src: '/static/results/result_1747229942_wedding_3.jpg',
      title: 'Reception Ceremony'
    },
    {
      src: '/static/templates/bride/makeup/natural/4ea63131c2229217909c0eb9167437cb.jpg',
      title: 'Mehendi Ceremony'
    }
  ];

  // State for the current image
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effect for auto-changing images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % templateImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page" style={{
      backgroundColor: '#121212', 
      padding: '0', 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Brand logo */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem',
        padding: '0.5rem'
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

      {/* Large auto-changing template image */}
      <div className="container px-2" style={{ 
        maxWidth: '800px', 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto',
        paddingBottom: '0'
      }}>
        <div style={{
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '30px',
          boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
          margin: '0 auto'
        }}>
          <div style={{
            height: '280px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {templateImages.map((image, index) => (
              <div 
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentImageIndex ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  zIndex: index === currentImageIndex ? 1 : 0
                }}
              >
                <img 
                  src={image.src} 
                  alt={image.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: '20px 15px',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    color: 'white',
                    margin: 0,
                    fontWeight: '400',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {image.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Image navigation dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          {templateImages.map((_, index) => (
            <div 
              key={index}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: index === currentImageIndex ? colors.lightPurple : '#444',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
        
        {/* Simple How It Works Section */}
        <div style={{
          backgroundColor: colors.cardBg,
          borderRadius: '8px',
          padding: '1rem',
          maxWidth: '800px',
          margin: '10px auto',
          flex: '0 0 auto'
        }}>
          <h3 style={{
            textAlign: 'center',
            color: colors.lightPurple,
            marginBottom: '1rem',
            fontWeight: '300',
            fontSize: '1.2rem'
          }}>
            How It Works
          </h3>
          
          <div className="row text-center">
            <div className="col-3">
              <i className="fas fa-upload" style={{color: colors.lightPurple, fontSize: '1.3rem'}}></i>
              <p style={{color: 'white', marginTop: '5px', fontSize: '0.8rem'}}>Upload</p>
            </div>
            <div className="col-3">
              <i className="fas fa-list" style={{color: colors.lightPurple, fontSize: '1.3rem'}}></i>
              <p style={{color: 'white', marginTop: '5px', fontSize: '0.8rem'}}>Select</p>
            </div>
            <div className="col-3">
              <i className="fas fa-images" style={{color: colors.lightPurple, fontSize: '1.3rem'}}></i>
              <p style={{color: 'white', marginTop: '5px', fontSize: '0.8rem'}}>Templates</p>
            </div>
            <div className="col-3">
              <i className="fas fa-magic" style={{color: colors.lightPurple, fontSize: '1.3rem'}}></i>
              <p style={{color: 'white', marginTop: '5px', fontSize: '0.8rem'}}>Generate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;