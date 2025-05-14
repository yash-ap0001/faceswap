/**
 * JavaScript for managing the sidebar behavior
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded");
    
    // Elements
    const sidebar = document.getElementById('sidebar');
    console.log("Sidebar element:", sidebar);
    
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    console.log("Sidebar toggle button:", menuToggleBtn);
    
    const mainContent = document.querySelector('main');
    
    // Simple sidebar toggle function
    function toggleSidebar() {
        console.log("Toggle sidebar called");
        console.log("Toggling sidebar class");
        sidebar.classList.toggle('sidebar-collapsed');
        if(mainContent) {
            mainContent.classList.toggle('expanded');
        }
    }
    
    // Initialize sidebar based on stored state
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'closed') {
        console.log("Initializing sidebar in closed state");
        sidebar.classList.add('sidebar-collapsed');
        if(mainContent) {
            mainContent.classList.add('expanded');
        }
    } else {
        console.log("Initializing sidebar in open state");
    }
    
    // Add click event to toggle button
    if (menuToggleBtn) {
        console.log("Adding event listener to sidebar toggle button");
        menuToggleBtn.addEventListener('click', function() {
            console.log("Sidebar toggle button clicked");
            toggleSidebar();
            console.log("Menu toggle button clicked");
        });
        console.log("Menu toggle button:", menuToggleBtn);
    }
    
    // Add active class to current menu item
    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath);
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});