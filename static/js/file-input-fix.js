/**
 * File Input Fix
 * This script adds proper event listeners to file inputs that might have been affected
 * by JavaScript errors or conflicts.
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing file input fix');
  
  // Fix all file inputs on the page
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  fileInputs.forEach(function(input) {
    console.log(`Adding enhanced event listener to file input: ${input.id || 'unnamed'}`);
    
    // Remove existing listeners by cloning and replacing the element
    const parent = input.parentNode;
    const clone = input.cloneNode(true);
    parent.replaceChild(clone, input);
    
    // Add new event listener
    clone.addEventListener('change', function() {
      console.log(`File input changed: ${this.id || 'unnamed'}`);
      
      // Handle file preview if applicable
      const previewId = this.getAttribute('data-preview');
      const placeholderId = this.getAttribute('data-placeholder');
      
      if(previewId && placeholderId) {
        const preview = document.getElementById(previewId);
        const placeholder = document.getElementById(placeholderId);
        
        if(preview && placeholder && this.files && this.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
            placeholder.classList.add('d-none');
          };
          
          reader.readAsDataURL(this.files[0]);
        }
      }
      
      // If this is a multi-file input with a preview container
      const previewContainerId = this.getAttribute('data-preview-container');
      const previewImagesId = this.getAttribute('data-preview-images');
      
      if(previewContainerId && previewImagesId && this.files && this.files.length > 0) {
        const previewContainer = document.getElementById(previewContainerId);
        const previewImages = document.getElementById(previewImagesId);
        
        if(previewContainer && previewImages) {
          // Clear existing previews
          previewImages.innerHTML = '';
          previewContainer.classList.remove('d-none');
          
          // Create thumbnails
          Array.from(this.files).forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
              const col = document.createElement('div');
              col.className = 'col-4 col-md-3 col-lg-2';
              
              const imgContainer = document.createElement('div');
              imgContainer.className = 'card bg-dark h-100';
              
              const img = document.createElement('img');
              img.src = e.target.result;
              img.className = 'card-img-top';
              img.alt = file.name;
              
              const cardBody = document.createElement('div');
              cardBody.className = 'card-body p-2';
              
              const cardText = document.createElement('p');
              cardText.className = 'card-text small text-truncate mb-0';
              cardText.title = file.name;
              cardText.textContent = file.name;
              
              cardBody.appendChild(cardText);
              imgContainer.appendChild(img);
              imgContainer.appendChild(cardBody);
              col.appendChild(imgContainer);
              previewImages.appendChild(col);
            };
            
            reader.readAsDataURL(file);
          });
        }
      }
      
      // Dispatch a custom event for other components to listen for
      const event = new CustomEvent('fileinputchange', {
        detail: {
          input: this,
          files: this.files
        },
        bubbles: true
      });
      this.dispatchEvent(event);
    });
  });
  
  // Fix clear buttons for file inputs
  const clearButtons = document.querySelectorAll('[data-clear-file-input]');
  
  clearButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const inputId = this.getAttribute('data-clear-file-input');
      const input = document.getElementById(inputId);
      
      if(input) {
        // Reset the file input
        input.value = '';
        
        const previewId = input.getAttribute('data-preview');
        const placeholderId = input.getAttribute('data-placeholder');
        
        if(previewId && placeholderId) {
          const preview = document.getElementById(previewId);
          const placeholder = document.getElementById(placeholderId);
          
          if(preview && placeholder) {
            preview.classList.add('d-none');
            placeholder.classList.remove('d-none');
          }
        }
        
        // Fire the change event
        const event = new Event('change');
        input.dispatchEvent(event);
      }
    });
  });
});