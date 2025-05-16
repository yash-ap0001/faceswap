import React from 'react';

const VowBadge = () => (
  <div
    style={{
      position: 'absolute',
      top: 24,
      left: 24,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 24px',
      borderRadius: '16px',
      fontWeight: 700,
      fontSize: '1.2rem',
      letterSpacing: '0.1em',
      background: 'rgba(34, 18, 60, 0.85)', // subtle dark background for contrast
      boxShadow: '0 2px 8px rgba(58,28,113,0.10)'
    }}
  >
    <span style={{
      fontWeight: 700,
      marginRight: 8,
      background: 'linear-gradient(90deg, #3a1c71 0%, #d76d77 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent',
      display: 'inline-block'
    }}>VOW</span>
    <span style={{ fontWeight: 700, color: '#fff', fontStyle: 'italic' }}>BRIDE</span>
  </div>
);

export default VowBadge; 