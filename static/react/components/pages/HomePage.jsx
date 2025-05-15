import React from 'react';

/**
 * Home page component with simplified visual design for faster building
 */
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero section with gradient background and CTA */}
      <div className="jumbotron" style={{
        background: 'linear-gradient(135deg, #8a2be2 0%, #6a0dad 100%)',
        borderRadius: '15px',
        padding: '4rem 2rem',
        marginBottom: '3rem',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
      }}>
        <h1 className="display-4 mb-3" style={{
          fontWeight: '700',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          <span className="brand-name">VOW</span>BRIDE
        </h1>
        <p className="lead mb-4" style={{fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto'}}>
          Create your dream wedding look with our AI-powered face swap technology
        </p>
        <div className="mt-4">
          <a href="/react#universal-page" className="btn btn-light me-3 px-4 py-2">
            <i className="fas fa-magic me-2"></i> Try Face Swap
          </a>
          <a href="/react#universal-categories" className="btn btn-outline-light px-4 py-2">
            <i className="fas fa-th-large me-2"></i> All Categories
          </a>
        </div>
      </div>

      {/* Wedding ceremonies section */}
      <h2 className="text-center mb-4">Wedding Ceremonies</h2>
      <div className="row mb-5">
        {/* Haldi */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow" style={{
            overflow: 'hidden', 
            borderRadius: '10px',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              height: '200px', 
              background: 'linear-gradient(135deg, #FFA500, #FFD700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-sun fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title brand-name">Haldi</h4>
              <p className="card-text">Pre-wedding turmeric ceremony</p>
              <a href="/react#bridal-swap" className="btn btn-outline-primary btn-sm">
                Try Haldi Look
              </a>
            </div>
          </div>
        </div>
        
        {/* Wedding */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow" style={{
            overflow: 'hidden', 
            borderRadius: '10px',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              height: '200px', 
              background: 'linear-gradient(135deg, #FF416C, #FF4B2B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-heart fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title brand-name">Wedding</h4>
              <p className="card-text">The main wedding ceremony</p>
              <a href="/react#bridal-swap" className="btn btn-outline-primary btn-sm">
                Try Wedding Look
              </a>
            </div>
          </div>
        </div>
        
        {/* Reception */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow" style={{
            overflow: 'hidden', 
            borderRadius: '10px',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              height: '200px', 
              background: 'linear-gradient(135deg, #614385, #516395)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-glass-cheers fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title brand-name">Reception</h4>
              <p className="card-text">Post-wedding celebration</p>
              <a href="/react#bridal-swap" className="btn btn-outline-primary btn-sm">
                Try Reception Look
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main categories */}
      <h2 className="text-center mb-4">Explore Categories</h2>
      <div className="row">
        {/* Bride */}
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card h-100 category-card border-0" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              height: '150px', 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-female fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title mb-2">Bride</h4>
              <p className="card-text small mb-3">Create your perfect bridal look for each ceremony</p>
              <a href="/react#bridal-swap" className="btn btn-sm btn-primary">
                Explore Bride
              </a>
            </div>
          </div>
        </div>
        
        {/* Groom */}
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card h-100 category-card border-0" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              height: '150px', 
              background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-male fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title mb-2">Groom</h4>
              <p className="card-text small mb-3">Visualize yourself in traditional and modern groom outfits</p>
              <a href="/react#groom-face-swap" className="btn btn-sm btn-primary">
                Explore Groom
              </a>
            </div>
          </div>
        </div>
        
        {/* Saloon */}
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card h-100 category-card border-0" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              height: '150px', 
              background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-cut fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title mb-2">Saloon</h4>
              <p className="card-text small mb-3">Discover top-rated saloons and try different hairstyles</p>
              <a href="/react#bride-saloons" className="btn btn-sm btn-primary">
                Explore Saloon
              </a>
            </div>
          </div>
        </div>
        
        {/* Venues */}
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card h-100 category-card border-0" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              height: '150px', 
              background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-building fa-4x" style={{color: 'rgba(255,255,255,0.7)'}}></i>
            </div>
            <div className="card-body text-center">
              <h4 className="card-title mb-2">Venues</h4>
              <p className="card-text small mb-3">Find and compare perfect venues for your wedding</p>
              <a href="/react#venue-search" className="btn btn-sm btn-primary">
                Explore Venues
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="card bg-dark mt-5 mb-5">
        <div className="card-body p-4">
          <h3 className="text-center text-light-purple mb-4">How It Works</h3>
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-icon mb-3">
                  <i className="fas fa-upload fa-2x text-primary"></i>
                </div>
                <h5>1. Upload Photo</h5>
                <p className="small">Upload your face photo to get started</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-icon mb-3">
                  <i className="fas fa-list fa-2x text-info"></i>
                </div>
                <h5>2. Select Category</h5>
                <p className="small">Choose from bride, groom or saloon options</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-icon mb-3">
                  <i className="fas fa-images fa-2x text-warning"></i>
                </div>
                <h5>3. Pick Templates</h5>
                <p className="small">Select one or multiple templates</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-icon mb-3">
                  <i className="fas fa-magic fa-2x text-success"></i>
                </div>
                <h5>4. Generate Results</h5>
                <p className="small">View and download your personalized results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access links */}
      <div className="p-4 mb-4" style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(106, 13, 173, 0.2))',
        borderRadius: '10px'
      }}>
        <h4 className="text-center mb-4">Quick Access</h4>
        <div className="row g-3 text-center">
          <div className="col-6 col-md-3">
            <a href="/react#bridal-swap" className="btn btn-outline-light w-100">
              <i className="fas fa-female me-2"></i> Bride
            </a>
          </div>
          <div className="col-6 col-md-3">
            <a href="/react#groom-face-swap" className="btn btn-outline-light w-100">
              <i className="fas fa-male me-2"></i> Groom
            </a>
          </div>
          <div className="col-6 col-md-3">
            <a href="/react#bride-saloons" className="btn btn-outline-light w-100">
              <i className="fas fa-cut me-2"></i> Saloon
            </a>
          </div>
          <div className="col-6 col-md-3">
            <a href="/react#universal-page" className="btn btn-outline-light w-100">
              <i className="fas fa-th me-2"></i> Universal
            </a>
          </div>
        </div>
      </div>

      {/* Custom CSS for additional effects */}
      <style>
        {`
          .category-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          
          .process-step {
            padding: 20px 10px;
            background-color: rgba(255,255,255,0.05);
            border-radius: 10px;
            height: 100%;
          }
          
          .card {
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;