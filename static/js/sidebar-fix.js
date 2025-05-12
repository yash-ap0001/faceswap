/**
 * Simple Sidebar Control - Direct Implementation
 * A very direct approach to sidebar control with minimal complexity
 */

// Define a global function for toggling the sidebar
window.toggleSidebar = function() {
    console.log("FIXED toggleSidebar called");
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        // Check current state
        const isClosed = sidebar.classList.contains('closed');
        console.log("Current sidebar state:", isClosed ? "closed" : "open");
        
        // Toggle to opposite state
        if (isClosed) {
            sidebar.classList.remove('closed');
            document.body.classList.remove('sidebar-closed');
            console.log("Sidebar opened");
        } else {
            sidebar.classList.add('closed');
            document.body.classList.add('sidebar-closed');
            console.log("Sidebar closed");
        }
        return true;
    } else {
        console.error("Sidebar element not found");
        return false;
    }
};

// When script loads, attach handlers immediately
console.log("Sidebar-fix.js loading...");

// Get DOM elements
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
const closeBtn = document.querySelector('.close-sidebar');
const navToggleBtn = document.getElementById('navSidebarToggle');

console.log("Found elements:", {
    sidebar: !!sidebar,
    toggleBtn: !!toggleBtn,
    closeBtn: !!closeBtn,
    navToggleBtn: !!navToggleBtn
});

// Direct approach to attach click handlers
if (toggleBtn) {
    // Remove any existing listeners to avoid duplicates
    const newToggleBtn = toggleBtn.cloneNode(true);
    if (toggleBtn.parentNode) {
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    }
    
    // Add direct onclick handler
    newToggleBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        console.log("Sidebar toggle button clicked");
        window.toggleSidebar();
    };
    console.log("Toggle button handler attached");
}

// Direct approach for nav toggle button 
if (navToggleBtn) {
    // Remove any existing listeners to avoid duplicates
    const newNavToggleBtn = navToggleBtn.cloneNode(true);
    if (navToggleBtn.parentNode) {
        navToggleBtn.parentNode.replaceChild(newNavToggleBtn, navToggleBtn);
    }
    
    // Add direct onclick handler
    newNavToggleBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        console.log("Nav sidebar toggle button clicked");
        window.toggleSidebar();
    };
    console.log("Nav toggle button handler attached");
}

// Direct approach for close button
if (closeBtn) {
    // Remove any existing listeners to avoid duplicates
    const newCloseBtn = closeBtn.cloneNode(true);
    if (closeBtn.parentNode) {
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    }
    
    // Add direct onclick handler
    newCloseBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        console.log("Close button clicked");
        if (sidebar) {
            sidebar.classList.add('closed');
            document.body.classList.add('sidebar-closed');
        }
    };
    console.log("Close button handler attached");
}

// IMPORTANT: Don't add click outside listener to avoid conflicts
console.log("Sidebar-fix.js loaded successfully");