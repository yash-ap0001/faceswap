/**
 * Dialog Component
 * A reusable dialog/modal component based on shadcn/ui design principles
 */

// Define the Dialog class if it doesn't already exist
if (typeof window.Dialog === 'undefined') {
  // Define Dialog class
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
      
      // Initialize elements
      this.elements = {};
      
      // Create the dialog elements
      this._createDialog();
      
      // Setup event listeners
      this._setupEventListeners();
      
      // Bind methods to this instance
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.setLoading = this.setLoading.bind(this);
      this.setContent = this.setContent.bind(this);
      this.setTitle = this.setTitle.bind(this);
    }
    
    /**
     * Create the dialog HTML structure
     */
    _createDialog() {
      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'dialog-backdrop';
      backdrop.setAttribute('data-dialog-id', this.options.id);
      
      // Create dialog
      const dialog = document.createElement('div');
      dialog.className = `dialog dialog-${this.options.size}`;
      dialog.id = this.options.id;
      
      // Create dialog header
      const header = document.createElement('div');
      header.className = 'dialog-header';
      
      // Add title
      const title = document.createElement('h2');
      title.className = 'dialog-title';
      title.textContent = this.options.title;
      header.appendChild(title);
      
      // Add description if provided
      if (this.options.description) {
        const description = document.createElement('p');
        description.className = 'dialog-description';
        description.textContent = this.options.description;
        header.appendChild(description);
      }
      
      // Add close button if needed
      if (this.options.showCloseButton) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'dialog-close';
        closeBtn.setAttribute('aria-label', 'Close dialog');
        closeBtn.innerHTML = '&times;';
        header.appendChild(closeBtn);
        this.elements.closeBtn = closeBtn;
      }
      
      // Create content container
      const content = document.createElement('div');
      content.className = 'dialog-content';
      
      // Add content
      if (typeof this.options.content === 'string') {
        content.innerHTML = this.options.content;
      } else if (this.options.content instanceof HTMLElement) {
        content.appendChild(this.options.content);
      }
      
      // Create footer if needed
      if (this.options.footer) {
        const footer = document.createElement('div');
        footer.className = 'dialog-footer';
        
        // Add loading indicator container
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'dialog-loading-container d-none';
        
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'dialog-loading-spinner';
        loadingSpinner.innerHTML = '<div></div><div></div><div></div>';
        
        const loadingText = document.createElement('span');
        loadingText.className = 'dialog-loading-text';
        loadingText.textContent = 'Loading...';
        
        loadingContainer.appendChild(loadingSpinner);
        loadingContainer.appendChild(loadingText);
        footer.appendChild(loadingContainer);
        
        // Add progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'dialog-progress-container d-none';
        
        const progressText = document.createElement('span');
        progressText.className = 'dialog-progress-text';
        progressText.textContent = '';
        
        progressContainer.appendChild(progressText);
        footer.appendChild(progressContainer);
        
        // Add buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'dialog-buttons';
        
        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'dialog-btn dialog-btn-cancel';
        cancelBtn.textContent = this.options.cancelText;
        buttonsContainer.appendChild(cancelBtn);
        
        // Add submit button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'dialog-btn dialog-btn-submit';
        submitBtn.textContent = this.options.submitText;
        buttonsContainer.appendChild(submitBtn);
        
        footer.appendChild(buttonsContainer);
        
        // Store references to elements
        this.elements.footer = footer;
        this.elements.loadingContainer = loadingContainer;
        this.elements.loadingText = loadingText;
        this.elements.progressContainer = progressContainer;
        this.elements.progressText = progressText;
        this.elements.buttonsContainer = buttonsContainer;
        this.elements.cancelBtn = cancelBtn;
        this.elements.submitBtn = submitBtn;
        
        // Append footer to dialog
        dialog.appendChild(footer);
      }
      
      // Assemble the dialog
      dialog.appendChild(header);
      dialog.appendChild(content);
      backdrop.appendChild(dialog);
      
      // Store references to elements
      this.elements.backdrop = backdrop;
      this.elements.dialog = dialog;
      this.elements.header = header;
      this.elements.title = title;
      this.elements.content = content;
      
      // Add to DOM
      document.body.appendChild(backdrop);
    }
    
    /**
     * Setup event listeners
     */
    _setupEventListeners() {
      // Close button
      if (this.elements.closeBtn) {
        this.elements.closeBtn.addEventListener('click', this.close);
      }
      
      // Backdrop click
      if (this.options.closeOnBackdropClick) {
        this.elements.backdrop.addEventListener('click', (e) => {
          if (e.target === this.elements.backdrop) {
            this.close();
          }
        });
      }
      
      // Escape key
      if (this.options.closeOnEscapeKey) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }
      
      // Cancel button
      if (this.elements.cancelBtn) {
        this.elements.cancelBtn.addEventListener('click', () => {
          if (this.options.onCancel) {
            this.options.onCancel();
          }
          this.close();
        });
      }
      
      // Submit button
      if (this.elements.submitBtn && this.options.onSubmit) {
        this.elements.submitBtn.addEventListener('click', this.options.onSubmit);
      }
    }
    
    /**
     * Open the dialog
     */
    open() {
      // Don't open if already open
      if (this.isOpen) return;
      
      this.isOpen = true;
      this.elements.backdrop.classList.add('dialog-open');
      
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Call onOpen callback if provided
      if (this.options.onOpen) {
        this.options.onOpen();
      }
    }
    
    /**
     * Close the dialog
     */
    close() {
      // Don't close if not open
      if (!this.isOpen) return;
      
      this.isOpen = false;
      this.elements.backdrop.classList.remove('dialog-open');
      
      // Re-enable body scroll
      document.body.style.overflow = '';
      
      // Call onClose callback if provided
      if (this.options.onClose) {
        this.options.onClose();
      }
    }
    
    /**
     * Set loading state
     */
    setLoading(isLoading, loadingText = null) {
      this.isLoading = isLoading;
      
      if (!this.elements.loadingContainer) return;
      
      if (isLoading) {
        this.elements.loadingContainer.classList.remove('d-none');
        this.elements.buttonsContainer.classList.add('d-none');
        
        if (loadingText) {
          this.elements.loadingText.textContent = loadingText;
        }
      } else {
        this.elements.loadingContainer.classList.add('d-none');
        this.elements.buttonsContainer.classList.remove('d-none');
      }
    }
    
    /**
     * Set progress info
     */
    setProgress(text) {
      if (!this.elements.progressContainer) return;
      
      if (text) {
        this.elements.progressContainer.classList.remove('d-none');
        this.elements.progressText.textContent = text;
      } else {
        this.elements.progressContainer.classList.add('d-none');
      }
    }
    
    /**
     * Update dialog content
     */
    setContent(content) {
      if (!this.elements.content) return;
      
      if (typeof content === 'string') {
        this.elements.content.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.elements.content.innerHTML = '';
        this.elements.content.appendChild(content);
      }
    }
    
    /**
     * Update dialog title
     */
    setTitle(title) {
      if (!this.elements.title) return;
      
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
  }
  
  // Make Dialog class globally accessible
  window.Dialog = Dialog;
  
  // Create useDialog helper function
  function useDialog(options = {}) {
    return new Dialog(options);
  }
  
  // Make useDialog globally accessible
  window.useDialog = useDialog;
  
  // Initialize dialog triggers
  document.addEventListener('DOMContentLoaded', function() {
    // Find all dialog triggers
    const dialogTriggers = document.querySelectorAll('[data-open-dialog]');
    
    // Add click handlers
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
  });
}