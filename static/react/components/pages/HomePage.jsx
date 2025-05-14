import React from 'react';

/**
 * Home page component
 */
const HomePage = () => {
  return (
    <div className="home-page">
      <div className="jumbotron">
        <h1>VowBride Wedding Planner</h1>
        <p className="lead">
          Transform your wedding planning experience with our AI-powered platform
        </p>
        <div className="mt-4">
          <a href="/bridal-swap" className="btn btn-primary me-2">
            <i className="fas fa-magic me-1"></i> Create Bride Look
          </a>
          <a href="/groom-face-swap" className="btn btn-outline-light">
            <i className="fas fa-user-tie me-1"></i> Create Groom Look
          </a>
        </div>
      </div>
      
      <div className="row mt-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Our AI-Powered Features</h2>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <i className="fas fa-female"></i>
          <h3>Bride Section</h3>
          <p>Explore bridal templates and create your perfect bridal look with AI face swap technology</p>
          <div className="mt-3">
            <a href="/bridal-gallery" className="btn btn-sm btn-outline-primary">Browse Gallery</a>
          </div>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-male"></i>
          <h3>Groom Section</h3>
          <p>Browse groom styles and visualize your wedding attire with our face swap technology</p>
          <div className="mt-3">
            <a href="/traditional-wear" className="btn btn-sm btn-outline-primary">Browse Styles</a>
          </div>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-concierge-bell"></i>
          <h3>Services</h3>
          <p>Find venues, saloons, and event managers for your wedding all in one place</p>
          <div className="mt-3">
            <a href="/venue-search" className="btn btn-sm btn-outline-primary">Find Services</a>
          </div>
        </div>
      </div>
      
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-dark">
            <div className="card-body text-center p-4">
              <h3 className="text-light-purple mb-3">New React-Powered Experience</h3>
              <p>You're experiencing our new React-based interface with:</p>
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="mb-3">
                    <i className="fas fa-bolt fa-2x text-warning"></i>
                  </div>
                  <h5>Faster Navigation</h5>
                  <p className="small">No page reloads when navigating between sections</p>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <i className="fas fa-mobile-alt fa-2x text-info"></i>
                  </div>
                  <h5>Responsive Design</h5>
                  <p className="small">Optimized experience on all devices</p>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <i className="fas fa-paint-brush fa-2x text-success"></i>
                  </div>
                  <h5>Modern UI</h5>
                  <p className="small">Clean, intuitive interface for easier navigation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;