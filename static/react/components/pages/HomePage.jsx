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
      </div>
      
      <div className="features">
        <div className="feature-card">
          <i className="fas fa-female"></i>
          <h3>Bride Section</h3>
          <p>Explore bridal templates and create your perfect bridal look</p>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-male"></i>
          <h3>Groom Section</h3>
          <p>Browse groom styles and visualize your wedding attire</p>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-concierge-bell"></i>
          <h3>Services</h3>
          <p>Find venues, saloons, and event managers for your wedding</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;