/**
 * JavaScript for managing the sidebar behavior
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const mainContent = document.querySelector('main');
    
    if (!sidebar || !menuToggleBtn) {
        console.error("Required elements not found!");
        return;
    }
    
    // Toggle sidebar function
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar-collapsed');
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }
        
        // Update icon based on sidebar state
        if (sidebar.classList.contains('sidebar-collapsed')) {
            // Change icon to right arrow when sidebar is closed
            menuToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
            menuToggleBtn.querySelector('i').classList.add('fa-chevron-right');
            localStorage.setItem('sidebarState', 'closed');
        } else {
            // Change icon to left arrow when sidebar is open
            menuToggleBtn.querySelector('i').classList.remove('fa-chevron-right');
            menuToggleBtn.querySelector('i').classList.add('fa-chevron-left');
            localStorage.setItem('sidebarState', 'open');
        }
    }
    
    // Initialize sidebar based on stored state
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'closed') {
        sidebar.classList.add('sidebar-collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
        // Set correct initial icon
        menuToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
        menuToggleBtn.querySelector('i').classList.add('fa-chevron-right');
    }
    
    // Add click event to toggle button
    menuToggleBtn.addEventListener('click', toggleSidebar);
    
    // Add active class to current menu item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});