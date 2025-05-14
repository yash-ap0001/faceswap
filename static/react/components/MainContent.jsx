import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import BridalGallery from './pages/BridalGallery';
import BridalSwap from './pages/BridalSwap';
import LoadingIndicator from './common/LoadingIndicator';

/**
 * Main content component that renders different pages based on current route
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPage - Current page identifier
 */
const MainContent = ({ currentPage }) => {
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState(null);

  // Effect to handle page changes
  useEffect(() => {
    setLoading(true);
    
    // Simulating page content loading
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
    // Load existing page content if available
    const contentElement = document.querySelector('.page-content');
    if (contentElement) {
      setPageContent(contentElement.innerHTML);
    }
  }, [currentPage]);

  // Add event listener for route changes
  useEffect(() => {
    const handleRouteChange = async (event) => {
      setLoading(true);
      
      try {
        // Get new page content using fetch
        const response = await fetch(event.detail.path);
        const html = await response.text();
        
        // Create a temporary element to extract content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find main content in the fetched HTML
        const mainContent = tempDiv.querySelector('.page-content') || 
                           tempDiv.querySelector('main') || 
                           tempDiv.querySelector('.container');
                           
        if (mainContent) {
          setPageContent(mainContent.innerHTML);
        } else {
          console.error('Could not find main content in fetched page');
        }
      } catch (error) {
        console.error('Error fetching page content:', error);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('routeChange', handleRouteChange);
    return () => window.removeEventListener('routeChange', handleRouteChange);
  }, []);

  // Render appropriate component based on current page
  const renderPage = () => {
    if (loading) {
      return <LoadingIndicator />;
    }

    if (pageContent) {
      return <div dangerouslySetInnerHTML={{ __html: pageContent }} />;
    }

    // Fallback to React components for specific pages
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'bridal_gallery':
        return <BridalGallery />;
      case 'bridal_swap':
        return <BridalSwap />;
      default:
        return <div className="error-page">Page not found</div>;
    }
  };

  return (
    <main className="content">
      {renderPage()}
    </main>
  );
};

export default MainContent;