/**
 * SPA (Single Page Application) functionality for the wedding app
 * Handles navigation without full page reloads
 */

document.addEventListener('DOMContentLoaded', function() {
    initSPA();
});

/**
 * Initialize SPA functionality
 */
function initSPA() {
    console.log('Initializing SPA functionality');
    
    try {
        // Intercept all internal link clicks
        document.addEventListener('click', function(event) {
            try {
                // Find closest anchor tag if the click was on a child element
                const link = event.target.closest('a');
                
                // If not a link, don't intercept
                if (!link) {
                    return;
                }
                
                // Get href attribute and check if it exists
                const href = link.getAttribute('href');
                if (!href) {
                    return;
                }
                
                // Special cases - don't intercept these
                if (href.startsWith('http') ||      // External links
                    href.startsWith('#') ||         // Anchor links
                    href === '' ||                  // Empty links
                    href.includes('logout') ||      // Logout links (needs full reload)
                    href.includes('login') ||       // Login links (needs full reload)
                    href.includes('upload_file') || // File upload endpoints
                    link.getAttribute('target') === '_blank' || // New window links
                    link.getAttribute('download') || // Download links
                    link.hasAttribute('data-no-spa') || // Explicitly marked to avoid SPA
                    link.hasAttribute('onclick'))   // Has onclick handler
                {
                    console.log('Not intercepting link:', href);
                    return;
                }

                // Debug info
                console.log('Intercepting link click:', href);
                
                // Prevent default anchor click behavior
                event.preventDefault();
                
                // Navigate to the link using our SPA loader
                navigateTo(href);
            } catch (error) {
                console.error('Error in click handler:', error);
            }
        });

        // Handle browser history navigation (back/forward buttons)
        window.addEventListener('popstate', function(event) {
            try {
                if (event.state && event.state.path) {
                    loadContent(event.state.path, false);
                }
            } catch (error) {
                console.error('Error in popstate handler:', error);
            }
        });
        
        console.log('SPA initialization complete');
    } catch (error) {
        console.error('Error initializing SPA:', error);
    }
}

/**
 * Navigate to a new URL without page reload
 * @param {string} url - The URL to navigate to
 */
function navigateTo(url) {
    console.log(`Navigating to: ${url}`);
    
    // Update browser history and load content
    window.history.pushState({ path: url }, '', url);
    loadContent(url, true);
}

/**
 * Load content from the server and update the page
 * @param {string} url - The URL to load content from
 * @param {boolean} updateActiveState - Whether to update the active state in the sidebar
 */
function loadContent(url, updateActiveState = true) {
    console.log(`Loading content from: ${url}`);
    
    // Show loading indicator
    const contentArea = document.querySelector('main');
    if (contentArea) {
        contentArea.innerHTML = '<div class="container"><div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div></div>';
    } else {
        console.error('Main content area not found');
        return;
    }
    
    // Fetch the HTML content from the server
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            try {
                // Create a temporary element to parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract the main content from the loaded page
                const newContent = doc.querySelector('main');
                
                // Update the page content if content area found
                if (newContent) {
                    // Only update the inner content of main
                    contentArea.innerHTML = newContent.innerHTML;
                    
                    // Update page title
                    const newTitle = doc.querySelector('title');
                    if (newTitle) {
                        document.title = newTitle.textContent;
                    }
                    
                    // Execute any scripts in the new content
                    executeScripts(contentArea);
                    
                    // Update active state in sidebar if needed
                    if (updateActiveState) {
                        updateActiveSidebarItem(url);
                    }
                    
                    // Scroll to top
                    window.scrollTo(0, 0);
                } else {
                    console.error('Could not find main content in loaded page');
                    // If content area not found, redirect to the page (fallback)
                    window.location.href = url;
                }
            } catch (error) {
                console.error('Error processing HTML:', error);
                window.location.href = url;
            }
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            // On error, redirect to the page (fallback)
            window.location.href = url;
        });
}

/**
 * Execute scripts found in content area
 * @param {HTMLElement} contentArea - The content area element
 */
function executeScripts(contentArea) {
    try {
        const scripts = contentArea.querySelectorAll('script');
        scripts.forEach(oldScript => {
            try {
                const newScript = document.createElement('script');
                
                // Copy all attributes from the old script to the new one
                if (oldScript.attributes) {
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                }
                
                // Copy the content of the script
                newScript.textContent = oldScript.textContent;
                
                // Replace the old script with the new one
                if (oldScript.parentNode) {
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            } catch (error) {
                console.error('Error executing individual script:', error);
            }
        });
    } catch (error) {
        console.error('Error executing scripts:', error);
    }
}

/**
 * Update the active state in the sidebar based on current URL
 * @param {string} url - The current URL
 */
function updateActiveSidebarItem(url) {
    try {
        console.log('Updating active sidebar item for URL:', url);
        
        // Remove active class from all sidebar items
        const allLinks = document.querySelectorAll('.accordion-body a');
        allLinks.forEach(link => {
            try {
                link.classList.remove('active');
            } catch (e) {
                console.error('Error removing active class:', e);
            }
        });
        
        // Find the matching sidebar item and make it active
        let foundMatch = false;
        allLinks.forEach(link => {
            try {
                const linkHref = link.getAttribute('href');
                if (!linkHref) return;
                
                // Check for exact match or if the URL ends with the link href
                if (linkHref === url || url.endsWith(linkHref)) {
                    console.log('Found matching sidebar link:', linkHref);
                    link.classList.add('active');
                    foundMatch = true;
                    
                    // Open the parent accordion if it's closed
                    const accordionItem = link.closest('.accordion-collapse');
                    if (accordionItem && !accordionItem.classList.contains('show')) {
                        const accordionId = accordionItem.getAttribute('id');
                        if (accordionId) {
                            const accordionButton = document.querySelector(`[data-bs-target="#${accordionId}"]`);
                            if (accordionButton && typeof bootstrap !== 'undefined') {
                                try {
                                    const bsCollapse = new bootstrap.Collapse(accordionItem);
                                    bsCollapse.show();
                                } catch (error) {
                                    console.error('Error showing accordion:', error);
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error processing sidebar link:', e);
            }
        });
        
        if (!foundMatch) {
            console.log('No matching sidebar item found for:', url);
        }
    } catch (error) {
        console.error('Error updating active sidebar item:', error);
    }
}