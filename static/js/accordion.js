// Bootstrap sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded");
    initSidebar();
});

function initSidebar() {
    try {
        // Get elements
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
        const navSidebarToggleBtn = document.querySelector('.nav-sidebar-toggle');
        const closeBtn = document.querySelector('.close-sidebar');
        
        console.log("Sidebar element:", sidebar);
        console.log("Sidebar toggle button:", sidebarToggleBtn);
        console.log("Nav sidebar toggle button:", navSidebarToggleBtn);
        console.log("Close button:", closeBtn);
        
        // Initialize sidebar state
        console.log("Initializing sidebar in open state");
        
        // Add event listener to sidebar toggle button
        if (sidebarToggleBtn) {
            console.log("Adding event listener to sidebar toggle button");
            sidebarToggleBtn.addEventListener('click', function() {
                console.log("Sidebar toggle button clicked");
                toggleSidebar();
            });
        }
        
        // Add event listener to nav sidebar toggle button
        if (navSidebarToggleBtn) {
            console.log("Adding event listener to nav sidebar toggle button");
            navSidebarToggleBtn.addEventListener('click', function() {
                console.log("Nav sidebar toggle button clicked");
                toggleSidebar();
            });
        }
        
        // Add event listener to close button
        if (closeBtn) {
            console.log("Adding event listener to close button");
            closeBtn.addEventListener('click', function() {
                console.log("Close button clicked");
                if (sidebar) {
                    document.body.classList.add('sidebar-closed');
                    sidebar.classList.add('closed');
                }
            });
        }
        
        // Bootstrap 5 accordion is handled automatically via data attributes
        // No need for manual JavaScript for the accordion functionality
        
    } catch (error) {
        console.error("Error initializing sidebar:", error);
    }
}

function toggleSidebar() {
    console.log("Toggle sidebar called");
    try {
        console.log("Toggling sidebar class");
        document.body.classList.toggle('sidebar-closed');
        document.querySelector('.sidebar').classList.toggle('closed');
    } catch (error) {
        console.error("Error toggling sidebar:", error);
    }
}