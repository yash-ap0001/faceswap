import React from 'react';

function HomePage() {
  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>Welcome to FaceSwap AI</h1>
        <p>Transform your photos with our advanced AI technology</p>
      </header>
      
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Face Swapping</h3>
            <p>Swap faces in photos with our advanced AI technology</p>
          </div>
          <div className="feature-card">
            <h3>Style Transfer</h3>
            <p>Apply different styles to your photos</p>
          </div>
          <div className="feature-card">
            <h3>Photo Enhancement</h3>
            <p>Enhance your photos with our AI tools</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage; 