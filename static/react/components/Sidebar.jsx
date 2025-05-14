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
  
  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        // Use hardcoded menu structure to avoid API calls
        const defaultMenu = [
          {
            id: 'home',
            title: 'Home',
            icon: 'fa-home',
            subItems: [
              { id: 'home', label: 'Home', link: '/react' }
            ]
          },
          {
            id: 'bride',
            title: 'Bride',
            icon: 'fa-female',
            subItems: [
              { id: 'bridal-gallery', label: 'Bridal Gallery', link: '/react#bridal-gallery' },
              { id: 'bridal-swap', label: 'Create Bride Look', link: '/react#bridal-swap' },
              { id: 'bridal-outfits', label: 'Bridal Outfits', link: '/react#bridal-outfits' },
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
            id: 'services',
            title: 'Services',
            icon: 'fa-concierge-bell',
            subItems: [
              { id: 'venue-search', label: 'Venue Search', link: '/react#venue-search' },
              { id: 'hall-comparison', label: 'Hall Comparison', link: '/react#hall-comparison' },
              { id: 'virtual-tours', label: 'Virtual Tours', link: '/react#virtual-tours' },
              { id: 'booking-management', label: 'Booking Management', link: '/react#booking-management' },
              { id: 'saloons', label: 'Saloons', link: '/react#saloons' },
              { id: 'event-managers', label: 'Event Managers', link: '/react#event-managers' }
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
    
    // Use history API for navigation without page reload
    window.history.pushState({}, '', link);
    
    // Dispatch a custom event to notify about route change
    const event = new CustomEvent('routeChange', { detail: { path: link } });
    window.dispatchEvent(event);
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
            <div key={section.id} className="menu-section">
              <div className="section-header">
                <i className={`fas ${section.icon}`}></i>
                <span>{section.title}</span>
              </div>
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
          ))
        ) : (
          <p className="text-center text-secondary py-4">No menu items available</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;