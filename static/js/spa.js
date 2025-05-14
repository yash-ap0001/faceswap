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
    
    // Intercept all internal link clicks
    document.addEventListener('click', function(event) {
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
        
        // If it's an external link or has special behavior, don't intercept
        if (href.startsWith('http') ||
            href.startsWith('#') ||
            href === '' ||
            link.getAttribute('target') === '_blank' ||
            link.getAttribute('download') ||
            link.getAttribute('onclick')) {
            return;
        }

        // Prevent default anchor click behavior
        event.preventDefault();
        
        // Navigate to the link using our SPA loader
        navigateTo(link.getAttribute('href'));
    });

    // Handle browser history navigation (back/forward buttons)
    window.addEventListener('popstate', function(event) {
        if (event.state) {
            loadContent(event.state.path, false);
        }
    });
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
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
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
            // Create a temporary element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract the main content from the loaded page
            const newContent = doc.querySelector('.content-area');
            
            // Update the page content if content area found
            if (newContent && contentArea) {
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
                console.error('Could not find content area in loaded page');
                // If content area not found, redirect to the page (fallback)
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
    // Remove active class from all sidebar items
    document.querySelectorAll('.accordion-body a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find the matching sidebar item and make it active
    document.querySelectorAll('.accordion-body a').forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref && (linkHref === url || url.endsWith(linkHref))) {
            link.classList.add('active');
            
            // Open the parent accordion if it's closed
            const accordionItem = link.closest('.accordion-collapse');
            if (accordionItem && !accordionItem.classList.contains('show')) {
                const accordionId = accordionItem.getAttribute('id');
                const accordionButton = document.querySelector(`[data-bs-target="#${accordionId}"]`);
                if (accordionButton) {
                    try {
                        const bsCollapse = new bootstrap.Collapse(accordionItem);
                        bsCollapse.show();
                    } catch (error) {
                        console.error('Error showing accordion:', error);
                    }
                }
            }
        }
    });
}