import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import HomePage from './pages/HomePage';
import BridalSwapPage from './pages/BridalSwapPage';
import BridalGalleryPage from './pages/BridalGalleryPage';
import UniversalSwapPage from './pages/UniversalSwapPage';
import UniversalPage from './pages/UniversalPage';

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
    
    // Update URL hash for deep linking
    window.location.hash = page;
    
    // For mobile views, close sidebar after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Initialize sidebar state based on window size
  useEffect(() => {
    // Set initial sidebar state (closed by default)
    setSidebarOpen(false);
    
    // Check for hash in URL first (for deep linking)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveItem(hash);
      setCurrentPage(hash);
      return;
    }
    
    // Determine initial active page based on current URL path
    const path = window.location.pathname;
    if (path.includes('bridal-gallery')) {
      setActiveItem('bridal-gallery');
      setCurrentPage('bridal-gallery');
    } else if (path.includes('bridal-swap')) {
      setActiveItem('bridal-swap');
      setCurrentPage('bridal-swap');
    } else {
      setActiveItem('home');
      setCurrentPage('home');
    }
  }, []);

  // Render the appropriate page component based on currentPage
  const renderPageContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'bridal-swap':
        return <BridalSwapPage />;
      case 'bridal-gallery':
        return <BridalGalleryPage />;
      case 'face-swap-page':
        return <UniversalSwapPage category="auto" />;
      case 'groom-face-swap':
        return <UniversalSwapPage category="groom" />;
      case 'bride-saloons':
        return <UniversalSwapPage category="bride-saloon" />;
      case 'groom-saloons':
        return <UniversalSwapPage category="groom-saloon" />;
      case 'makeup-artists':
        return <UniversalSwapPage category="bride-saloon" />;
      case 'all-categories':
        return <UniversalPage />;
      default:
        // For pages that don't have dedicated components yet
        return <MainContent currentPage={currentPage} />;
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar-wrapper">
        <Sidebar 
          isOpen={sidebarOpen} 
          activeItem={activeItem}
          onNavigation={handleNavigation}
        />
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className={`fas fa-chevron-${sidebarOpen ? 'right' : 'left'}`} style={{ color: '#a27bdc' }}></i>
        </button>
      </div>
      <div className="main-container">
        <div className="content-container">
          {renderPageContent()}
        </div>
      </div>
      
      {/* Custom CSS for sidebar accordion */}
      <style>
        {`
          .sidebar {
            max-height: 100vh;
            overflow-y: auto;
            position: relative;
          }
          
          .sidebar-content {
            overflow-y: auto;
            max-height: calc(100vh - 60px);
          }
          
          .app-container {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
          }
          
          .main-container {
            flex-grow: 1;
            overflow-y: auto;
            padding: 0;
            position: relative;
          }
          
          .sidebar-wrapper {
            position: relative;
            height: 100vh;
            display: flex;
          }
          
          .sidebar-toggle {
            position: absolute;
            left: calc(100% - 1px);
            top: 50%;
            transform: translateY(-50%);
            background-color: #2e2e2e;
            border: none;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            padding: 10px 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1031;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
            border-left: 1px solid #494949;
            width: 24px;
            height: 40px;
          }
          
          .section-header {
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            margin-bottom: 2px;
          }
          
          .section-header:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .menu-section .collapse {
            display: none;
            height: 0;
            overflow: hidden;
            transition: height 0.3s ease;
          }
          
          .menu-section .show {
            display: block;
            height: auto;
          }
        `}
      </style>
    </div>
  );
};

export default App;