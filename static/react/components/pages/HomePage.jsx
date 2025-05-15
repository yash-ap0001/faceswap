import React from 'react';

/**
 * Home page component with enhanced visual design and improved layout
 */
const HomePage = () => {
  // Ceremony types for the showcase section
  const ceremonyTypes = [
    { 
      name: 'Haldi',
      image: '/static/results/result_1747231562_haldi_5.jpg',
      description: 'Pre-wedding turmeric ceremony',
      link: '/react#bridal-swap'
    },
    { 
      name: 'Wedding',
      image: '/static/results/result_1747228356_haldi_2.jpg',
      description: 'The main wedding ceremony',
      link: '/react#bridal-swap'
    },
    { 
      name: 'Reception',
      image: '/static/results/result_1747229942_wedding_3.jpg',
      description: 'Post-wedding celebration',
      link: '/react#bridal-swap'
    }
  ];

  // Categories for the main features section
  const categories = [
    {
      title: 'Bride',
      image: '/static/results/result_1747229949_wedding_5.jpg',
      description: 'Create your perfect bridal look for each ceremony with our AI-powered face swap',
      link: '/react#bridal-swap',
      icon: 'fa-female',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
    },
    {
      title: 'Groom',
      image: '/static/results/result_1747229953_wedding_6.jpg',
      description: 'Visualize yourself in traditional and modern groom outfits for your special day',
      link: '/react#groom-face-swap',
      icon: 'fa-male',
      color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    {
      title: 'Saloon',
      image: '/static/images/placeholder_saloon.jpg',
      description: 'Discover top-rated saloons and try different hairstyles and makeup looks',
      link: '/react#bride-saloons',
      icon: 'fa-cut',
      color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    },
    {
      title: 'Venues',
      image: '/static/templates/bride/makeup/natural/39f677a83cef33bddbc009a6b4a4b590.jpg',
      description: 'Find and compare perfect venues for your wedding ceremonies',
      link: '/react#venue-search',
      icon: 'fa-building',
      color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero section with gradient overlay and CTA */}
      <div className="hero-section" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/static/templates/bride/makeup/natural/4ea63131c2229217909c0eb9167437cb.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '15px',
        padding: '4rem 2rem',
        marginBottom: '3rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 className="display-4 mb-3" style={{
          fontWeight: '700',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          <span className="brand-name">VOW</span>BRIDE
        </h1>
        <p className="lead mb-4" style={{fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'}}>
          Create your dream wedding look with our AI-powered face swap technology
        </p>
        <div className="btn-group-lg mt-4">
          <a href="/react#universal-page" className="btn btn-primary me-3 rounded-pill px-4 py-2">
            <i className="fas fa-magic me-2"></i> Try Face Swap
          </a>
          <a href="/react#universal-categories" className="btn btn-outline-light rounded-pill px-4 py-2">
            <i className="fas fa-th-large me-2"></i> All Categories
          </a>
        </div>
      </div>

      {/* Featured ceremony types with images */}
      <h2 className="text-center mb-4">Wedding Ceremonies</h2>
      <div className="ceremony-cards mb-5">
        <div className="row">
          {ceremonyTypes.map((ceremony, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow" style={{overflow: 'hidden', borderRadius: '10px'}}>
                <div style={{height: '250px', overflow: 'hidden'}}>
                  <img 
                    src={ceremony.image} 
                    alt={ceremony.name} 
                    className="card-img-top" 
                    style={{
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.5s ease'
                    }} 
                  />
                </div>
                <div className="card-body text-center">
                  <h4 className="card-title brand-name">{ceremony.name}</h4>
                  <p className="card-text">{ceremony.description}</p>
                  <a href={ceremony.link} className="btn btn-outline-primary btn-sm">
                    Try {ceremony.name} Look
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main categories with improved visual design */}
      <h2 className="text-center mb-4">Explore Categories</h2>
      <div className="row">
        {categories.map((category, index) => (
          <div key={index} className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100 category-card border-0" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div className="category-image-container" style={{height: '200px', position: 'relative', overflow: 'hidden'}}>
                <div className="category-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: category.color,
                  opacity: 0.3,
                  zIndex: 1
                }}></div>
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="card-img-top" 
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    transition: 'transform 0.5s ease'
                  }} 
                />
                <div className="category-icon" style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <i className={`fas ${category.icon} fa-lg`} style={{color: 'white'}}></i>
                </div>
              </div>
              <div className="card-body text-center">
                <h4 className="card-title mb-2">{category.title}</h4>
                <p className="card-text small mb-3">{category.description}</p>
                <a href={category.link} className="btn btn-sm btn-primary">
                  Explore {category.title}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works section */}
      <div className="card bg-dark mt-5 mb-5">
        <div className="card-body p-4">
          <h3 className="text-center text-light-purple mb-4">How It Works</h3>
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-icon mb-3">
                  <i className="fas fa-upload fa-2x text-primary"></i>
                </div>
                <h5>Upload Photo</h5>
                <p className="small">Upload your face photo to get started</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-icon mb-3">
                  <i className="fas fa-list fa-2x text-info"></i>
                </div>
                <h5>Select Category</h5>
                <p className="small">Choose from bride, groom or saloon options</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-icon mb-3">
                  <i className="fas fa-images fa-2x text-warning"></i>
                </div>
                <h5>Pick Templates</h5>
                <p className="small">Select one or multiple templates</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-icon mb-3">
                  <i className="fas fa-magic fa-2x text-success"></i>
                </div>
                <h5>Generate Results</h5>
                <p className="small">View and download your personalized results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access links */}
      <div className="quick-links-section p-4 mb-4" style={{
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
          .hero-section {
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }
          
          .category-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          
          .category-card:hover img {
            transform: scale(1.05);
          }
          
          .step-number {
            background: var(--primary-color);
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-weight: bold;
          }
          
          .process-step {
            padding: 20px 10px;
            background-color: rgba(255,255,255,0.05);
            border-radius: 10px;
            height: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;