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
  // Track which accordion section is open (default to "universal")
  const [openSection, setOpenSection] = useState('universal');
  
  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        
        // Actually fetch menu from API instead of using hardcoded values
        const response = await fetch('/api/menu');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch menu: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Menu data from API:', data);
        
        if (data && data.menu && Array.isArray(data.menu)) {
          setMenuItems(data.menu);
        } else {
          throw new Error('Invalid menu data format from API');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu data. Please try again later.');
        
        // Fallback to hardcoded menu if API fails
        const defaultMenu = [
          {
            id: 'universal',
            title: 'Universal',
            icon: 'fa-magic',
            subItems: [
              { id: 'universal-page', label: 'Universal Categories', link: '/react/universal' },
              { id: 'universal-swap', label: 'Universal Face Swap', link: '/react/universal-swap' }
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
          }
        ];
        setMenuItems(defaultMenu);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuData();
  }, []);

  // Handle menu item click
  const handleItemClick = (id, link) => {
    onNavigation(id);
    
    // Check if the link is a direct URL (not a hash route)
    if (link.includes('/react/') && !link.includes('#')) {
      // For direct links like /react/universal, use regular navigation
      window.location.href = link;
    } else {
      // For hash routes, use history API for navigation without page reload
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