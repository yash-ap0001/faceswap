/**
 * Enhanced Image Gallery Viewer with zoom and navigation
 */

// Global variables for image navigation
let currentCeremonyType = "";
let currentTemplateIndex = 0;
let currentCeremonyImages = [];
let zoomLevel = 1;

// Function to show the full-size preview
function showFullsizePreview(imagePath, ceremonyType) {
    currentCeremonyType = ceremonyType;
    
    // Find all template images for this ceremony
    const container = document.getElementById(ceremonyType + '-carousel');
    if (!container) return;
    
    // Get all templates for this ceremony
    const templateCards = container.querySelectorAll('.template-card');
    currentCeremonyImages = [];
    
    // Store all template paths and find the index of the current image
    templateCards.forEach((card, index) => {
        const path = card.getAttribute('data-template-path');
        if (path) {
            currentCeremonyImages.push(path);
            if (path === imagePath) {
                currentTemplateIndex = index;
            }
        }
    });
    
    // Update image counter
    updateImageCounter();
    
    // Set the image source
    const previewImage = document.getElementById('fullsize-preview-image');
    if (previewImage) {
        previewImage.src = imagePath;
    }
    
    // Reset zoom level
    resetZoom();
    
    // Set the title with the ceremony type
    const previewTitle = document.getElementById('fullsize-preview-title');
    if (previewTitle) {
        previewTitle.textContent = ceremonyType.charAt(0).toUpperCase() + ceremonyType.slice(1) + ' Template';
    }
    
    // Show the modal
    const previewModal = new bootstrap.Modal(document.getElementById('fullsizePreviewModal'));
    previewModal.show();
    
    // Initialize navigation buttons
    initializeImageControls();
}

// Function to initialize navigation buttons
function initializeImageControls() {
    // Previous image button
    const prevImageBtn = document.getElementById('prevImageBtn');
    if (prevImageBtn) {
        prevImageBtn.onclick = navigateToPreviousImage;
    }
    
    // Next image button
    const nextImageBtn = document.getElementById('nextImageBtn');
    if (nextImageBtn) {
        nextImageBtn.onclick = navigateToNextImage;
    }
    
    // Zoom controls - Top
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.onclick = zoomIn;
    }
    
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.onclick = zoomOut;
    }
    
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    if (resetZoomBtn) {
        resetZoomBtn.onclick = resetZoom;
    }
    
    // Zoom controls - Bottom
    const zoomInBtnBottom = document.getElementById('zoomInBtnBottom');
    if (zoomInBtnBottom) {
        zoomInBtnBottom.onclick = zoomIn;
    }
    
    const zoomOutBtnBottom = document.getElementById('zoomOutBtnBottom');
    if (zoomOutBtnBottom) {
        zoomOutBtnBottom.onclick = zoomOut;
    }
    
    const resetZoomBtnBottom = document.getElementById('resetZoomBtnBottom');
    if (resetZoomBtnBottom) {
        resetZoomBtnBottom.onclick = resetZoom;
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleImageNavigation);
}

// Function to handle keyboard navigation
function handleImageNavigation(e) {
    const modal = document.getElementById('fullsizePreviewModal');
    
    // Only handle keys if the modal is visible
    if (modal && modal.classList.contains('show')) {
        switch (e.key) {
            case 'ArrowLeft':
                navigateToPreviousImage();
                break;
            case 'ArrowRight':
                navigateToNextImage();
                break;
            case '+':
            case '=': // + key on most keyboards
                zoomIn();
                break;
            case '-':
                zoomOut();
                break;
            case '0':
                resetZoom();
                break;
            case 'Escape':
                // Close the modal
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
                break;
        }
    }
}

// Function to navigate to the previous image
function navigateToPreviousImage() {
    if (currentCeremonyImages.length === 0) return;
    
    // Decrease index and wrap around if needed
    currentTemplateIndex--;
    if (currentTemplateIndex < 0) {
        currentTemplateIndex = currentCeremonyImages.length - 1;
    }
    
    // Update the preview image
    const previewImage = document.getElementById('fullsize-preview-image');
    if (previewImage) {
        previewImage.src = currentCeremonyImages[currentTemplateIndex];
    }
    
    // Reset zoom level
    resetZoom();
    
    // Update image counter
    updateImageCounter();
}

// Function to navigate to the next image
function navigateToNextImage() {
    if (currentCeremonyImages.length === 0) return;
    
    // Increase index and wrap around if needed
    currentTemplateIndex++;
    if (currentTemplateIndex >= currentCeremonyImages.length) {
        currentTemplateIndex = 0;
    }
    
    // Update the preview image
    const previewImage = document.getElementById('fullsize-preview-image');
    if (previewImage) {
        previewImage.src = currentCeremonyImages[currentTemplateIndex];
    }
    
    // Reset zoom level
    resetZoom();
    
    // Update image counter
    updateImageCounter();
}

// Function to update the image counter
function updateImageCounter() {
    const currentIndex = document.getElementById('current-image-index');
    const totalCount = document.getElementById('total-image-count');
    
    if (currentIndex && totalCount) {
        currentIndex.textContent = currentTemplateIndex + 1;
        totalCount.textContent = currentCeremonyImages.length;
    }
}

// Function to zoom in
function zoomIn() {
    zoomLevel += 0.1;
    if (zoomLevel > 3) zoomLevel = 3; // Limit maximum zoom
    applyZoom();
}

// Function to zoom out
function zoomOut() {
    zoomLevel -= 0.1;
    if (zoomLevel < 0.5) zoomLevel = 0.5; // Limit minimum zoom
    applyZoom();
}

// Function to reset zoom
function resetZoom() {
    zoomLevel = 1;
    applyZoom();
}

// Function to apply zoom level
function applyZoom() {
    const previewImage = document.getElementById('fullsize-preview-image');
    if (previewImage) {
        previewImage.style.transform = `scale(${zoomLevel})`;
    }
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Clean up event listeners when the modal is hidden
    const modal = document.getElementById('fullsizePreviewModal');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            document.removeEventListener('keydown', handleImageNavigation);
        });
    }
});