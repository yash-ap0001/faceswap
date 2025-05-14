/**
 * JavaScript for managing the sidebar behavior
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing sidebar JS");
    
    // Get elements
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const mainContent = document.querySelector('main');
    
    if (!sidebar) {
        console.error("Sidebar element not found!");
        return;
    }
    
    if (!menuToggleBtn) {
        console.error("Menu toggle button not found!");
        return;
    }
    
    console.log("All required elements found");
    
    // Global toggle function
    window.toggleSidebar = function() {
        console.log("toggleSidebar function called");
        
        // Toggle sidebar class
        sidebar.classList.toggle('sidebar-collapsed');
        
        // Update main content margin
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }
        
        // Update icon based on sidebar state
        const icon = menuToggleBtn.querySelector('i');
        if (!icon) {
            console.error("Icon element not found in toggle button");
            return;
        }
        
        if (sidebar.classList.contains('sidebar-collapsed')) {
            // Change icon to right arrow when sidebar is closed
            icon.className = 'fas fa-chevron-right';
            localStorage.setItem('sidebarState', 'closed');
            console.log("Sidebar now closed");
        } else {
            // Change icon to left arrow when sidebar is open
            icon.className = 'fas fa-chevron-left';
            localStorage.setItem('sidebarState', 'open');
            console.log("Sidebar now open");
        }
    };
    
    // Initialize sidebar based on stored state
    const sidebarState = localStorage.getItem('sidebarState');
    console.log("Initial sidebar state:", sidebarState);
    
    if (sidebarState === 'closed') {
        console.log("Setting sidebar to initially closed");
        sidebar.classList.add('sidebar-collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
        
        // Set correct initial icon
        const icon = menuToggleBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-chevron-right';
        }
    } else {
        console.log("Setting sidebar to initially open");
        // Make sure sidebar is open by default
        sidebar.classList.remove('sidebar-collapsed');
        if (mainContent) {
            mainContent.classList.remove('expanded');
        }
        
        // Set correct initial icon
        const icon = menuToggleBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-chevron-left';
        }
    }
    
    // Add click event to toggle button
    menuToggleBtn.addEventListener('click', function() {
        console.log("Toggle button clicked");
        window.toggleSidebar();
    });
    
    // Add active class to current menu item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    console.log("Sidebar JS initialization complete");
});