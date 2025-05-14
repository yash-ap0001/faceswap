/**
 * SPA (Single Page Application) Functionality
 * Handles routing and content loading without full page reloads
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize SPA functionality
    initSPA();
});

function initSPA() {
    // Set up event listeners for all sidebar links
    setupSidebarLinks();
    
    // Store the current page for browser history
    window.currentPage = window.location.pathname;
    
    // Set up browser back/forward button handling
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.url) {
            loadContent(event.state.url, false);
        }
    });
}

function setupSidebarLinks() {
    // Get all sidebar menu links
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        // Skip links with onclick handlers (they already have custom behavior)
        if (link.hasAttribute('onclick')) {
            return;
        }
        
        // Get the href attribute
        const href = link.getAttribute('href');
        
        // If it's an external link or anchor, skip it
        if (!href || href.startsWith('http') || href.startsWith('#')) {
            return;
        }
        
        // Add click event listener
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Update URL in the address bar without reloading
            const currentUrl = window.location.pathname;
            const newUrl = this.getAttribute('href');
            
            // Don't reload if we're already on the same page
            if (currentUrl === newUrl) {
                return;
            }
            
            // Load content
            loadContent(newUrl, true);
            
            // Update active state in sidebar
            updateActiveSidebarItem(this);
        });
    });
}

function loadContent(url, pushState = true) {
    console.log(`Loading content from: ${url}`);
    
    // Show loading indicator
    showLoading();
    
    // Fetch the content
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // Parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract just the content section
            const newContent = doc.querySelector('#dynamic-content');
            
            if (newContent) {
                // Update the content
                document.getElementById('dynamic-content').innerHTML = newContent.innerHTML;
                
                // Update the page title
                const newTitle = doc.querySelector('title');
                if (newTitle) {
                    document.title = newTitle.textContent;
                }
                
                // Update browser history
                if (pushState) {
                    window.history.pushState({url: url}, document.title, url);
                    window.currentPage = url;
                }
                
                // Initialize any scripts in the new content
                initContentScripts();
            } else {
                console.error('Content element not found in fetched page');
            }
            
            // Hide loading indicator
            hideLoading();
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            hideLoading();
            // Fallback to traditional page load on error
            window.location.href = url;
        });
}

function updateActiveSidebarItem(activeLink) {
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to the clicked link
    activeLink.classList.add('active');
    
    // Ensure the parent accordion is open
    const accordionItem = activeLink.closest('.accordion-collapse');
    if (accordionItem && !accordionItem.classList.contains('show')) {
        const accordionId = accordionItem.getAttribute('id');
        const accordionButton = document.querySelector(`[data-bs-target="#${accordionId}"]`);
        if (accordionButton) {
            accordionButton.click();
        }
    }
}

function showLoading() {
    // Check if loading overlay already exists
    let loadingOverlay = document.getElementById('spa-loading-overlay');
    
    if (!loadingOverlay) {
        // Create loading overlay
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'spa-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        
        // Add styles
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9999';
        
        // Add to body
        document.body.appendChild(loadingOverlay);
    } else {
        // Show existing overlay
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('spa-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function initContentScripts() {
    // Initialize any scripts that need to run when new content is loaded
    // For example, you might need to set up event handlers for elements in the new content
    
    // This would initialize image galleries, if any
    if (typeof initializeGallery === 'function') {
        initializeGallery();
    }
    
    // This would initialize template selection, if any
    if (typeof refreshTemplates === 'function') {
        refreshTemplates();
    }
    
    // This would initialize any file upload previews, if any
    if (typeof setupImagePreviews === 'function') {
        setupImagePreviews();
    }
    
    // This would initialize any accordion components, if any
    const accordionElements = document.querySelectorAll('.accordion');
    if (accordionElements.length > 0) {
        accordionElements.forEach(accordion => {
            new bootstrap.Accordion(accordion);
        });
    }
}