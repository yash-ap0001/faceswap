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
        const response = await fetch('/api/menu');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch menu data: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.menu) {
          setMenuItems(data.menu);
        } else {
          throw new Error('Invalid menu data structure');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu data. Please try again later.');
        // Fallback to default menu items if API fails
        setMenuItems([
          {
            id: 'home',
            title: 'Home',
            icon: 'fa-home',
            subItems: [
              { id: 'home', label: 'Home', link: '/' }
            ]
          },
          {
            id: 'bride',
            title: 'Bride',
            icon: 'fa-female',
            subItems: [
              { id: 'bridal-gallery', label: 'Bridal Gallery', link: '/bridal-gallery' },
              { id: 'bridal-swap', label: 'Create Bride Look', link: '/bridal-swap' },
              { id: 'bridal-outfits', label: 'Bridal Outfits', link: '/bridal-outfits' },
              { id: 'jewelry-collections', label: 'Jewelry Collections', link: '/jewelry-collections' },
              { id: 'makeup-styles', label: 'Makeup Styles', link: '/makeup-styles' }
            ]
          },
          {
            id: 'groom',
            title: 'Groom',
            icon: 'fa-male',
            subItems: [
              { id: 'groom-face-swap', label: 'Create Groom Look', link: '/groom-face-swap' },
              { id: 'traditional-wear', label: 'Traditional Wear', link: '/traditional-wear' },
              { id: 'modern-suits', label: 'Modern Suits', link: '/modern-suits' },
              { id: 'groom-accessories', label: 'Accessories', link: '/groom-accessories' }
            ]
          },
          {
            id: 'services',
            title: 'Services',
            icon: 'fa-concierge-bell',
            subItems: [
              { id: 'venue-search', label: 'Venue Search', link: '/venue-search' },
              { id: 'hall-comparison', label: 'Hall Comparison', link: '/hall-comparison' },
              { id: 'virtual-tours', label: 'Virtual Tours', link: '/virtual-tours' },
              { id: 'booking-management', label: 'Booking Management', link: '/booking-management' },
              { id: 'saloons', label: 'Saloons', link: '/saloons' },
              { id: 'event-managers', label: 'Event Managers', link: '/event-managers' }
            ]
          }
        ]);
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