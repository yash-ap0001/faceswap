/**
 * Bulk Order Dialog Component
 * Extension of the base Dialog component for handling bulk orders/uploads
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dialog triggers
  const bulkOrderTriggers = document.querySelectorAll('[data-open-dialog="bulk-order"]');
  
  // Create toast notification function
  function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="toast-header">
        <i class="fas ${getIconForToastType(type)} me-2"></i>
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove('fade-in');
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        toast.classList.remove('fade-in');
        toast.classList.add('fade-out');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      });
    }
  }
  
  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
  }
  
  function getIconForToastType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle text-success';
      case 'error': return 'fa-exclamation-circle text-danger';
      case 'warning': return 'fa-exclamation-triangle text-warning';
      default: return 'fa-info-circle text-info';
    }
  }
  
  // Handle bulk order dialog triggers
  bulkOrderTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Create bulk order dialog
      const bulkOrderDialog = new Dialog({
        id: 'bulk-order-dialog',
        title: 'Bulk Upload',
        description: 'Upload multiple templates for different ceremonies',
        size: 'lg',
        content: `
          <form id="bulk-upload-form" enctype="multipart/form-data">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="ceremony-type" class="form-label">Ceremony Type</label>
                  <select class="form-select" id="ceremony-type" name="ceremony_type" required>
                    <option value="" selected disabled>Select ceremony type</option>
                    <option value="haldi">Haldi</option>
                    <option value="mehendi">Mehendi</option>
                    <option value="sangeeth">Sangeeth</option>
                    <option value="wedding">Wedding</option>
                    <option value="reception">Reception</option>
                  </select>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="template-type" class="form-label">Template Type</label>
                  <select class="form-select" id="template-type" name="template_type" required>
                    <option value="" selected disabled>Select template type</option>
                    <option value="natural">Natural</option>
                    <option value="ai">AI Generated</option>
                    <option value="pinterest">Pinterest</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="form-group mb-3">
              <label for="bulk-images" class="form-label">Upload Images (up to 10)</label>
              <input type="file" class="form-control" id="bulk-images" name="files[]" multiple accept="image/*" required
                     data-preview-container="bulk-preview" data-preview-images="bulk-preview-images">
              <div class="form-text text-muted">
                Select multiple image files to upload as templates.
              </div>
            </div>
            
            <div class="form-group mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="clear-existing" name="clear_existing">
                <label class="form-check-label" for="clear-existing">
                  Clear existing templates of this ceremony/type
                </label>
              </div>
            </div>
            
            <div id="bulk-preview" class="mb-3 d-none">
              <h6>Selected Images (Thumbnail Preview)</h6>
              <div class="row g-2 mt-2" id="bulk-preview-images"></div>
            </div>
          </form>
        `,
        submitText: 'Upload Templates',
        cancelText: 'Cancel',
        footer: true,
        onSubmit: function() {
          const form = document.getElementById('bulk-upload-form');
          const formData = new FormData(form);
          const fileInput = document.getElementById('bulk-images');
          
          if (fileInput.files.length === 0) {
            showToast('Error', 'Please select at least one image file to upload.', 'error');
            return;
          }
          
          if (fileInput.files.length > 10) {
            showToast('Error', 'Maximum 10 files allowed for bulk upload.', 'error');
            return;
          }
          
          // Set loading state
          this.setLoading(true, 'Uploading templates...');
          
          // Simulate upload progress (in a real app, this would track actual upload progress)
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
              this.setProgress(`Uploading... ${progress}%`);
            }
          }, 500);
          
          // Simulate API call (in a real app, this would be a fetch or XHR request)
          setTimeout(() => {
            clearInterval(progressInterval);
            this.setProgress('Processing uploads...');
            
            // Simulate API response
            setTimeout(() => {
              this.setLoading(false);
              this.close();
              
              // Show success toast
              showToast('Success', `${fileInput.files.length} templates uploaded successfully.`, 'success');
            }, 1000);
          }, 5000);
        }
      });
      
      // Handle file input change
      document.getElementById('bulk-images').addEventListener('change', function() {
        const previewContainer = document.getElementById('bulk-preview');
        const previewImages = document.getElementById('bulk-preview-images');
        
        // Clear existing previews
        previewImages.innerHTML = '';
        
        if (this.files.length > 0) {
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
              img.style.height = '100px';
              img.style.objectFit = 'cover';
              
              const cardBody = document.createElement('div');
              cardBody.className = 'card-body p-2';
              
              const cardText = document.createElement('p');
              cardText.className = 'card-text small text-truncate mb-0';
              cardText.textContent = file.name;
              
              cardBody.appendChild(cardText);
              imgContainer.appendChild(img);
              imgContainer.appendChild(cardBody);
              col.appendChild(imgContainer);
              
              previewImages.appendChild(col);
            };
            
            reader.readAsDataURL(file);
          });
        } else {
          previewContainer.classList.add('d-none');
        }
      });
      
      // Open the dialog
      bulkOrderDialog.open();
    });
  });
  
  // Add custom styles for toast notifications
  const style = document.createElement('style');
  style.textContent = `
    #toast-container {
      z-index: 1060;
    }
    
    .toast {
      max-width: 350px;
      background-color: rgba(33, 37, 41, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .toast-success .toast-header {
      background-color: rgba(25, 135, 84, 0.2);
      color: #198754;
    }
    
    .toast-error .toast-header {
      background-color: rgba(220, 53, 69, 0.2);
      color: #dc3545;
    }
    
    .toast-warning .toast-header {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }
    
    .toast-info .toast-header {
      background-color: rgba(13, 110, 253, 0.2);
      color: #0d6efd;
    }
    
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    
    .fade-out {
      animation: fadeOut 0.3s ease-out;
      opacity: 0;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
});