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

  // Calculate button styles based on sidebar state
  const sidebarButtonStyle = {
    left: sidebarOpen ? '230px' : '0',
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'linear-gradient(135deg, #5c2a91 0%, #3b1862 100%)',
    border: 'none',
    borderRadius: '0 50px 50px 0',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '1031',
    boxShadow: '3px 0 10px rgba(0, 0, 0, 0.4)',
    width: '28px',
    height: '56px',
    transition: 'left 0.3s ease',
    outline: 'none',
    marginLeft: '0'
  };
  
  // Calculate main container styles based on sidebar state
  const mainContainerStyle = {
    marginLeft: sidebarOpen ? '230px' : '0',
    width: sidebarOpen ? 'calc(100% - 230px)' : '100%',
    transition: 'margin-left 0.3s ease, width 0.3s ease',
  };

  return (
    <div className="app-container">
      <div className="sidebar-wrapper" style={{ 
        width: sidebarOpen ? '230px' : '0', 
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1030,
        transition: 'width 0.3s ease',
        backgroundColor: '#2b1744'
      }}>
        <Sidebar 
          isOpen={sidebarOpen} 
          activeItem={activeItem}
          onNavigation={handleNavigation}
        />
      </div>
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={sidebarButtonStyle}
      >
        <i 
          className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`} 
          style={{ 
            color: 'white', 
            fontSize: '14px',
            marginLeft: sidebarOpen ? '-2px' : '2px',
            width: '14px',
            textAlign: 'center'
          }}
        ></i>
      </button>
      <div className="main-container" style={mainContainerStyle}>
        <div className="content-container">
          {renderPageContent()}
        </div>
      </div>
      
      {/* Custom CSS for sidebar accordion */}
      <style>
        {`
          .sidebar {
            height: 100vh;
            position: relative;
            background-color: #2b1744;
            width: 230px;
          }
          
          .sidebar-content {
            overflow-y: auto;
            max-height: calc(100vh - 60px);
            padding-bottom: 20px;
            scrollbar-width: thin;
            scrollbar-color: #5c2a91 #2b1744;
          }
          
          .sidebar-content::-webkit-scrollbar {
            width: 8px;
          }
          
          .sidebar-content::-webkit-scrollbar-track {
            background: #2b1744;
          }
          
          .sidebar-content::-webkit-scrollbar-thumb {
            background-color: #5c2a91;
            border-radius: 20px;
            border: 2px solid #2b1744;
          }
          
          .app-container {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
          }
          
          .main-container {
            overflow-y: auto;
            padding: 0;
            position: relative;
            height: 100vh;
          }
          
          .sidebar-wrapper {
            position: fixed;
            height: 100vh;
            left: 0;
            top: 0;
            z-index: 1030;
            transition: width 0.3s ease;
            background-color: #2b1744;
            overflow-x: hidden;
          }
          
          .section-header {
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            margin: 0 0.5rem 2px 0.5rem;
            background-color: #2b1744;
            color: white;
            font-weight: 500;
          }
          
          .sidebar-header {
            padding: 15px;
            background-color: #2b1744;
            border-bottom: 1px solid #3d2161;
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
          
          .menu-items {
            list-style: none;
            padding: 0;
            margin: 0 0 0.5rem 0;
          }
          
          .menu-items li {
            padding: 0.5rem 1rem 0.5rem 2rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            margin: 2px 0.5rem;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
          }
          
          .menu-items li:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
          }
          
          .menu-items li.active {
            background-color: #5c2a91;
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default App;