/**
 * Image Viewer Dialog
 * Extension of the base Dialog component with specialized image viewing capabilities
 */

document.addEventListener('DOMContentLoaded', function() {
  // Track gallery collections
  const galleries = {};
  
  // Image viewer state
  let currentGallery = null;
  let currentImageIndex = 0;
  let imageScale = 1;
  let dragStartX = 0;
  let dragStartY = 0;
  let imageOffsetX = 0;
  let imageOffsetY = 0;
  let isDragging = false;
  
  // Create the base dialog
  const imageViewerDialog = new Dialog({
    id: 'image-viewer-dialog',
    title: 'Image Viewer',
    description: null,
    size: 'lg',
    content: `
      <div class="image-viewer-container">
        <img src="" class="image-viewer-img" id="viewer-img" alt="Image Preview">
        <div class="image-zoom-controls">
          <button class="image-viewer-btn" id="zoom-out-btn" title="Zoom Out">
            <i class="fas fa-search-minus"></i>
          </button>
          <span class="image-zoom-percentage">100%</span>
          <button class="image-viewer-btn" id="zoom-in-btn" title="Zoom In">
            <i class="fas fa-search-plus"></i>
          </button>
          <button class="image-viewer-btn" id="zoom-reset-btn" title="Reset Zoom">
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
      <div class="image-viewer-toolbar">
        <div class="image-viewer-controls">
          <button class="image-viewer-btn" id="prev-image-btn" title="Previous Image">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="image-viewer-caption"></span>
          <button class="image-viewer-btn" id="next-image-btn" title="Next Image">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="image-viewer-controls">
          <button class="image-viewer-btn" id="download-image-btn" title="Download Image">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
    `,
    footer: false,
    closeOnEscapeKey: true,
    onOpen: function() {
      setupImageViewer();
    },
    onClose: function() {
      // Reset state when dialog closes
      imageScale = 1;
      imageOffsetX = 0;
      imageOffsetY = 0;
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    }
  });
  
  // Add special class to dialog content
  imageViewerDialog.elements.content.classList.add('dialog-image-viewer');
  
  // Initialize gallery images
  function setupImageViewer() {
    const container = imageViewerDialog.elements.content.querySelector('.image-viewer-container');
    const img = container.querySelector('img');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    const downloadBtn = document.getElementById('download-image-btn');
    const zoomDisplay = document.querySelector('.image-zoom-percentage');
    
    // Add event listeners
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    zoomResetBtn.addEventListener('click', resetZoom);
    prevBtn.addEventListener('click', navigateToPrevImage);
    nextBtn.addEventListener('click', navigateToNextImage);
    downloadBtn.addEventListener('click', downloadCurrentImage);
    
    // Setup drag and zoom handlers
    setupDragHandlers();
    
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Load current image
    showCurrentImage();
  }
  
  function setupDragHandlers() {
    const container = imageViewerDialog.elements.content.querySelector('.image-viewer-container');
    const img = container.querySelector('img');
    
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('mousemove', dragImage);
    document.addEventListener('touchmove', dragImageTouch, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('mouseleave', stopDrag);
  }
  
  function startDrag(e) {
    if (imageScale <= 1) return;
    
    const img = imageViewerDialog.elements.content.querySelector('.image-viewer-img');
    const container = imageViewerDialog.elements.content.querySelector('.image-viewer-container');
    
    isDragging = true;
    container.classList.add('dragging');
    dragStartX = e.clientX - imageOffsetX;
    dragStartY = e.clientY - imageOffsetY;
    e.preventDefault();
  }
  
  function startDragTouch(e) {
    if (imageScale <= 1) return;
    
    const img = imageViewerDialog.elements.content.querySelector('.image-viewer-img');
    const container = imageViewerDialog.elements.content.querySelector('.image-viewer-container');
    
    isDragging = true;
    container.classList.add('dragging');
    dragStartX = e.touches[0].clientX - imageOffsetX;
    dragStartY = e.touches[0].clientY - imageOffsetY;
    e.preventDefault();
  }
  
  function dragImage(e) {
    if (!isDragging) return;
    
    imageOffsetX = e.clientX - dragStartX;
    imageOffsetY = e.clientY - dragStartY;
    
    applyZoom();
    e.preventDefault();
  }
  
  function dragImageTouch(e) {
    if (!isDragging) return;
    
    imageOffsetX = e.touches[0].clientX - dragStartX;
    imageOffsetY = e.touches[0].clientY - dragStartY;
    
    applyZoom();
    e.preventDefault();
  }
  
  function stopDrag() {
    const container = imageViewerDialog.elements.content.querySelector('.image-viewer-container');
    isDragging = false;
    container.classList.remove('dragging');
  }
  
  function handleKeyboardShortcuts(e) {
    if (!imageViewerDialog.isOpen) return;
    
    if (e.key === 'ArrowLeft') {
      navigateToPrevImage();
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      navigateToNextImage();
      e.preventDefault();
    } else if (e.key === '+' || e.key === '=') {
      zoomIn();
      e.preventDefault();
    } else if (e.key === '-' || e.key === '_') {
      zoomOut();
      e.preventDefault();
    } else if (e.key === '0') {
      resetZoom();
      e.preventDefault();
    }
  }
  
  function zoomIn() {
    imageScale = Math.min(imageScale + 0.25, 5);
    imageOffsetX = 0;
    imageOffsetY = 0;
    applyZoom();
  }
  
  function zoomOut() {
    imageScale = Math.max(imageScale - 0.25, 0.5);
    imageOffsetX = 0;
    imageOffsetY = 0;
    applyZoom();
  }
  
  function resetZoom() {
    imageScale = 1;
    imageOffsetX = 0;
    imageOffsetY = 0;
    applyZoom();
  }
  
  function applyZoom() {
    const img = imageViewerDialog.elements.content.querySelector('.image-viewer-img');
    const zoomDisplay = imageViewerDialog.elements.content.querySelector('.image-zoom-percentage');
    
    img.style.transform = `scale(${imageScale}) translate(${imageOffsetX / imageScale}px, ${imageOffsetY / imageScale}px)`;
    zoomDisplay.textContent = `${Math.round(imageScale * 100)}%`;
  }
  
  function navigateToPrevImage() {
    if (!currentGallery || galleries[currentGallery].length <= 1) return;
    
    currentImageIndex = (currentImageIndex - 1 + galleries[currentGallery].length) % galleries[currentGallery].length;
    showCurrentImage();
  }
  
  function navigateToNextImage() {
    if (!currentGallery || galleries[currentGallery].length <= 1) return;
    
    currentImageIndex = (currentImageIndex + 1) % galleries[currentGallery].length;
    showCurrentImage();
  }
  
  function showCurrentImage() {
    if (!currentGallery) return;
    
    const gallery = galleries[currentGallery];
    if (gallery.length === 0) return;
    
    const currentImage = gallery[currentImageIndex];
    const img = imageViewerDialog.elements.content.querySelector('.image-viewer-img');
    const caption = imageViewerDialog.elements.content.querySelector('.image-viewer-caption');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    
    // Reset zoom
    resetZoom();
    
    // Update image source and alt text
    img.src = currentImage.src;
    img.alt = currentImage.alt || `Image ${currentImageIndex + 1}`;
    
    // Update caption
    caption.textContent = `${currentImageIndex + 1} / ${gallery.length}`;
    
    // Update navigation button states
    prevBtn.disabled = gallery.length <= 1;
    nextBtn.disabled = gallery.length <= 1;
  }
  
  function downloadCurrentImage() {
    if (!currentGallery) return;
    
    const gallery = galleries[currentGallery];
    if (gallery.length === 0) return;
    
    const currentImage = gallery[currentImageIndex];
    const a = document.createElement('a');
    
    // Use fetch to get the image as a blob
    fetch(currentImage.src)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = currentImage.alt || `image-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Error downloading image:', error);
      });
  }
  
  // Setup global image viewer capability
  document.querySelectorAll('[data-image-viewer]').forEach(img => {
    // Get gallery ID (defaults to 'default' if not specified)
    const galleryId = img.getAttribute('data-gallery-id') || 'default';
    
    // Initialize gallery if needed
    if (!galleries[galleryId]) {
      galleries[galleryId] = [];
    }
    
    // Add image to gallery collection
    galleries[galleryId].push(img);
    
    // Add click event listener
    img.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Set current gallery and index
      currentGallery = galleryId;
      currentImageIndex = galleries[galleryId].indexOf(img);
      
      // Open the viewer
      imageViewerDialog.open();
    });
  });
});