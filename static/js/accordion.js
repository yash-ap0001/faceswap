// Bootstrap sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded - initializing sidebar");
    initSidebar();
});

// Also initialize sidebar when SPA content is loaded
document.addEventListener('spaContentLoaded', function(event) {
    console.log("SPA content loaded - reinitializing sidebar for:", event.detail.url);
    initSidebar();
});

function initSidebar() {
    try {
        // Get elements
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
        const navSidebarToggleBtn = document.querySelector('.nav-sidebar-toggle');
        const menuToggleBtn = document.getElementById('menuToggleBtn');
        const closeBtn = document.querySelector('.close-sidebar');
        
        console.log("Sidebar element:", sidebar);
        console.log("Menu toggle button:", menuToggleBtn);
        console.log("Sidebar toggle button:", sidebarToggleBtn);
        console.log("Nav sidebar toggle button:", navSidebarToggleBtn);
        console.log("Close button:", closeBtn);
        
        // Initialize sidebar state
        console.log("Initializing sidebar in open state");
        
        // Add event listener to menu toggle button (the new semicircle toggle)
        if (menuToggleBtn) {
            // Remove existing event listeners (to prevent duplicates in SPA context)
            const newMenuToggleBtn = menuToggleBtn.cloneNode(true);
            if (menuToggleBtn.parentNode) {
                menuToggleBtn.parentNode.replaceChild(newMenuToggleBtn, menuToggleBtn);
            }
            
            console.log("Adding event listener to menu toggle button");
            newMenuToggleBtn.addEventListener('click', function() {
                console.log("Menu toggle button clicked");
                toggleSidebar();
            });
        }
        
        // Add event listener to sidebar toggle button (old one, keep for compatibility)
        if (sidebarToggleBtn) {
            console.log("Adding event listener to sidebar toggle button");
            sidebarToggleBtn.addEventListener('click', function() {
                console.log("Sidebar toggle button clicked");
                toggleSidebar();
            });
        }
        
        // Add event listener to nav sidebar toggle button (old one, keep for compatibility)
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
        if (document.body) {
            document.body.classList.toggle('sidebar-closed');
        }
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('closed');
        }
    } catch (error) {
        console.error("Error toggling sidebar:", error);
    }
}