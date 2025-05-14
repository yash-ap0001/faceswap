import React from 'react';

/**
 * Sidebar component with navigation links
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {string} props.activeItem - The currently active menu item
 * @param {Function} props.onNavigation - Handler for navigation changes
 */
const Sidebar = ({ isOpen, activeItem, onNavigation }) => {
  // Define menu structure
  const menuItems = [
    {
      id: 'bride',
      title: 'Bride',
      icon: 'fa-female',
      subItems: [
        { id: 'bridal_gallery', label: 'Bridal Gallery', link: '/bridal_gallery' },
        { id: 'bridal_swap', label: 'Create Bride Look', link: '/bridal_swap' },
        { id: 'bridal_outfits', label: 'Bridal Outfits', link: '/bridal_outfits' },
        { id: 'jewelry_collections', label: 'Jewelry Collections', link: '/jewelry_collections' },
        { id: 'makeup_styles', label: 'Makeup Styles', link: '/makeup_styles' }
      ]
    },
    {
      id: 'groom',
      title: 'Groom',
      icon: 'fa-male',
      subItems: [
        { id: 'groom_face_swap', label: 'Create Groom Look', link: '/groom_face_swap' },
        { id: 'traditional_wear', label: 'Traditional Wear', link: '/traditional_wear' },
        { id: 'modern_suits', label: 'Modern Suits', link: '/modern_suits' },
        { id: 'groom_accessories', label: 'Accessories', link: '/groom_accessories' }
      ]
    },
    {
      id: 'services',
      title: 'Services',
      icon: 'fa-concierge-bell',
      subItems: [
        { id: 'venue_search', label: 'Venue Search', link: '/venue_search' },
        { id: 'hall_comparison', label: 'Hall Comparison', link: '/hall_comparison' },
        { id: 'virtual_tours', label: 'Virtual Tours', link: '/virtual_tours' },
        { id: 'booking_management', label: 'Booking Management', link: '/booking_management' },
        { id: 'saloons', label: 'Saloons', link: '/saloons' },
        { id: 'event_managers', label: 'Event Managers', link: '/event_managers' }
      ]
    }
  ];

  // Handle menu item click
  const handleItemClick = (id, link) => {
    onNavigation(id);
    
    // Use history API for navigation without page reload
    window.history.pushState({}, '', link);
    
    // Dispatch a custom event to notify about route change
    const event = new CustomEvent('routeChange', { detail: { path: link } });
    window.dispatchEvent(event);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h5>Menu</h5>
      </div>
      <div className="sidebar-content">
        {menuItems.map((section) => (
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
        ))}
      </div>
    </div>
  );
};

export default Sidebar;