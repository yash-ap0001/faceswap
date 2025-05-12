/**
 * Bulk Order Dialog Implementation
 * Uses the reusable Dialog component
 */

// Initialize the bulk order dialog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the form content
  const formContent = `
    <form id="bulk-order-form" class="space-y-4">
      <!-- Number of orders -->
      <div class="form-group">
        <label for="order-count" class="form-label fw-bold">Number of Orders</label>
        <div class="d-flex align-items-center gap-2">
          <input type="range" class="form-range" min="10" max="100" value="50" step="5" id="order-count">
          <span id="order-count-value" class="badge bg-secondary">50</span>
        </div>
      </div>
      
      <!-- Customer Type -->
      <div class="form-group">
        <label for="customer-type" class="form-label fw-bold">Customer Type</label>
        <select id="customer-type" class="form-select">
          <option value="regular">Regular</option>
          <option value="premium">Premium</option>
          <option value="new">New Customer</option>
        </select>
      </div>
      
      <!-- Order Source -->
      <div class="form-group">
        <label for="order-source" class="form-label fw-bold">Order Source</label>
        <select id="order-source" class="form-select">
          <option value="manual">Manual Entry</option>
          <option value="system">System Generated</option>
          <option value="ai">AI Recommended</option>
        </select>
      </div>
      
      <!-- Include Specific Items -->
      <div class="form-group">
        <label class="form-label fw-bold">Include Specific Items</label>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="include-bridal-items" checked>
          <label class="form-check-label" for="include-bridal-items">
            Bridal Items
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="include-groom-items">
          <label class="form-check-label" for="include-groom-items">
            Groom Items
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="include-decoration-items">
          <label class="form-check-label" for="include-decoration-items">
            Decoration Items
          </label>
        </div>
      </div>
      
      <!-- Special Instructions -->
      <div class="form-group">
        <label for="special-instructions" class="form-label fw-bold">Special Instructions</label>
        <textarea id="special-instructions" class="form-control" rows="3" placeholder="Enter any special instructions or notes"></textarea>
      </div>
    </form>
  `;

  // Create the dialog with our custom options
  const bulkOrderDialog = new Dialog({
    id: 'bulk-order-dialog',
    title: 'Create Bulk Orders',
    description: 'Generate multiple orders at once',
    size: 'md',
    content: formContent,
    submitText: 'Create Orders',
    cancelText: 'Cancel',
    onOpen: () => {
      // Initialize range input
      const orderCountSlider = document.getElementById('order-count');
      const orderCountValue = document.getElementById('order-count-value');
      
      if (orderCountSlider && orderCountValue) {
        orderCountSlider.addEventListener('input', function() {
          orderCountValue.textContent = this.value;
        });
      }
    },
    onSubmit: async () => {
      // Gather form data
      const orderCount = parseInt(document.getElementById('order-count').value);
      const customerType = document.getElementById('customer-type').value;
      const orderSource = document.getElementById('order-source').value;
      const includeBridal = document.getElementById('include-bridal-items').checked;
      const includeGroom = document.getElementById('include-groom-items').checked;
      const includeDecoration = document.getElementById('include-decoration-items').checked;
      const specialInstructions = document.getElementById('special-instructions').value;
      
      // Start loading state
      bulkOrderDialog.setLoading(true, 'Processing...');
      
      try {
        // Simulate order creation with progress updates
        for (let i = 1; i <= orderCount; i++) {
          // Update progress
          bulkOrderDialog.setProgress(`Creating order ${i} of ${orderCount}...`);
          
          // Simulate API request
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Complete
        bulkOrderDialog.setLoading(false);
        bulkOrderDialog.setProgress(`Successfully created ${orderCount} orders!`);
        
        // Close after delay
        setTimeout(() => {
          bulkOrderDialog.close();
          
          // Show success toast
          showToast('Success', `Created ${orderCount} bulk orders successfully!`, 'success');
        }, 2000);
        
      } catch (error) {
        // Handle error
        bulkOrderDialog.setLoading(false);
        bulkOrderDialog.setProgress(`Error: ${error.message || 'Failed to create orders'}`);
        
        // Show error toast
        showToast('Error', 'Failed to create bulk orders', 'danger');
      }
    }
  });

  // Function to show toast notifications
  function showToast(title, message, type = 'info') {
    // Check if we have a toast container, create if needed
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'toast-' + Math.random().toString(36).substr(2, 9);
    const toast = document.createElement('div');
    toast.className = `toast border-0 border-start border-4 border-${type}`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="toast-header bg-${type} bg-opacity-10 text-${type}">
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize and show the toast
    const bsToast = new bootstrap.Toast(toast, {
      autohide: true,
      delay: 5000
    });
    bsToast.show();
    
    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // Expose the dialog to the global scope so it can be triggered from anywhere
  window.bulkOrderDialog = bulkOrderDialog;
  
  // Add click listener to any buttons with the data attribute
  document.querySelectorAll('[data-open-dialog="bulk-order"]').forEach(button => {
    button.addEventListener('click', () => {
      bulkOrderDialog.open();
    });
  });
});