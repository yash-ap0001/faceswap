import React, { useState, useEffect } from 'react';

/**
 * Sidebar component with navigation links
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {string} props.activeItem - The currently active menu item
 * @param {Function} props.onNavigation - Handler for navigation changes
 */
const Sidebar = ({ isOpen, activeItem, onNavigation }) => {
  // State to store menu data
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track which accordion section is open (default to "bride")
  const [openSection, setOpenSection] = useState('bride');
  
  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        // Use hardcoded menu structure without Home item
        const defaultMenu = [
          {
            id: 'universal',
            title: 'Universal',
            icon: 'fa-magic',
            subItems: [
              { id: 'universal-categories', label: 'All Categories', link: '/react#universal-categories' }
            ]
          },
          {
            id: 'settings',
            title: 'Settings',
            icon: 'fa-cog',
            subItems: [
              { id: 'face-swap-selection', label: 'Face Swap Selection', link: '/universal' }
            ]
          },
          {
            id: 'bride',
            title: 'Bride',
            icon: 'fa-female',
            subItems: [
              { id: 'bridal-gallery', label: 'Bridal Gallery', link: '/react#bridal-gallery' },
              { id: 'bridal-swap', label: 'Create Bride Look', link: '/react#bridal-swap' },
              { id: 'outfits-for-girls', label: 'Outfits for Girls', link: '/react#outfits-for-girls' },
              { id: 'jewelry-collections', label: 'Jewelry Collections', link: '/react#jewelry-collections' },
              { id: 'makeup-styles', label: 'Makeup Styles', link: '/react#makeup-styles' }
            ]
          },
          {
            id: 'groom',
            title: 'Groom',
            icon: 'fa-male',
            subItems: [
              { id: 'groom-face-swap', label: 'Create Groom Look', link: '/react#groom-face-swap' },
              { id: 'traditional-wear', label: 'Traditional Wear', link: '/react#traditional-wear' },
              { id: 'modern-suits', label: 'Modern Suits', link: '/react#modern-suits' },
              { id: 'groom-accessories', label: 'Accessories', link: '/react#groom-accessories' }
            ]
          },
          {
            id: 'saloons',
            title: 'Saloons',
            icon: 'fa-cut',
            subItems: [
              { id: 'bride-saloons', label: 'Bride Saloons', link: '/react#bride-saloons' },
              { id: 'groom-saloons', label: 'Groom Saloons', link: '/react#groom-saloons' },
              { id: 'makeup-artists', label: 'Makeup Artists', link: '/react#makeup-artists' },
              { id: 'saloon-packages', label: 'Saloon Packages', link: '/react#saloon-packages' }
            ]
          },
          {
            id: 'services',
            title: 'Services',
            icon: 'fa-concierge-bell',
            subItems: [
              { id: 'venue-search', label: 'Venue Search', link: '/react#venue-search' },
              { id: 'catering-list', label: 'Catering List', link: '/react#catering-list' },
              { id: 'event-managers', label: 'Event Managers', link: '/react#event-managers' },
              { id: 'photographers', label: 'Photographers', link: '/react#photographers' }
            ]
          }
        ];
        
        setMenuItems(defaultMenu);
        setError(null);
      } catch (err) {
        console.error('Error setting menu data:', err);
        setError('Failed to load menu data. Please try again later.');
        // Menu already set above, no need for fallback
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuData();
  }, []);

  // Handle menu item click
  const handleItemClick = (id, link) => {
    onNavigation(id);
    
    // Check if it's an external link (doesn't start with /react)
    if (!link.startsWith('/react')) {
      // For external links, redirect the browser
      window.location.href = link;
    } else {
      // Use history API for navigation without page reload for React routes
      window.history.pushState({}, '', link);
      
      // Dispatch a custom event to notify about route change
      const event = new CustomEvent('routeChange', { detail: { path: link } });
      window.dispatchEvent(event);
    }
  };
  
  // Toggle accordion section
  const toggleSection = (sectionId) => {
    setOpenSection(prev => prev === sectionId ? null : sectionId);
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h5>Menu</h5>
        </div>
        <div className="sidebar-content text-center py-4">
          <div className="spinner-border text-light-purple" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h5>Menu</h5>
        </div>
        <div className="sidebar-content text-center py-4">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Render menu
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h5>Menu</h5>
      </div>
      <div className="sidebar-content">
        {menuItems.length > 0 ? (
          menuItems.map((section) => (
            <div key={section.id} className="menu-section accordion-item border-0">
              <div 
                className="section-header" 
                onClick={() => toggleSection(section.id)}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <i className={`fas ${section.icon} me-2`}></i>
                    <span>{section.title}</span>
                  </div>
                  <i className={`fas fa-chevron-${openSection === section.id ? 'up' : 'down'} small`}></i>
                </div>
              </div>
              <div className={openSection === section.id ? 'show' : 'collapse'}>
                <ul className="menu-items">
                  {section.subItems.map((item) => (
                    <li 
                      key={item.id} 
                      className={activeItem === item.id ? 'active' : ''}
                      onClick={() => handleItemClick(item.id, item.link)}
                    >
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-secondary py-4">No menu items available</p>
        )}
      </div>
      
      {/* CSS added to App.jsx stylesheet */}
    </div>
  );
};

export default Sidebar;