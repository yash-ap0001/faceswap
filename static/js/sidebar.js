/**
 * Sidebar functionality
 * This file contains all the sidebar-related functionality
 */

// Define global sidebar function first - this needs to be accessible from anywhere
window.toggleSidebar = function() {
    console.log("Global toggleSidebar called");
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        console.log("Toggling sidebar class");
        sidebar.classList.toggle('closed');
        document.body.classList.toggle('sidebar-closed');
    } else {
        console.error("Sidebar element not found");
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("Sidebar.js initialization started");
    
    // Get sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navSidebarToggle = document.getElementById('navSidebarToggle');
    const closeBtn = document.querySelector('.close-sidebar');
    
    console.log("Sidebar.js found elements:", {
        sidebar: sidebar ? true : false, 
        sidebarToggle: sidebarToggle ? true : false,
        navSidebarToggle: navSidebarToggle ? true : false,
        closeBtn: closeBtn ? true : false
    });
    
    // Initialize sidebar in open state by default
    if (sidebar) {
        sidebar.classList.remove('closed');
        document.body.classList.remove('sidebar-closed');
        console.log("Sidebar initialized in open state");
    }
    
    // Toggle sidebar from floating button (ensure no duplicate listeners)
    if (sidebarToggle) {
        // Remove any existing listeners first
        const newSidebarToggle = sidebarToggle.cloneNode(true);
        sidebarToggle.parentNode.replaceChild(newSidebarToggle, sidebarToggle);
        
        // Add our listener
        newSidebarToggle.addEventListener('click', function(e) {
            console.log("Sidebar.js: Toggle button clicked");
            e.preventDefault();
            window.toggleSidebar();
        });
        console.log("Sidebar toggle button listener added");
    }
    
    // Toggle sidebar from navbar button
    if (navSidebarToggle) {
        // Remove any existing listeners first
        const newNavSidebarToggle = navSidebarToggle.cloneNode(true);
        navSidebarToggle.parentNode.replaceChild(newNavSidebarToggle, navSidebarToggle);
        
        // Add our listener
        newNavSidebarToggle.addEventListener('click', function(e) {
            console.log("Sidebar.js: Nav toggle button clicked");
            e.preventDefault();
            window.toggleSidebar();
        });
        console.log("Nav sidebar toggle button listener added");
    }
    
    // Close sidebar button
    if (closeBtn) {
        // Remove any existing listeners first
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        // Add our listener
        newCloseBtn.addEventListener('click', function(e) {
            console.log("Sidebar.js: Close button clicked");
            e.preventDefault();
            if (sidebar) {
                sidebar.classList.add('closed');
                document.body.classList.add('sidebar-closed');
            }
        });
        console.log("Close button listener added");
    }
    
    // Removed click outside handler to fix opening issue
    
    console.log("Sidebar.js initialization complete");
});