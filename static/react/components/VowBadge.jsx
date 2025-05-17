import React from 'react';
import './Badge.css';

const VowBadge = ({ onClick }) => (
  <div
    className="badge-corner badge-left"
    onClick={() => {
      if (onClick) onClick();
      window.location.hash = 'home';
    }}
    title="Go to Home - Bride Face Swap"
  >
    <div style={{display: 'flex', alignItems: 'center'}}>
      <span style={{
        fontWeight: 700,
        marginRight: 8,
        background: 'linear-gradient(90deg, #3a1c71 0%, #d76d77 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        display: 'inline-block'
      }}>BRIDE</span>
      <span style={{ fontWeight: 700, color: '#fff', fontStyle: 'italic' }}>FACE SWAP</span>
    </div>
  </div>
);

// Add right corner promotion badge
const RightCornerBadge = () => (
  <div className="badge-corner badge-right">
    by <a href="https://yashaitech.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d76d77', textDecoration: 'none', fontWeight: 600 }}>yashAitech.com</a> | <span style={{ color: '#fff', marginLeft: 6 }}>yash@yashaitech.com</span>
  </div>
);

export { VowBadge, RightCornerBadge }; 