import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

/**
 * Main App component that manages the application layout and state
 */
const App = () => {
  // State to manage sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State to track active menu item
  const [activeItem, setActiveItem] = useState(null);
  // State to track current page content
  const [currentPage, setCurrentPage] = useState('home');

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle navigation changes
  const handleNavigation = (page) => {
    setCurrentPage(page);
    setActiveItem(page);
    
    // For mobile views, close sidebar after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Initialize sidebar state based on window size
  useEffect(() => {
    // Set initial sidebar state (closed by default)
    setSidebarOpen(false);
    
    // Determine initial active page based on current URL path
    const path = window.location.pathname;
    if (path.includes('bridal_gallery')) {
      setActiveItem('bridal_gallery');
      setCurrentPage('bridal_gallery');
    } else if (path.includes('bridal_swap')) {
      setActiveItem('bridal_swap');
      setCurrentPage('bridal_swap');
    } else {
      setActiveItem('home');
      setCurrentPage('home');
    }
  }, []);

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        activeItem={activeItem}
        onNavigation={handleNavigation}
      />
      <div className="main-container">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? '◄' : '►'}
        </button>
        <MainContent 
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default App;