/**
 * Direct Sidebar Implementation
 * No event handlers, just direct DOM manipulation
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Direct sidebar script loaded");
    
    // Add direct click handler to sidebar toggle button, replacing any existing button
    const oldToggleBtn = document.getElementById('sidebarToggle');
    if (oldToggleBtn && oldToggleBtn.parentNode) {
        // Create new button with same attributes but new ID to avoid conflicts
        const newBtn = document.createElement('div');
        newBtn.id = 'sidebarToggleBtn';
        newBtn.className = oldToggleBtn.className;
        newBtn.innerHTML = oldToggleBtn.innerHTML;
        
        // Add direct click handler
        newBtn.onclick = function(e) {
            e.preventDefault();
            console.log("NEW TOGGLE BUTTON CLICKED");
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const isCurrentlyClosed = sidebar.classList.contains('closed');
                console.log("Sidebar is currently:", isCurrentlyClosed ? "closed" : "open");
                
                if (isCurrentlyClosed) {
                    sidebar.classList.remove('closed');
                    document.body.classList.remove('sidebar-closed');
                    console.log("Sidebar OPENED");
                } else {
                    sidebar.classList.add('closed');
                    document.body.classList.add('sidebar-closed');
                    console.log("Sidebar CLOSED");
                }
            }
        };
        
        // Replace old button with new one
        oldToggleBtn.parentNode.replaceChild(newBtn, oldToggleBtn);
        console.log("Replaced sidebar toggle button with direct implementation");
    }
    
    // Add direct click handler to close button
    const oldCloseBtn = document.querySelector('.close-sidebar');
    if (oldCloseBtn && oldCloseBtn.parentNode) {
        // Create new button with same attributes but new class to avoid conflicts
        const newCloseBtn = document.createElement('button');
        newCloseBtn.className = oldCloseBtn.className + ' direct-close-btn';
        newCloseBtn.innerHTML = oldCloseBtn.innerHTML;
        
        // Add direct click handler
        newCloseBtn.onclick = function(e) {
            e.preventDefault();
            console.log("NEW CLOSE BUTTON CLICKED");
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('closed');
                document.body.classList.add('sidebar-closed');
                console.log("Sidebar closed via close button");
            }
        };
        
        // Replace old button with new one
        oldCloseBtn.parentNode.replaceChild(newCloseBtn, oldCloseBtn);
        console.log("Replaced close button with direct implementation");
    }
    
    console.log("Direct sidebar implementation completed");
});