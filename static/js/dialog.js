/**
 * Dialog Component
 * A reusable dialog/modal component based on shadcn/ui design principles
 */

class Dialog {
  constructor(options = {}) {
    this.id = options.id || 'dialog-' + Math.random().toString(36).substr(2, 9);
    this.title = options.title || 'Dialog';
    this.description = options.description || '';
    this.size = options.size || 'md'; // sm, md, lg, xl, full
    this.content = options.content || '';
    this.footer = options.footer || true;
    this.closeButton = options.closeButton !== false;
    this.backdropClose = options.backdropClose !== false;
    this.submitText = options.submitText || 'Confirm';
    this.cancelText = options.cancelText || 'Cancel';
    this.showCancel = options.showCancel !== false;
    this.onOpen = options.onOpen || (() => {});
    this.onClose = options.onClose || (() => {});
    this.onSubmit = options.onSubmit || (() => {});
    this.preventBodyScroll = options.preventBodyScroll !== false;
    
    this.element = null;
    this.isOpen = false;
    this.isLoading = false;
    
    // Create dialog element
    this._createDialog();
    
    // Add to DOM
    document.body.appendChild(this.element);
    
    // Setup event listeners
    this._setupEventListeners();
  }
  
  /**
   * Create the dialog HTML structure
   */
  _createDialog() {
    // Create overlay
    this.element = document.createElement('div');
    this.element.id = this.id + '-overlay';
    this.element.className = 'dialog-overlay';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', this.id + '-title');
    
    // Content wrapper
    const content = document.createElement('div');
    content.className = `dialog-content dialog-${this.size}`;
    content.id = this.id + '-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'dialog-header';
    
    const titleWrapper = document.createElement('div');
    
    const title = document.createElement('h2');
    title.id = this.id + '-title';
    title.className = 'dialog-title';
    title.textContent = this.title;
    
    titleWrapper.appendChild(title);
    
    if (this.description) {
      const description = document.createElement('p');
      description.id = this.id + '-description';
      description.className = 'dialog-description';
      description.textContent = this.description;
      titleWrapper.appendChild(description);
    }
    
    header.appendChild(titleWrapper);
    
    // Close button
    if (this.closeButton) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'dialog-close';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      closeBtn.addEventListener('click', () => this.close());
      content.appendChild(closeBtn);
    }
    
    // Body
    const body = document.createElement('div');
    body.className = 'dialog-body';
    
    if (typeof this.content === 'string') {
      body.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      body.appendChild(this.content);
    }
    
    // Progress info
    const progressInfo = document.createElement('div');
    progressInfo.id = this.id + '-progress';
    progressInfo.className = 'dialog-progress d-none';
    body.appendChild(progressInfo);
    
    // Footer
    if (this.footer) {
      const footer = document.createElement('div');
      footer.className = 'dialog-footer';
      
      if (this.showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-outline-secondary';
        cancelBtn.textContent = this.cancelText;
        cancelBtn.addEventListener('click', () => this.close());
        footer.appendChild(cancelBtn);
      }
      
      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.id = this.id + '-submit';
      submitBtn.className = 'btn btn-primary';
      submitBtn.innerHTML = `
        <span>${this.submitText}</span>
        <span id="${this.id}-spinner" class="dialog-spinner d-none"></span>
      `;
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.onSubmit(e);
      });
      
      footer.appendChild(submitBtn);
      content.appendChild(footer);
    }
    
    // Assemble dialog
    content.appendChild(header);
    content.appendChild(body);
    
    this.element.appendChild(content);
  }
  
  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Close on backdrop click
    if (this.backdropClose) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && !this.isLoading) {
        this.close();
      }
    });
  }
  
  /**
   * Open the dialog
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.element.classList.add('dialog-active');
    
    // Prevent body scrolling
    if (this.preventBodyScroll) {
      document.body.classList.add('dialog-visible');
    }
    
    // Focus the dialog for accessibility
    setTimeout(() => {
      const firstInput = this.element.querySelector('input, button:not(.dialog-close)');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
    
    // Call onOpen callback
    this.onOpen();
    
    // Custom event
    this.element.dispatchEvent(new CustomEvent('dialog:opened'));
    
    return this;
  }
  
  /**
   * Close the dialog
   */
  close() {
    if (!this.isOpen || this.isLoading) return;
    
    this.isOpen = false;
    this.element.classList.remove('dialog-active');
    
    // Re-enable body scrolling
    if (this.preventBodyScroll) {
      document.body.classList.remove('dialog-visible');
    }
    
    // Call onClose callback
    this.onClose();
    
    // Custom event
    this.element.dispatchEvent(new CustomEvent('dialog:closed'));
    
    return this;
  }
  
  /**
   * Set loading state
   */
  setLoading(isLoading, loadingText = null) {
    this.isLoading = isLoading;
    
    const submitBtn = document.getElementById(this.id + '-submit');
    const spinner = document.getElementById(this.id + '-spinner');
    
    if (!submitBtn || !spinner) return this;
    
    if (isLoading) {
      submitBtn.disabled = true;
      spinner.classList.remove('d-none');
      
      if (loadingText) {
        submitBtn.querySelector('span:first-child').textContent = loadingText;
      }
    } else {
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
      submitBtn.querySelector('span:first-child').textContent = this.submitText;
    }
    
    return this;
  }
  
  /**
   * Set progress info
   */
  setProgress(text) {
    const progressEl = document.getElementById(this.id + '-progress');
    
    if (!progressEl) return this;
    
    if (text) {
      progressEl.textContent = text;
      progressEl.classList.remove('d-none');
    } else {
      progressEl.classList.add('d-none');
    }
    
    return this;
  }
  
  /**
   * Update dialog content
   */
  setContent(content) {
    const bodyEl = this.element.querySelector('.dialog-body');
    
    if (!bodyEl) return this;
    
    // Remove progress info element
    const progressEl = document.getElementById(this.id + '-progress');
    
    // Clear existing content
    bodyEl.innerHTML = '';
    
    // Add new content
    if (typeof content === 'string') {
      bodyEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      bodyEl.appendChild(content);
    }
    
    // Add back progress info
    if (progressEl) {
      bodyEl.appendChild(progressEl);
    }
    
    return this;
  }
  
  /**
   * Update dialog title
   */
  setTitle(title) {
    const titleEl = document.getElementById(this.id + '-title');
    
    if (titleEl) {
      titleEl.textContent = title;
    }
    
    return this;
  }
  
  /**
   * Update dialog size
   */
  setSize(size) {
    const contentEl = document.getElementById(this.id + '-content');
    
    if (contentEl) {
      contentEl.className = contentEl.className.replace(/dialog-(sm|md|lg|xl|full)/, '');
      contentEl.classList.add(`dialog-${size}`);
    }
    
    return this;
  }
  
  /**
   * Destroy the dialog
   */
  destroy() {
    if (this.element) {
      document.body.removeChild(this.element);
    }
  }
}

/**
 * Create a dialog hook for ease of use (similar to React hooks)
 */
function useDialog(options = {}) {
  const dialog = new Dialog(options);
  
  return {
    dialog,
    isOpen: () => dialog.isOpen,
    open: () => dialog.open(),
    close: () => dialog.close(),
    setLoading: (loading, text) => dialog.setLoading(loading, text),
    setProgress: (text) => dialog.setProgress(text),
    setContent: (content) => dialog.setContent(content),
    setTitle: (title) => dialog.setTitle(title),
    setSize: (size) => dialog.setSize(size),
    destroy: () => dialog.destroy()
  };
}

// For using directly in HTML templates
window.Dialog = Dialog;
window.useDialog = useDialog;