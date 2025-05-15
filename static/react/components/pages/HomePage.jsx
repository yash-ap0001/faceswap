import React from 'react';

/**
 * Home page component with very clean and minimal design
 * Using template images and dark purple theme
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

  return (
    <div className="home-page" style={{backgroundColor: '#121212', padding: '20px 0'}}>
      {/* Simple header with logo */}
      <div style={{
        backgroundColor: colors.darkPurple,
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        borderRadius: '8px'
      }}>
        <h1 style={{
          fontWeight: '700',
          color: 'white',
          margin: 0
        }}>
          VOW<span style={{fontWeight: '300'}}>BRIDE</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          margin: '0.5rem 0 0'
        }}>
          AI-Powered Face Swap
        </p>
      </div>

      {/* Template grid - Clean, minimal layout */}
      <div className="container px-4">
        <h3 style={{
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: colors.lightPurple,
          fontWeight: '300'
        }}>
          Wedding Templates
        </h3>
        
        <div className="row g-4">
          {/* Haldi Template */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '180px',
                overflow: 'hidden',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <img 
                  src="/static/results/result_1747231562_haldi_5.jpg" 
                  alt="Haldi"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top'
                  }}
                />
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Haldi
              </h5>
            </div>
          </div>
          
          {/* Wedding Template */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '180px',
                overflow: 'hidden',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <img 
                  src="/static/results/result_1747229949_wedding_5.jpg" 
                  alt="Wedding"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top'
                  }}
                />
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Wedding
              </h5>
            </div>
          </div>
          
          {/* Reception Template */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '180px',
                overflow: 'hidden',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <img 
                  src="/static/results/result_1747229942_wedding_3.jpg" 
                  alt="Reception"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top'
                  }}
                />
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Reception
              </h5>
            </div>
          </div>
          
          {/* Mehendi Template */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '180px',
                overflow: 'hidden',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <img 
                  src="/static/templates/bride/makeup/natural/4ea63131c2229217909c0eb9167437cb.jpg" 
                  alt="Mehendi"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top'
                  }}
                />
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Mehendi
              </h5>
            </div>
          </div>
        </div>
        
        {/* Spacer */}
        <div style={{height: '40px'}}></div>
        
        {/* Categories Section */}
        <h3 style={{
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: colors.lightPurple,
          fontWeight: '300'
        }}>
          Categories
        </h3>
        
        <div className="row g-4">
          {/* Bride Category */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.darkPurple,
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <i className="fas fa-female fa-3x" style={{color: 'rgba(255,255,255,0.9)'}}></i>
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Bride
              </h5>
            </div>
          </div>
          
          {/* Groom Category */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.darkPurple,
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <i className="fas fa-male fa-3x" style={{color: 'rgba(255,255,255,0.9)'}}></i>
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Groom
              </h5>
            </div>
          </div>
          
          {/* Saloon Category */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.darkPurple,
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <i className="fas fa-cut fa-3x" style={{color: 'rgba(255,255,255,0.9)'}}></i>
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Saloon
              </h5>
            </div>
          </div>
          
          {/* Venues Category */}
          <div className="col-6 col-md-3">
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '12px',
              height: '100%',
              border: `1px solid ${colors.darkPurple}20`
            }}>
              <div style={{
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.darkPurple,
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <i className="fas fa-building fa-3x" style={{color: 'rgba(255,255,255,0.9)'}}></i>
              </div>
              <h5 style={{
                textAlign: 'center',
                color: colors.lightPurple,
                margin: 0,
                fontSize: '1rem'
              }}>
                Venues
              </h5>
            </div>
          </div>
        </div>
        
        {/* Simple How It Works Section */}
        <div style={{
          backgroundColor: colors.cardBg,
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '40px',
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