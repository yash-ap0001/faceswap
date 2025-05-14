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
    const fetchPageContent = async () => {
      setLoading(true);
      
      try {
        // First, try to find existing content in the DOM
        const contentElement = document.querySelector('.page-content');
        if (contentElement) {
          setPageContent(contentElement.innerHTML);
          setLoading(false);
          return;
        }
        
        // If not found in DOM, fetch from API
        const response = await fetch(`/api/content/${currentPage}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch page content: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Create HTML content from API response
        const htmlContent = `
          <div class="page-header">
            <h1>${data.title}</h1>
          </div>
          <div class="page-body">
            ${data.content}
          </div>
        `;
        
        setPageContent(htmlContent);
      } catch (error) {
        console.error('Error fetching page content:', error);
        setPageContent(`
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error Loading Content</h4>
            <p>Failed to load page content. Please try again later.</p>
            <hr>
            <p class="mb-0">Error details: ${error.message}</p>
          </div>
        `);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentPage) {
      fetchPageContent();
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