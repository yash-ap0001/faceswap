/**
 * Simple Sidebar Control
 * A minimal implementation focused only on the sidebar toggle functionality
 */

// Define a global function for toggling the sidebar
window.toggleSidebar = function() {
    console.log("Simple sidebar toggle function called");
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('closed');
        document.body.classList.toggle('sidebar-closed');
        console.log("Sidebar toggled:", sidebar.classList.contains('closed') ? "closed" : "open");
        return true;
    } else {
        console.error("Sidebar element not found");
        return false;
    }
};

// Immediately attach event listeners when the script loads
(function() {
    console.log("Sidebar fix initializing");
    
    // Get DOM elements
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const closeBtn = document.querySelector('.close-sidebar');
    
    // Log initialization
    console.log("Sidebar elements found:", {
        sidebar: sidebar ? true : false,
        toggleBtn: toggleBtn ? true : false,
        closeBtn: closeBtn ? true : false
    });
    
    // Attach toggle button event
    if (toggleBtn) {
        toggleBtn.onclick = function(e) {
            e.preventDefault();
            console.log("Toggle button clicked (direct onclick)");
            window.toggleSidebar();
        };
        console.log("Toggle button event attached (direct)");
    }
    
    // Attach close button event
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            console.log("Close button clicked");
            if (sidebar) {
                sidebar.classList.add('closed');
                document.body.classList.add('sidebar-closed');
            }
        };
        console.log("Close button event attached");
    }
    
    console.log("Sidebar fix initialized");
})();