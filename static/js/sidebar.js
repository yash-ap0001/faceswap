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
    
    // Simple sidebar toggle function
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar-collapsed');
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }
        
        // Store sidebar state
        if (sidebar.classList.contains('sidebar-collapsed')) {
            localStorage.setItem('sidebarState', 'closed');
        } else {
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