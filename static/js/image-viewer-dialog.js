/**
 * Image Viewer Dialog Implementation
 * Uses the reusable Dialog component
 */

// Initialize the image viewer dialog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Global variables for image viewer
  let currentZoomLevel = 1;
  let currentResultIndex = 0;
  let resultImages = [];
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let translateX = 0;
  let translateY = 0;
  
  // Create the image viewer content
  const imageViewerContent = `
    <div class="image-viewer-container position-relative h-100 w-100 d-flex align-items-center justify-content-center">
      <!-- Top-right zoom controls -->
      <div class="zoom-controls position-absolute top-4 end-4 z-10 d-flex gap-2">
        <button id="zoom-out-btn" class="btn btn-dark bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle p-2" title="Zoom Out">
          <i class="fas fa-search-minus"></i>
        </button>
        <button id="zoom-reset-btn" class="btn btn-dark bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle p-2" title="Reset Zoom">
          <i class="fas fa-expand"></i>
        </button>
        <button id="zoom-in-btn" class="btn btn-dark bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle p-2" title="Zoom In">
          <i class="fas fa-search-plus"></i>
        </button>
      </div>
      
      <!-- Previous/Next navigation buttons -->
      <button id="prev-image-btn" class="nav-btn btn btn-dark bg-opacity-50 position-absolute start-4 top-50 translate-middle-y rounded-circle d-flex align-items-center justify-content-center" 
              style="width: 46px; height: 46px;">
        <i class="fas fa-chevron-left fa-lg"></i>
      </button>
      
      <button id="next-image-btn" class="nav-btn btn btn-dark bg-opacity-50 position-absolute end-4 top-50 translate-middle-y rounded-circle d-flex align-items-center justify-content-center" 
              style="width: 46px; height: 46px;">
        <i class="fas fa-chevron-right fa-lg"></i>
      </button>
      
      <!-- Main image container -->
      <div class="image-container overflow-hidden w-100 h-100 d-flex align-items-center justify-content-center">
        <img id="full-size-image" class="max-h-80vh max-w-95 transition-transform duration-200 ease-out" 
             src="" alt="Enlarged Image">
      </div>
      
      <!-- Image counter badge -->
      <div class="position-absolute top-4 start-4 z-10">
        <span id="image-counter" class="badge bg-dark bg-opacity-75 py-1 px-2 rounded-pill">Image 1 of 1</span>
      </div>
    </div>
  `;

  // Custom footer for the image viewer
  const imageViewerFooter = document.createElement('div');
  imageViewerFooter.className = 'dialog-footer';
  imageViewerFooter.innerHTML = `
    <div class="text-muted small d-flex align-items-center">
      <i class="fas fa-keyboard me-1 text-secondary"></i>
      <span>Use arrow keys to navigate, +/- to zoom</span>
    </div>
    
    <!-- Bottom Right Zoom Controls -->
    <div class="zoom-controls-bottom d-flex align-items-center me-auto ms-3">
      <div class="btn-group btn-group-sm">
        <button id="zoom-out-btn-bottom" class="btn btn-dark bg-opacity-75" title="Zoom Out">
          <i class="fas fa-search-minus"></i>
        </button>
        <span class="btn btn-dark bg-opacity-75 disabled zoom-level-display">
          <span id="zoom-level-text">100%</span>
        </span>
        <button id="zoom-in-btn-bottom" class="btn btn-dark bg-opacity-75" title="Zoom In">
          <i class="fas fa-search-plus"></i>
        </button>
        <button id="zoom-reset-btn-bottom" class="btn btn-dark bg-opacity-75" title="Reset Zoom">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
    
    <div class="d-flex gap-2">
      <button type="button" class="btn btn-outline-secondary" data-dialog-close>
        <i class="fas fa-times me-1"></i> Close
      </button>
      <button id="download-image-btn" class="btn btn-success">
        <i class="fas fa-download me-1"></i> Download
      </button>
    </div>
  `;

  // Create the dialog with our custom options
  const imageViewerDialog = new Dialog({
    id: 'image-viewer-dialog',
    title: 'Image Viewer',
    size: 'full',
    content: imageViewerContent,
    footer: false, // We'll add our custom footer
    closeButton: true,
    backdropClose: true,
    onOpen: () => {
      // Initialize controls and event listeners
      setupImageViewer();
      
      // Show current image
      showCurrentImage();
    },
    onClose: () => {
      // Reset state when closed
      resetZoom();
      resultImages = [];
      currentResultIndex = 0;
    }
  });

  // Replace the default footer with our custom one
  imageViewerDialog.element.querySelector('.dialog-content').appendChild(imageViewerFooter);

  // Setup image viewer functionality
  function setupImageViewer() {
    // Setup zoom buttons (top controls)
    document.getElementById('zoom-in-btn').addEventListener('click', zoomIn);
    document.getElementById('zoom-out-btn').addEventListener('click', zoomOut);
    document.getElementById('zoom-reset-btn').addEventListener('click', resetZoom);
    
    // Setup zoom buttons (bottom controls)
    document.getElementById('zoom-in-btn-bottom').addEventListener('click', zoomIn);
    document.getElementById('zoom-out-btn-bottom').addEventListener('click', zoomOut);
    document.getElementById('zoom-reset-btn-bottom').addEventListener('click', resetZoom);
    
    // Setup navigation buttons
    document.getElementById('prev-image-btn').addEventListener('click', navigateToPrevImage);
    document.getElementById('next-image-btn').addEventListener('click', navigateToNextImage);
    
    // Setup download button
    document.getElementById('download-image-btn').addEventListener('click', downloadCurrentImage);
    
    // Setup drag handlers for panning
    setupDragHandlers();
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  // Setup drag handlers for panning when zoomed
  function setupDragHandlers() {
    const fullSizeImage = document.getElementById('full-size-image');
    
    fullSizeImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', dragImage);
    document.addEventListener('mouseup', stopDrag);
    
    // Touch support
    fullSizeImage.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragImageTouch);
    document.addEventListener('touchend', stopDrag);
  }

  // Start dragging
  function startDrag(e) {
    if (currentZoomLevel > 1) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      
      // Prevent default behavior
      e.preventDefault();
    }
  }

  // Touch version of startDrag
  function startDragTouch(e) {
    if (currentZoomLevel > 1 && e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
    }
  }

  // Drag the image
  function dragImage(e) {
    if (!isDragging) return;
    
    const fullSizeImage = document.getElementById('full-size-image');
    
    // Calculate the new position
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    translateX += deltaX;
    translateY += deltaY;
    
    // Update the image position
    fullSizeImage.style.transform = `scale(${currentZoomLevel}) translate(${translateX / currentZoomLevel}px, ${translateY / currentZoomLevel}px)`;
    
    // Update drag start position
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }

  // Touch version of dragImage
  function dragImageTouch(e) {
    if (!isDragging || e.touches.length !== 1) return;
    
    const fullSizeImage = document.getElementById('full-size-image');
    
    // Calculate the new position
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    
    translateX += deltaX;
    translateY += deltaY;
    
    // Update the image position
    fullSizeImage.style.transform = `scale(${currentZoomLevel}) translate(${translateX / currentZoomLevel}px, ${translateY / currentZoomLevel}px)`;
    
    // Update drag start position
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    
    // Prevent scrolling
    e.preventDefault();
  }

  // Stop dragging
  function stopDrag() {
    isDragging = false;
  }

  // Handle keyboard shortcuts
  function handleKeyboardShortcuts(e) {
    if (!imageViewerDialog.isOpen) return;
    
    switch (e.key) {
      case '+':
      case '=':
        zoomIn();
        e.preventDefault();
        break;
      case '-':
      case '_':
        zoomOut();
        e.preventDefault();
        break;
      case '0':
        resetZoom();
        e.preventDefault();
        break;
      case 'ArrowLeft':
        navigateToPrevImage();
        e.preventDefault();
        break;
      case 'ArrowRight':
        navigateToNextImage();
        e.preventDefault();
        break;
      case 'Escape':
        // Handled by the dialog component
        break;
    }
  }

  // Zoom in
  function zoomIn() {
    if (currentZoomLevel < 3) {
      currentZoomLevel += 0.25;
      applyZoom();
    }
  }

  // Zoom out
  function zoomOut() {
    if (currentZoomLevel > 0.5) {
      currentZoomLevel -= 0.25;
      applyZoom();
    }
  }

  // Reset zoom
  function resetZoom() {
    currentZoomLevel = 1;
    translateX = 0;
    translateY = 0;
    applyZoom();
  }

  // Apply zoom level
  function applyZoom() {
    const fullSizeImage = document.getElementById('full-size-image');
    const zoomLevelText = document.getElementById('zoom-level-text');
    
    // Apply transform
    fullSizeImage.style.transform = `scale(${currentZoomLevel}) translate(${translateX / currentZoomLevel}px, ${translateY / currentZoomLevel}px)`;
    
    // Update zoom percentage text
    if (zoomLevelText) {
      zoomLevelText.textContent = `${Math.round(currentZoomLevel * 100)}%`;
    }
    
    // Enable dragging if zoomed in
    if (currentZoomLevel > 1) {
      fullSizeImage.style.cursor = 'move';
    } else {
      fullSizeImage.style.cursor = 'default';
    }
  }

  // Navigate to previous image
  function navigateToPrevImage() {
    if (resultImages.length > 1 && currentResultIndex > 0) {
      currentResultIndex--;
      showCurrentImage();
    }
  }

  // Navigate to next image
  function navigateToNextImage() {
    if (resultImages.length > 1 && currentResultIndex < resultImages.length - 1) {
      currentResultIndex++;
      showCurrentImage();
    }
  }

  // Show current image
  function showCurrentImage() {
    if (resultImages.length === 0) return;
    
    const fullSizeImage = document.getElementById('full-size-image');
    const downloadBtn = document.getElementById('download-image-btn');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    const imageCounter = document.getElementById('image-counter');
    
    // Set the image source
    fullSizeImage.src = resultImages[currentResultIndex];
    
    // Update counter
    if (imageCounter) {
      imageCounter.textContent = `Image ${currentResultIndex + 1} of ${resultImages.length}`;
    }
    
    // Update download button
    if (downloadBtn) {
      downloadBtn.setAttribute('data-download-url', resultImages[currentResultIndex]);
    }
    
    // Update navigation buttons state
    if (prevBtn) {
      prevBtn.disabled = currentResultIndex === 0;
      prevBtn.classList.toggle('opacity-50', currentResultIndex === 0);
    }
    
    if (nextBtn) {
      nextBtn.disabled = currentResultIndex === resultImages.length - 1;
      nextBtn.classList.toggle('opacity-50', currentResultIndex === resultImages.length - 1);
    }
    
    // Reset zoom
    resetZoom();
  }

  // Download current image
  function downloadCurrentImage() {
    const downloadUrl = document.getElementById('download-image-btn').getAttribute('data-download-url');
    
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Expose open function to global scope
  window.openImageViewer = function(imageUrl, allImages = []) {
    // Set result images array
    resultImages = allImages.length > 0 ? allImages : [imageUrl];
    
    // Find index of current image
    currentResultIndex = resultImages.indexOf(imageUrl);
    if (currentResultIndex === -1) {
      currentResultIndex = 0;
      resultImages[0] = imageUrl;
    }
    
    // Open the dialog
    imageViewerDialog.open();
  };

  // Add click listener to any images with the data attribute
  document.querySelectorAll('[data-image-viewer]').forEach(img => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the image URL
      const imageUrl = img.src || img.getAttribute('data-src');
      
      // Get any related images (from the same gallery)
      const galleryId = img.getAttribute('data-gallery-id');
      let allImages = [imageUrl];
      
      if (galleryId) {
        allImages = Array.from(
          document.querySelectorAll(`[data-gallery-id="${galleryId}"]`)
        ).map(galleryImg => galleryImg.src || galleryImg.getAttribute('data-src'));
      }
      
      openImageViewer(imageUrl, allImages);
    });
  });
  
  // Add global CSS for the image viewer
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Image viewer specific styling */
    .nav-btn {
      opacity: 0.7;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    
    .nav-btn:hover {
      opacity: 1;
      transform: translateY(-50%) scale(1.1);
    }
    
    #zoom-in-btn:hover, #zoom-out-btn:hover, #zoom-reset-btn:hover,
    #zoom-in-btn-bottom:hover, #zoom-out-btn-bottom:hover, #zoom-reset-btn-bottom:hover {
      background-color: rgba(81, 45, 168, 0.7) !important;
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(155, 89, 182, 0.5);
    }
    
    .zoom-level-display {
      font-family: monospace;
      min-width: 60px;
      text-align: center;
    }
    
    .zoom-controls-bottom .btn-group .btn {
      transition: all 0.2s ease;
      padding: 0.375rem 0.65rem;
    }
    
    /* Full-size image transitions */
    #full-size-image {
      user-select: none;
      will-change: transform;
      max-height: 80vh;
      max-width: 95%;
    }
    
    /* Mobile adjustments */
    @media (max-width: 640px) {
      .zoom-controls {
        top: auto;
        bottom: 16px;
        right: 16px;
      }
    }
  `;
  document.head.appendChild(styleEl);
});