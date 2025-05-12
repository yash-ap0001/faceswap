/**
 * Dialog Component
 * A reusable dialog/modal component based on shadcn/ui design principles
 */

// Check if Dialog is already defined to avoid redeclaration
if (typeof Dialog === 'undefined') {
  /**
   * Dialog class for creating and managing dialog components
   */
  class Dialog {
  constructor(options = {}) {
    // Default options
    this.options = Object.assign({
      id: `dialog-${Date.now()}`, // Unique ID
      title: 'Dialog',
      description: null,
      content: '',
      size: 'md', // xs, sm, md, lg, xl, full
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      showCloseButton: true,
      submitText: 'Submit',
      cancelText: 'Cancel',
      footer: true,
      onSubmit: null,
      onCancel: null,
      onOpen: null,
      onClose: null
    }, options);
    
    // State variables
    this.isOpen = false;
    this.isLoading = false;
    this.elements = {}; // Will store references to DOM elements
    
    // Create dialog DOM structure
    this._createDialog();
    
    // Setup event listeners
    this._setupEventListeners();
  }
  
  /**
   * Create the dialog HTML structure
   */
  _createDialog() {
    // Create backdrop
    this.elements.backdrop = document.createElement('div');
    this.elements.backdrop.className = 'dialog-backdrop';
    this.elements.backdrop.id = `${this.options.id}-backdrop`;
    this.elements.backdrop.setAttribute('aria-hidden', 'true');
    
    // Create content container
    this.elements.content = document.createElement('div');
    this.elements.content.className = `dialog-content dialog-${this.options.size}`;
    this.elements.content.setAttribute('role', 'dialog');
    this.elements.content.setAttribute('aria-modal', 'true');
    this.elements.content.setAttribute('aria-labelledby', `${this.options.id}-title`);
    
    if (this.options.description) {
      this.elements.content.setAttribute('aria-describedby', `${this.options.id}-description`);
    }
    
    // Create close button
    if (this.options.showCloseButton) {
      this.elements.closeBtn = document.createElement('button');
      this.elements.closeBtn.className = 'dialog-close';
      this.elements.closeBtn.setAttribute('aria-label', 'Close dialog');
      this.elements.closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      this.elements.content.appendChild(this.elements.closeBtn);
    }
    
    // Create header
    this.elements.header = document.createElement('div');
    this.elements.header.className = 'dialog-header';
    
    this.elements.title = document.createElement('h2');
    this.elements.title.className = 'dialog-title';
    this.elements.title.id = `${this.options.id}-title`;
    this.elements.title.textContent = this.options.title;
    this.elements.header.appendChild(this.elements.title);
    
    if (this.options.description) {
      this.elements.description = document.createElement('p');
      this.elements.description.className = 'dialog-description';
      this.elements.description.id = `${this.options.id}-description`;
      this.elements.description.textContent = this.options.description;
      this.elements.header.appendChild(this.elements.description);
    }
    
    this.elements.content.appendChild(this.elements.header);
    
    // Create body
    this.elements.body = document.createElement('div');
    this.elements.body.className = 'dialog-body';
    this.elements.body.innerHTML = this.options.content;
    this.elements.content.appendChild(this.elements.body);
    
    // Create footer
    if (this.options.footer) {
      this.elements.footer = document.createElement('div');
      this.elements.footer.className = 'dialog-footer';
      
      // Cancel button
      this.elements.cancelBtn = document.createElement('button');
      this.elements.cancelBtn.className = 'btn btn-outline-secondary';
      this.elements.cancelBtn.textContent = this.options.cancelText;
      this.elements.footer.appendChild(this.elements.cancelBtn);
      
      // Submit button
      this.elements.submitBtn = document.createElement('button');
      this.elements.submitBtn.className = 'btn btn-primary';
      this.elements.submitBtn.textContent = this.options.submitText;
      this.elements.footer.appendChild(this.elements.submitBtn);
      
      this.elements.content.appendChild(this.elements.footer);
    }
    
    // Create loading overlay
    this.elements.loadingOverlay = document.createElement('div');
    this.elements.loadingOverlay.className = 'dialog-loading-overlay';
    
    this.elements.loadingSpinner = document.createElement('div');
    this.elements.loadingSpinner.className = 'dialog-loading-spinner spinner-border text-primary';
    this.elements.loadingSpinner.setAttribute('role', 'status');
    
    this.elements.loadingText = document.createElement('div');
    this.elements.loadingText.className = 'dialog-loading-text';
    this.elements.loadingText.textContent = 'Loading...';
    
    this.elements.loadingOverlay.appendChild(this.elements.loadingSpinner);
    this.elements.loadingOverlay.appendChild(this.elements.loadingText);
    
    this.elements.content.appendChild(this.elements.loadingOverlay);
    
    // Add content to backdrop
    this.elements.backdrop.appendChild(this.elements.content);
    
    // Add to document body
    document.body.appendChild(this.elements.backdrop);
  }
  
  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Close button click
    if (this.elements.closeBtn) {
      this.elements.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    }
    
    // Cancel button click
    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof this.options.onCancel === 'function') {
          this.options.onCancel.call(this, e);
        } else {
          this.close();
        }
      });
    }
    
    // Submit button click
    if (this.elements.submitBtn) {
      this.elements.submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof this.options.onSubmit === 'function') {
          this.options.onSubmit.call(this, e);
        } else {
          this.close();
        }
      });
    }
    
    // Close on backdrop click
    if (this.options.closeOnBackdropClick) {
      this.elements.backdrop.addEventListener('click', (e) => {
        if (e.target === this.elements.backdrop) {
          this.close();
        }
      });
    }
    
    // Close on Escape key
    if (this.options.closeOnEscapeKey) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }
  
  /**
   * Open the dialog
   */
  open() {
    if (this.isOpen) return;
    
    // Set aria-hidden to false
    this.elements.backdrop.setAttribute('aria-hidden', 'false');
    
    // Add open class
    this.elements.backdrop.classList.add('open');
    
    // Set focus to the dialog
    this.elements.content.focus();
    
    // Set isOpen to true
    this.isOpen = true;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Call onOpen callback
    if (typeof this.options.onOpen === 'function') {
      this.options.onOpen.call(this);
    }
  }
  
  /**
   * Close the dialog
   */
  close() {
    if (!this.isOpen) return;
    
    // Set aria-hidden to true
    this.elements.backdrop.setAttribute('aria-hidden', 'true');
    
    // Remove open class
    this.elements.backdrop.classList.remove('open');
    
    // Set isOpen to false
    this.isOpen = false;
    
    // Allow body scrolling
    document.body.style.overflow = '';
    
    // Call onClose callback
    if (typeof this.options.onClose === 'function') {
      this.options.onClose.call(this);
    }
  }
  
  /**
   * Set loading state
   */
  setLoading(isLoading, loadingText = null) {
    this.isLoading = isLoading;
    
    if (isLoading) {
      this.elements.loadingOverlay.classList.add('active');
      if (loadingText) {
        this.elements.loadingText.textContent = loadingText;
      }
    } else {
      this.elements.loadingOverlay.classList.remove('active');
    }
    
    // Disable/enable form elements and buttons
    const interactiveElements = this.elements.content.querySelectorAll('button, input, select, textarea');
    interactiveElements.forEach(el => {
      el.disabled = isLoading;
    });
  }
  
  /**
   * Set progress info
   */
  setProgress(text) {
    if (!this.elements.loadingProgress) {
      this.elements.loadingProgress = document.createElement('div');
      this.elements.loadingProgress.className = 'dialog-progress';
      this.elements.loadingOverlay.appendChild(this.elements.loadingProgress);
    }
    
    this.elements.loadingProgress.textContent = text;
    this.elements.loadingProgress.style.display = text ? 'block' : 'none';
  }
  
  /**
   * Update dialog content
   */
  setContent(content) {
    this.elements.body.innerHTML = content;
  }
  
  /**
   * Update dialog title
   */
  setTitle(title) {
    this.options.title = title;
    this.elements.title.textContent = title;
  }
  
  /**
   * Update dialog size
   */
  setSize(size) {
    const validSizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];
    if (!validSizes.includes(size)) {
      console.warn(`Invalid dialog size: ${size}. Using 'md' instead.`);
      size = 'md';
    }
    
    // Remove existing size class
    validSizes.forEach(s => {
      this.elements.content.classList.remove(`dialog-${s}`);
    });
    
    // Add new size class
    this.elements.content.classList.add(`dialog-${size}`);
    
    this.options.size = size;
  }
  
  /**
   * Destroy the dialog
   */
  destroy() {
    // Remove event listeners
    if (this.elements.closeBtn) {
      this.elements.closeBtn.removeEventListener('click', this.close);
    }
    
    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.removeEventListener('click', this.close);
    }
    
    if (this.elements.submitBtn && this.options.onSubmit) {
      this.elements.submitBtn.removeEventListener('click', this.options.onSubmit);
    }
    
    // Remove from DOM
    if (this.elements.backdrop && this.elements.backdrop.parentNode) {
      this.elements.backdrop.parentNode.removeChild(this.elements.backdrop);
    }
  }
} // End of Dialog class

  /**
   * Create a dialog hook for ease of use (similar to React hooks)
   */
  function useDialog(options = {}) {
    return new Dialog(options);
  }
  
  /**
   * Initialize dialog triggers in the DOM
   */
  document.addEventListener('DOMContentLoaded', function() {
  // Initialize dialog triggers
  const dialogTriggers = document.querySelectorAll('[data-open-dialog]');
  dialogTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const dialogId = this.getAttribute('data-open-dialog');
      const dialog = document.getElementById(dialogId);
      
      if (!dialog) {
        console.warn(`Dialog with id "${dialogId}" not found.`);
        return;
      }
      
      // Show the modal using Bootstrap if available
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(dialog);
        modal.show();
      } else {
        // Fallback to basic functionality
        dialog.style.display = 'block';
        dialog.classList.add('show');
      }
    });
  });
  }); // End of DOMContentLoaded listener
} // End of if block