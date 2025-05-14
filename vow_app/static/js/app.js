document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const previewContainer = document.getElementById('previewContainer');
    const sourcePreview = document.getElementById('sourcePreview');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const categorySelect = document.getElementById('categorySelect');
    const subcategorySelect = document.getElementById('subcategorySelect');
    const itemSelect = document.getElementById('itemSelect');
    const loadTemplatesBtn = document.getElementById('loadTemplatesBtn');
    const templatesSection = document.getElementById('templatesSection');
    const templatesContainer = document.getElementById('templatesContainer');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const processSelectedBtn = document.getElementById('processSelectedBtn');
    const processAllBtn = document.getElementById('processAllBtn');
    const showTemplatesBtn = document.getElementById('showTemplatesBtn');
    const hideTemplatesBtn = document.getElementById('hideTemplatesBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const multiSelectToggle = document.getElementById('multiSelectToggle');
    const enhanceToggle = document.getElementById('enhanceToggle');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    // Image Viewer Modal Elements
    const imageViewerModal = document.getElementById('imageViewerModal');
    const zoomImage = document.getElementById('zoomImage');
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    const imageNavInfo = document.getElementById('imageNavInfo');
    
    // State variables
    let sourceFile = null;
    let categories = [];
    let templates = [];
    let selectedTemplates = [];
    let results = [];
    let currentImageIndex = 0;
    let galleryImages = [];
    let zoomLevel = 1;
    let dragStart = { x: 0, y: 0 };
    let currentPosition = { x: 0, y: 0 };
    let isDragging = false;
    
    // Initialize the application
    initialize();
    
    function initialize() {
        // Fetch categories
        fetchCategories();
        
        // Setup event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // File upload event listeners
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleFileDrop);
        changePhotoBtn.addEventListener('click', () => fileInput.click());
        
        // Category selection event listeners
        categorySelect.addEventListener('change', handleCategoryChange);
        subcategorySelect.addEventListener('change', handleSubcategoryChange);
        itemSelect.addEventListener('change', handleItemChange);
        loadTemplatesBtn.addEventListener('click', loadTemplates);
        
        // Processing event listeners
        processSelectedBtn.addEventListener('click', processSelectedTemplates);
        processAllBtn.addEventListener('click', processAllTemplates);
        
        // Toggle buttons
        showTemplatesBtn.addEventListener('click', showTemplates);
        hideTemplatesBtn.addEventListener('click', hideTemplates);
        downloadAllBtn.addEventListener('click', downloadAllResults);
        
        // Image viewer event listeners
        setupImageViewerEventListeners();
    }
    
    // Image Viewer Event Listeners
    function setupImageViewerEventListeners() {
        // Zoom controls
        zoomInBtn.addEventListener('click', () => {
            zoomLevel = Math.min(zoomLevel + 0.25, 3);
            updateZoom();
        });
        
        zoomOutBtn.addEventListener('click', () => {
            zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
            updateZoom();
        });
        
        resetZoomBtn.addEventListener('click', () => {
            zoomLevel = 1;
            currentPosition = { x: 0, y: 0 };
            updateZoom();
        });
        
        // Image dragging
        zoomImage.addEventListener('mousedown', startDrag);
        zoomImage.addEventListener('touchstart', startDrag, { passive: true });
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: true });
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        // Navigation
        prevImageBtn.addEventListener('click', showPreviousImage);
        nextImageBtn.addEventListener('click', showNextImage);
        
        // Modal events
        $(imageViewerModal).on('show.bs.modal', function() {
            document.body.classList.add('modal-open');
        });
        
        $(imageViewerModal).on('hidden.bs.modal', function() {
            document.body.classList.remove('modal-open');
            resetZoom();
        });
    }
    
    // File handling functions
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processSelectedFile(file);
        }
    }
    
    function handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        uploadArea.classList.add('dragover');
    }
    
    function handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        uploadArea.classList.remove('dragover');
    }
    
    function handleFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        uploadArea.classList.remove('dragover');
        
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processSelectedFile(file);
        }
    }
    
    function processSelectedFile(file) {
        sourceFile = file;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            sourcePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.style.display = 'block';
            
            // Enable category selection if it's populated
            if (categorySelect.options.length > 1) {
                categorySelect.disabled = false;
            }
            
            // Update template processing if templates are already loaded
            updateProcessingButtons();
        };
        
        reader.readAsDataURL(file);
    }
    
    // Category handling functions
    function fetchCategories() {
        fetch('/api/get-categories')
            .then(response => response.json())
            .then(data => {
                categories = data;
                populateCategoryDropdown();
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                showError('Failed to load categories. Please try again later.');
            });
    }
    
    function populateCategoryDropdown() {
        // Clear existing options except the default
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add new options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Enable if source image is uploaded
        if (sourceFile) {
            categorySelect.disabled = false;
        }
    }
    
    function handleCategoryChange() {
        const categoryId = categorySelect.value;
        
        // Clear and disable dependent dropdowns
        clearDropdown(subcategorySelect, true);
        clearDropdown(itemSelect, true);
        
        // Disable load button
        loadTemplatesBtn.disabled = true;
        
        if (!categoryId) return;
        
        // Find selected category
        const selectedCategory = categories.find(c => c.id === categoryId);
        if (!selectedCategory) return;
        
        // Populate subcategory dropdown
        selectedCategory.subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            subcategorySelect.appendChild(option);
        });
        
        // Enable subcategory dropdown
        subcategorySelect.disabled = false;
    }
    
    function handleSubcategoryChange() {
        const categoryId = categorySelect.value;
        const subcategoryId = subcategorySelect.value;
        
        // Clear and disable item dropdown
        clearDropdown(itemSelect, true);
        
        // Disable load button
        loadTemplatesBtn.disabled = true;
        
        if (!categoryId || !subcategoryId) return;
        
        // Find selected category and subcategory
        const selectedCategory = categories.find(c => c.id === categoryId);
        if (!selectedCategory) return;
        
        const selectedSubcategory = selectedCategory.subcategories.find(s => s.id === subcategoryId);
        if (!selectedSubcategory) return;
        
        // Populate item dropdown
        selectedSubcategory.items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            itemSelect.appendChild(option);
        });
        
        // Enable item dropdown
        itemSelect.disabled = false;
    }
    
    function handleItemChange() {
        // Enable load button if item is selected
        loadTemplatesBtn.disabled = !itemSelect.value;
    }
    
    function clearDropdown(dropdown, disable = false) {
        // Keep only the first (default) option
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Reset to first option
        dropdown.selectedIndex = 0;
        
        // Disable if requested
        if (disable) {
            dropdown.disabled = true;
        }
    }
    
    // Template handling functions
    function loadTemplates() {
        const categoryType = categorySelect.value;
        const subcategory = subcategorySelect.value;
        const itemCategory = itemSelect.value;
        
        if (!categoryType || !subcategory || !itemCategory) {
            showError('Please select all category options');
            return;
        }
        
        // Show loading state
        templatesContainer.innerHTML = `
            <div class="col template-loading">
                <div class="card h-100 p-2 text-center">
                    <div class="d-flex align-items-center justify-content-center" style="height: 200px;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <div class="card-body p-2">
                        <p class="card-text small text-secondary">Loading templates...</p>
                    </div>
                </div>
            </div>
        `;
        
        // Show templates section
        templatesSection.style.display = 'block';
        
        // Fetch templates
        fetch(`/api/get-templates?category_type=${categoryType}&subcategory=${subcategory}&item_category=${itemCategory}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    templates = data.templates;
                    renderTemplates();
                } else {
                    showError(data.message || 'Failed to load templates');
                    templatesContainer.innerHTML = `
                        <div class="col">
                            <div class="alert alert-warning" role="alert">
                                <i class="fas fa-exclamation-triangle me-2"></i> ${data.message || 'No templates found for the selected category'}
                            </div>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading templates:', error);
                showError('Failed to load templates. Please try again later.');
                templatesContainer.innerHTML = `
                    <div class="col">
                        <div class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-triangle me-2"></i> Failed to load templates. Please try again later.
                        </div>
                    </div>
                `;
            });
    }
    
    function renderTemplates() {
        if (!templates || templates.length === 0) {
            templatesContainer.innerHTML = `
                <div class="col">
                    <div class="alert alert-warning" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i> No templates found for the selected category
                    </div>
                </div>
            `;
            return;
        }
        
        // Clear previous templates
        templatesContainer.innerHTML = '';
        
        // Reset selected templates
        selectedTemplates = [];
        updateProcessingButtons();
        
        // Render each template
        templates.forEach((template, index) => {
            const templateCard = document.createElement('div');
            templateCard.className = 'col';
            templateCard.dataset.index = index;
            templateCard.innerHTML = `
                <div class="card h-100 template-card" data-template-id="${template.id}">
                    <div class="selected-badge">
                        <i class="fas fa-check"></i>
                    </div>
                    <img src="${template.url}" class="template-preview" alt="${template.name}">
                    <div class="card-body p-2">
                        <h6 class="card-title mb-1 small">${template.name}</h6>
                    </div>
                </div>
            `;
            
            // Add click handler for template selection
            const card = templateCard.querySelector('.template-card');
            card.addEventListener('click', () => {
                toggleTemplateSelection(template, card);
            });
            
            // Add double click handler for full preview
            card.addEventListener('dblclick', () => {
                openImageViewer([{ url: template.url, title: template.name }], 0);
            });
            
            templatesContainer.appendChild(templateCard);
        });
    }
    
    function toggleTemplateSelection(template, card) {
        const isMultiSelect = multiSelectToggle.checked;
        
        if (isMultiSelect) {
            // Multi-select mode
            const templateIndex = selectedTemplates.findIndex(t => t.id === template.id);
            
            if (templateIndex === -1) {
                // Add to selection
                selectedTemplates.push(template);
                card.classList.add('selected');
            } else {
                // Remove from selection
                selectedTemplates.splice(templateIndex, 1);
                card.classList.remove('selected');
            }
        } else {
            // Single-select mode
            // Clear previous selection
            document.querySelectorAll('.template-card.selected').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Set new selection
            selectedTemplates = [template];
            card.classList.add('selected');
        }
        
        // Update buttons
        updateProcessingButtons();
    }
    
    function updateProcessingButtons() {
        // Enable/disable process selected button
        processSelectedBtn.disabled = selectedTemplates.length === 0 || !sourceFile;
        
        // Enable/disable process all button
        processAllBtn.disabled = templates.length === 0 || !sourceFile;
    }
    
    // Template processing functions
    function processSelectedTemplates() {
        if (selectedTemplates.length === 0 || !sourceFile) {
            showError('Please select at least one template and upload a photo');
            return;
        }
        
        processTemplates(selectedTemplates);
    }
    
    function processAllTemplates() {
        if (templates.length === 0 || !sourceFile) {
            showError('No templates available or no photo uploaded');
            return;
        }
        
        processTemplates(templates);
    }
    
    function processTemplates(templatesToProcess) {
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        loadingText.textContent = `Processing ${templatesToProcess.length} template${templatesToProcess.length > 1 ? 's' : ''}...`;
        
        // Create form data
        const formData = new FormData();
        formData.append('source', sourceFile);
        formData.append('category_type', categorySelect.value);
        formData.append('subcategory', subcategorySelect.value);
        formData.append('item_category', itemSelect.value);
        formData.append('enhance', enhanceToggle.checked);
        
        // Send request
        fetch('/api/universal-face-swap', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            if (data.success) {
                // Store results
                results = data.results;
                
                // Display results
                renderResults();
                
                // Show results section and hide templates
                resultsSection.style.display = 'block';
                templatesSection.style.display = 'none';
                
                // Show the "Show Templates" button
                showTemplatesBtn.style.display = 'block';
                hideTemplatesBtn.style.display = 'none';
            } else {
                showError(data.message || 'Failed to process templates');
            }
        })
        .catch(error => {
            console.error('Error processing templates:', error);
            loadingOverlay.style.display = 'none';
            showError('Failed to process templates. Please try again later.');
        });
    }
    
    function renderResults() {
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col">
                    <div class="alert alert-warning" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i> No results to display
                    </div>
                </div>
            `;
            return;
        }
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Render each result
        results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'col';
            resultCard.innerHTML = `
                <div class="card h-100">
                    <img src="${result.result_path}" class="result-image" alt="Result ${index + 1}">
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="small">${result.template_id.replace('_', ' ').capitalize()}</span>
                            <div class="btn-group">
                                <a href="${result.result_path}" download class="btn btn-sm btn-outline-primary result-action-btn">
                                    <i class="fas fa-download"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-secondary view-result-btn result-action-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners
            const viewButton = resultCard.querySelector('.view-result-btn');
            viewButton.addEventListener('click', () => {
                openImageViewer(results.map(r => ({ 
                    url: r.result_path, 
                    title: r.template_id.replace('_', ' ').capitalize(),
                    download: r.result_path
                })), index);
            });
            
            // Add click handler for image
            const resultImage = resultCard.querySelector('.result-image');
            resultImage.addEventListener('click', () => {
                openImageViewer(results.map(r => ({ 
                    url: r.result_path, 
                    title: r.template_id.replace('_', ' ').capitalize(),
                    download: r.result_path
                })), index);
            });
            
            resultsContainer.appendChild(resultCard);
        });
    }
    
    // UI Helper functions
    function showTemplates() {
        templatesSection.style.display = 'block';
        showTemplatesBtn.style.display = 'none';
        hideTemplatesBtn.style.display = 'block';
    }
    
    function hideTemplates() {
        templatesSection.style.display = 'none';
        showTemplatesBtn.style.display = 'block';
        hideTemplatesBtn.style.display = 'none';
    }
    
    function showError(message) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger alert-dismissible fade show';
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Append to the top of the content container
        const contentContainer = document.querySelector('.content-container');
        contentContainer.insertBefore(alertElement, contentContainer.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            $(alertElement).alert('close');
        }, 5000);
    }
    
    function downloadAllResults() {
        if (!results || results.length === 0) {
            showError('No results to download');
            return;
        }
        
        // Create and trigger downloads for each result
        results.forEach((result, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = result.result_path;
                link.download = `result_${result.template_id}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 300); // Stagger downloads to prevent browser blocking
        });
    }
    
    // Image Viewer Functions
    function openImageViewer(images, startIndex) {
        galleryImages = images;
        currentImageIndex = startIndex;
        
        // Reset zoom
        resetZoom();
        
        // Set initial image
        updateViewerImage();
        
        // Show modal
        $(imageViewerModal).modal('show');
    }
    
    function updateViewerImage() {
        if (galleryImages.length === 0) return;
        
        const image = galleryImages[currentImageIndex];
        zoomImage.src = image.url;
        downloadImageBtn.href = image.download || image.url;
        downloadImageBtn.download = image.title || `image-${currentImageIndex + 1}.jpg`;
        
        // Update navigation info
        imageNavInfo.textContent = `Image ${currentImageIndex + 1} of ${galleryImages.length}`;
        
        // Update navigation buttons visibility
        prevImageBtn.style.visibility = currentImageIndex > 0 ? 'visible' : 'hidden';
        nextImageBtn.style.visibility = currentImageIndex < galleryImages.length - 1 ? 'visible' : 'hidden';
    }
    
    function showPreviousImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            resetZoom();
            updateViewerImage();
        }
    }
    
    function showNextImage() {
        if (currentImageIndex < galleryImages.length - 1) {
            currentImageIndex++;
            resetZoom();
            updateViewerImage();
        }
    }
    
    function resetZoom() {
        zoomLevel = 1;
        currentPosition = { x: 0, y: 0 };
        updateZoom();
    }
    
    function updateZoom() {
        zoomImage.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px) scale(${zoomLevel})`;
    }
    
    function startDrag(event) {
        event.preventDefault();
        isDragging = true;
        
        if (event.type === 'touchstart') {
            dragStart.x = event.touches[0].clientX;
            dragStart.y = event.touches[0].clientY;
        } else {
            dragStart.x = event.clientX;
            dragStart.y = event.clientY;
        }
    }
    
    function drag(event) {
        if (!isDragging) return;
        
        event.preventDefault();
        
        let currentX, currentY;
        
        if (event.type === 'touchmove') {
            currentX = event.touches[0].clientX;
            currentY = event.touches[0].clientY;
        } else {
            currentX = event.clientX;
            currentY = event.clientY;
        }
        
        // Calculate the movement
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;
        
        // Update position
        currentPosition.x += deltaX;
        currentPosition.y += deltaY;
        
        // Update the drag start position
        dragStart.x = currentX;
        dragStart.y = currentY;
        
        // Apply the transformation
        updateZoom();
    }
    
    function endDrag() {
        isDragging = false;
    }
    
    // Helper functions
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
});