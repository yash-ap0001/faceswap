// Accordion functionality for sidebar
window.onload = function() {
    console.log("Window loaded, initializing accordion");
    initAccordion();
};

function initAccordion() {
    try {
        // Get all category titles and contents
        const categoryTitles = document.querySelectorAll('.category-title');
        const categoryContents = document.querySelectorAll('.category-content');
        
        console.log(`Found ${categoryTitles.length} category titles and ${categoryContents.length} content sections`);
        
        if (categoryTitles.length === 0) {
            console.error("No category titles found with class .category-title");
            return;
        }
        
        // First, close all sections
        categoryContents.forEach(content => {
            content.classList.remove('expanded');
        });
        
        categoryTitles.forEach(title => {
            title.classList.add('collapsed');
        });
        
        // Then open the Bride section by default
        const brideContent = document.getElementById('bride-content');
        const brideTitle = document.querySelector('[data-target="bride-content"]');
        
        if (brideContent && brideTitle) {
            brideContent.classList.add('expanded');
            brideTitle.classList.remove('collapsed');
            console.log("Bride section opened by default");
        } else {
            console.warn("Could not find bride section to open by default");
        }
        
        // Add click event listeners to all category titles
        categoryTitles.forEach(title => {
            title.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const targetId = this.getAttribute('data-target');
                console.log(`Clicked on category title with target: ${targetId}`);
                
                if (!targetId) {
                    console.warn("Category title missing data-target attribute");
                    return;
                }
                
                const content = document.getElementById(targetId);
                if (!content) {
                    console.warn(`Could not find content with ID: ${targetId}`);
                    return;
                }
                
                const isExpanded = content.classList.contains('expanded');
                console.log(`Category ${targetId} is currently ${isExpanded ? 'expanded' : 'collapsed'}`);
                
                // First, close all sections
                categoryContents.forEach(c => {
                    c.classList.remove('expanded');
                });
                
                categoryTitles.forEach(t => {
                    t.classList.add('collapsed');
                });
                
                // If the section wasn't already expanded, open it
                if (!isExpanded) {
                    content.classList.add('expanded');
                    this.classList.remove('collapsed');
                    console.log(`Opened category ${targetId}`);
                } else {
                    console.log(`Closed category ${targetId}`);
                }
            });
            
            console.log(`Added click listener to category title: ${title.textContent.trim()}`);
        });
        
        console.log("Accordion initialization completed successfully");
    } catch (error) {
        console.error("Error initializing accordion:", error);
    }
}