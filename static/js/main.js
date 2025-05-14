// Function to initialize page elements and event handlers
function initializePage() {
    // DOM Elements - use defensive programming to check if elements exist before using them
    const uploadForm = document.getElementById('upload-form');
    const sourceInput = document.getElementById('source-input');
    const targetInput = document.getElementById('target-input');
    const sourcePreview = document.getElementById('source-preview');
    const targetPreview = document.getElementById('target-preview');
    const sourcePlaceholder = document.getElementById('source-placeholder');
    const targetPlaceholder = document.getElementById('target-placeholder');
    const sourceClearBtn = document.getElementById('source-clear-btn');
    const targetClearBtn = document.getElementById('target-clear-btn');
    const swapBtn = document.getElementById('swap-btn');
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const modelStatusAlert = document.getElementById('model-status-alert');
    const modelStatusMessage = document.getElementById('model-status-message');

    // Check if models are loaded - safe to call on any page
    checkModels();

    // File input change handlers - only add if the elements exist
    if (sourceInput) {
        sourceInput.addEventListener('change', function() {
            handleFileInputChange(this, sourcePreview, sourcePlaceholder);
        });
    }

    if (targetInput) {
        targetInput.addEventListener('change', function() {
            handleFileInputChange(this, targetPreview, targetPlaceholder);
        });
    }

    // Clear button handlers - only add if the elements exist
    if (sourceClearBtn) {
        sourceClearBtn.addEventListener('click', function() {
            clearFileInput(sourceInput, sourcePreview, sourcePlaceholder);
        });
    }

    if (targetClearBtn) {
        targetClearBtn.addEventListener('click', function() {
            clearFileInput(targetInput, targetPreview, targetPlaceholder);
        });
    }

    // Try again button handler - only add if the element exists
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', function() {
            if (resultContainer) resultContainer.classList.add('d-none');
            if (uploadForm) uploadForm.reset();
            if (sourceInput && sourcePreview && sourcePlaceholder) {
                clearFileInput(sourceInput, sourcePreview, sourcePlaceholder);
            }
            if (targetInput && targetPreview && targetPlaceholder) {
                clearFileInput(targetInput, targetPreview, targetPlaceholder);
            }
            if (errorContainer) errorContainer.classList.add('d-none');
        });
    }

    // Form submission - only add if the form exists
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ensure sourceInput and targetInput exist and have files
            if (!sourceInput || !sourceInput.files || !sourceInput.files.length || 
                !targetInput || !targetInput.files || !targetInput.files.length) {
                showError('Please select both source and target images.');
                return;
            }

            // Check file sizes
            const maxSize = 16 * 1024 * 1024; // 16MB
            if (sourceInput.files[0].size > maxSize || targetInput.files[0].size > maxSize) {
                showError('File size exceeds the maximum limit of 16MB.');
                return;
            }

            // Check file types
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(sourceInput.files[0].type) || 
                !allowedTypes.includes(targetInput.files[0].type)) {
                showError('Only JPG, JPEG and PNG files are allowed.');
                return;
            }

            // Show loading indicators if they exist
            if (loadingContainer) loadingContainer.classList.remove('d-none');
            if (errorContainer) errorContainer.classList.add('d-none');
            if (resultContainer) resultContainer.classList.add('d-none');
            if (swapBtn) swapBtn.disabled = true;

            // Create form data
            const formData = new FormData();
            formData.append('source', sourceInput.files[0]);
            formData.append('target', targetInput.files[0]);

            // Send AJAX request
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (loadingContainer) loadingContainer.classList.add('d-none');
                if (swapBtn) swapBtn.disabled = false;

                if (data.success) {
                    if (resultImage && data.result_image) {
                        resultImage.src = `/uploads/${data.result_image}`;
                    }
                    
                    if (downloadBtn && data.result_image) {
                        downloadBtn.href = `/uploads/${data.result_image}`;
                        downloadBtn.download = data.result_image;
                    }
                    
                    // Show result container if it exists
                    if (resultContainer) {
                        resultContainer.classList.remove('d-none');
                    }
                    
                    // If in demo mode, display an additional message
                    if (data.demo_mode && resultContainer) {
                        // Check if we already have a demo mode alert
                        let demoAlert = document.getElementById('demo-result-alert');
                        if (!demoAlert) {
                            // Create a new alert element
                            demoAlert = document.createElement('div');
                            demoAlert.id = 'demo-result-alert';
                            demoAlert.className = 'alert alert-info mt-3';
                            demoAlert.textContent = data.message || 'Running in demonstration mode. The image shows detected faces instead of actual face swapping.';
                            
                            // Insert it before the result image if possible
                            if (resultImage && resultImage.parentNode) {
                                resultContainer.insertBefore(demoAlert, resultImage.parentNode);
                            } else {
                                resultContainer.appendChild(demoAlert);
                            }
                        } else {
                            // Update existing alert
                            demoAlert.textContent = data.message || 'Running in demonstration mode. The image shows detected faces instead of actual face swapping.';
                            demoAlert.classList.remove('d-none');
                        }
                    } else {
                        // Hide the demo alert if it exists
                        const existingAlert = document.getElementById('demo-result-alert');
                        if (existingAlert) {
                            existingAlert.classList.add('d-none');
                        }
                    }
                    
                    // Scroll to result if it exists
                    if (resultContainer) {
                        window.scrollTo({
                            top: resultContainer.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    showError(data.error || 'An unknown error occurred.');
                }
            })
            .catch(error => {
                if (loadingContainer) loadingContainer.classList.add('d-none');
                if (swapBtn) swapBtn.disabled = false;
                showError('Network error: ' + error.message);
            });
        });
    });

    // Helper functions
    function handleFileInputChange(input, preview, placeholder) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none');
                placeholder.classList.add('d-none');
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    }

    function clearFileInput(input, preview, placeholder) {
        input.value = '';
        preview.classList.add('d-none');
        placeholder.classList.remove('d-none');
    }

    function showError(message) {
        // Check if the error elements exist before using them
        if (errorMessage) {
            errorMessage.textContent = message;
        } else {
            console.error('Error:', message);
        }
        
        if (errorContainer) {
            errorContainer.classList.remove('d-none');
            window.scrollTo({
                top: errorContainer.offsetTop,
                behavior: 'smooth'
            });
        } else {
            // If no error container exists, at least log the error to console
            console.error('Error container not found. Error message:', message);
        }
    }

    function checkModels() {
        fetch('/check-models')
            .then(response => response.json())
            .then(data => {
                const modelUploadContainer = document.getElementById('model-upload-container');
                
                // Only proceed if the status elements exist
                if (modelStatusAlert && modelStatusMessage) {
                    if (!data.face_detection) {
                        modelStatusAlert.classList.remove('d-none');
                        modelStatusMessage.textContent = 'Face detection model is not loaded. The application cannot work properly.';
                    } else if (data.demo_mode || !data.face_swap) {
                        modelStatusAlert.classList.remove('d-none');
                        
                        if (data.demo_mode) {
                            modelStatusAlert.classList.remove('alert-warning');
                            modelStatusAlert.classList.add('alert-info');
                            modelStatusMessage.textContent = 'Running in demonstration mode. Face detection works, but face swapping will show visual indicators instead of actual face swaps.';
                        } else {
                            modelStatusMessage.textContent = 'Face swap model is not loaded. The application will only detect faces but cannot swap them.';
                        }
                        
                        // Show the model upload button when in demo mode or face swap model is missing
                        if (modelUploadContainer) {
                            modelUploadContainer.classList.remove('d-none');
                        }
                    } else {
                        modelStatusAlert.classList.add('d-none');
                        
                        // Hide the model upload container when everything is working
                        if (modelUploadContainer) {
                            modelUploadContainer.classList.add('d-none');
                        }
                    }
                } else {
                    // Log model status even if we can't show it in the UI
                    console.log('Model status:', data);
                }
            })
            .catch(error => {
                console.error('Error checking model status:', error);
                if (modelStatusAlert && modelStatusMessage) {
                    modelStatusAlert.classList.remove('d-none');
                    modelStatusMessage.textContent = 'Could not check model status. There might be connection issues.';
                }
            });
    }
});