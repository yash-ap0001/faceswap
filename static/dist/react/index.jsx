import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Find the root element where the React app will be mounted
  const container = document.getElementById('react-root');
  
  // Only initialize if the container exists
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
    console.log('React app initialized');
  } else {
    console.log('React root element not found');
  }
});