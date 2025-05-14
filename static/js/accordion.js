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
        
        // Initialize sidebar to closed state
        if (sidebar && document.body) {
            // Check if the sidebar is already initialized
            if (!document.body.classList.contains('sidebar-closed') && !sidebar.classList.contains('closed')) {
                // Add closed classes to start with a closed sidebar
                document.body.classList.add('sidebar-closed');
                sidebar.classList.add('closed');
                console.log("Initializing sidebar in closed state");
            } else {
                console.log("Sidebar already initialized");
            }
        } else {
            console.log("Cannot initialize sidebar - elements not found");
        }
        
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
        const sidebar = document.querySelector('.sidebar');
        const body = document.body;
        
        if (sidebar && body) {
            // Get current state
            const isClosed = sidebar.classList.contains('closed');
            
            // Toggle classes based on current state
            if (isClosed) {
                // If closed, open it
                body.classList.remove('sidebar-closed');
                sidebar.classList.remove('closed');
                console.log("Opening sidebar");
            } else {
                // If open, close it
                body.classList.add('sidebar-closed');
                sidebar.classList.add('closed');
                console.log("Closing sidebar");
            }
        } else {
            console.error("Sidebar or body element not found");
        }
    } catch (error) {
        console.error("Error toggling sidebar:", error);
    }
}