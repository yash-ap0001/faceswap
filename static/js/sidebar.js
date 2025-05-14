/**
 * JavaScript for managing the sidebar behavior
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('main');
    
    // Check for stored sidebar state
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'closed') {
        sidebar.classList.add('sidebar-collapsed');
        mainContent.classList.add('expanded');
    }
    
    // Toggle sidebar function
    function toggleSidebar() {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('expanded');
        
        // Store sidebar state
        if (sidebar.classList.contains('sidebar-collapsed')) {
            localStorage.setItem('sidebarState', 'closed');
            menuToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
            menuToggleBtn.querySelector('i').classList.add('fa-chevron-right');
        } else {
            localStorage.setItem('sidebarState', 'open');
            menuToggleBtn.querySelector('i').classList.remove('fa-chevron-right');
            menuToggleBtn.querySelector('i').classList.add('fa-chevron-left');
        }
    }
    
    // Toggle sidebar when the toggle button is clicked
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Update icon orientation based on current state
    if (sidebar.classList.contains('sidebar-collapsed')) {
        menuToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
        menuToggleBtn.querySelector('i').classList.add('fa-chevron-right');
    }
    
    // Add active class to current menu item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});