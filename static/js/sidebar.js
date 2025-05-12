/**
 * Sidebar functionality
 * This file contains all the sidebar-related functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Sidebar initialization");
    
    // Get sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navSidebarToggle = document.getElementById('navSidebarToggle');
    const closeBtn = document.querySelector('.close-sidebar');
    
    console.log("Sidebar element:", sidebar);
    console.log("Sidebar toggle button:", sidebarToggle);
    console.log("Nav sidebar toggle button:", navSidebarToggle);
    console.log("Close button:", closeBtn);
    
    // Initialize sidebar in open state by default
    if (sidebar) {
        console.log("Initializing sidebar in open state");
        sidebar.classList.remove('closed');
        document.body.classList.remove('sidebar-closed');
    }
    
    // Function to toggle sidebar
    function toggleSidebar() {
        console.log("Toggle sidebar function called");
        if (sidebar) {
            console.log("Toggling sidebar class");
            sidebar.classList.toggle('closed');
            document.body.classList.toggle('sidebar-closed');
        } else {
            console.error("Sidebar element not found");
        }
    }
    
    // Make toggleSidebar available globally
    window.toggleSidebar = toggleSidebar;
    
    // Toggle sidebar from floating button
    if (sidebarToggle) {
        console.log("Adding event listener to sidebar toggle button");
        sidebarToggle.addEventListener('click', function(e) {
            console.log("Sidebar toggle button clicked");
            e.preventDefault();
            toggleSidebar();
        });
    }
    
    // Toggle sidebar from navbar button
    if (navSidebarToggle) {
        console.log("Adding event listener to nav sidebar toggle button");
        navSidebarToggle.addEventListener('click', function(e) {
            console.log("Nav sidebar toggle button clicked");
            e.preventDefault();
            toggleSidebar();
        });
    } else {
        console.log("Nav sidebar toggle button not found, skipping event listener");
    }
    
    // Close sidebar
    if (closeBtn) {
        console.log("Adding event listener to close button");
        closeBtn.addEventListener('click', function(e) {
            console.log("Close button clicked");
            e.preventDefault();
            if (sidebar) {
                sidebar.classList.add('closed');
                document.body.classList.add('sidebar-closed');
            }
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar) {
            const isClickInside = 
                sidebar.contains(event.target) || 
                (sidebarToggle && sidebarToggle.contains(event.target)) ||
                (navSidebarToggle && navSidebarToggle.contains(event.target));
            
            if (!isClickInside && !sidebar.classList.contains('closed')) {
                console.log("Clicked outside sidebar, closing it");
                sidebar.classList.add('closed');
                document.body.classList.add('sidebar-closed');
            }
        }
    });
    
    // Attach listeners for accordion items
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("Accordion button clicked:", this.textContent.trim());
        });
    });
    
    console.log("Sidebar initialization complete");
});