import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: 'Face Swap', icon: 'fa-exchange-alt', link: '/universal' },
    { name: 'Bride', icon: 'fa-female', link: '/react#bride' },
    { name: 'Groom', icon: 'fa-male', link: '/react#groom' },
    { name: 'Saloons', icon: 'fa-cut', link: '/react#saloons' },
    { name: 'Venues', icon: 'fa-building', link: '/react#venues' },
    { name: 'Services', icon: 'fa-concierge-bell', link: '/react#services' },
    { name: 'Settings', icon: 'fa-cog', link: '/react#settings' }
  ];

  return (
    <>
      {/* Sidebar toggle button */}
      <div 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '50%',
          left: '0',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '80px',
          backgroundColor: '#2b1744',
          borderRadius: '0 40px 40px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1001,
          boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
          transition: 'left 0.3s ease-in-out'
        }}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`} style={{ color: 'white' }}></i>
      </div>

      {/* Sidebar panel */}
      <div 
        className="sidebar"
        style={{
          position: 'fixed',
          top: '0',
          left: isOpen ? '0' : '-230px',
          width: '230px',
          height: '100%',
          backgroundColor: '#2b1744',
          color: 'white',
          zIndex: 1000,
          transition: 'left 0.3s ease-in-out',
          boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
          padding: '20px 0',
          overflowY: 'auto'
        }}
      >
        {/* Sidebar header */}
        <div style={{
          textAlign: 'center',
          padding: '10px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ margin: 0 }}>
            <span style={{ color: '#9d4edd', fontWeight: 800 }}>VOW</span>
            <span style={{ color: 'white', fontStyle: 'italic', marginLeft: '5px', fontWeight: 700 }}>BRIDE</span>
          </h3>
        </div>

        {/* Menu items */}
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.link} 
            style={{ textDecoration: 'none', color: 'white' }}
          >
            <div 
              className="sidebar-menu-item"
              style={{
                padding: '15px 20px',
                display: 'flex',
                alignItems: 'center',
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderLeftColor = '#9d4edd';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderLeftColor = 'transparent';
              }}
            >
              <i className={`fas ${item.icon}`} style={{ 
                width: '20px', 
                color: '#9d4edd',
                fontSize: '1.1rem'
              }}></i>
              <span style={{ marginLeft: '12px', fontSize: '0.95rem' }}>{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Sidebar;