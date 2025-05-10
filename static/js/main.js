document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
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

    // Check if models are loaded
    checkModels();

    // File input change handlers
    sourceInput.addEventListener('change', function() {
        handleFileInputChange(this, sourcePreview, sourcePlaceholder);
    });

    targetInput.addEventListener('change', function() {
        handleFileInputChange(this, targetPreview, targetPlaceholder);
    });

    // Clear button handlers
    sourceClearBtn.addEventListener('click', function() {
        clearFileInput(sourceInput, sourcePreview, sourcePlaceholder);
    });

    targetClearBtn.addEventListener('click', function() {
        clearFileInput(targetInput, targetPreview, targetPlaceholder);
    });

    // Try again button handler
    tryAgainBtn.addEventListener('click', function() {
        resultContainer.classList.add('d-none');
        uploadForm.reset();
        clearFileInput(sourceInput, sourcePreview, sourcePlaceholder);
        clearFileInput(targetInput, targetPreview, targetPlaceholder);
        errorContainer.classList.add('d-none');
    });

    // Form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!sourceInput.files.length || !targetInput.files.length) {
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

        // Show loading
        loadingContainer.classList.remove('d-none');
        errorContainer.classList.add('d-none');
        resultContainer.classList.add('d-none');
        swapBtn.disabled = true;

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
            loadingContainer.classList.add('d-none');
            swapBtn.disabled = false;

            if (data.success) {
                resultImage.src = `/uploads/${data.result_image}`;
                downloadBtn.href = `/uploads/${data.result_image}`;
                downloadBtn.download = data.result_image;
                
                // Show result container
                resultContainer.classList.remove('d-none');
                
                // If in demo mode, display an additional message
                if (data.demo_mode) {
                    // Check if we already have a demo mode alert
                    let demoAlert = document.getElementById('demo-result-alert');
                    if (!demoAlert) {
                        // Create a new alert element
                        demoAlert = document.createElement('div');
                        demoAlert.id = 'demo-result-alert';
                        demoAlert.className = 'alert alert-info mt-3';
                        demoAlert.textContent = data.message || 'Running in demonstration mode. The image shows detected faces instead of actual face swapping.';
                        
                        // Insert it before the result image
                        resultContainer.insertBefore(demoAlert, resultImage.parentNode);
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
                
                window.scrollTo({
                    top: resultContainer.offsetTop,
                    behavior: 'smooth'
                });
            } else {
                showError(data.error || 'An unknown error occurred.');
            }
        })
        .catch(error => {
            loadingContainer.classList.add('d-none');
            swapBtn.disabled = false;
            showError('Network error: ' + error.message);
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
        errorMessage.textContent = message;
        errorContainer.classList.remove('d-none');
        window.scrollTo({
            top: errorContainer.offsetTop,
            behavior: 'smooth'
        });
    }

    function checkModels() {
        fetch('/check-models')
            .then(response => response.json())
            .then(data => {
                if (!data.face_detection) {
                    modelStatusAlert.classList.remove('d-none');
                    modelStatusMessage.textContent = 'Face detection model is not loaded. The application cannot work properly.';
                } else if (data.demo_mode) {
                    modelStatusAlert.classList.remove('d-none');
                    modelStatusAlert.classList.remove('alert-warning');
                    modelStatusAlert.classList.add('alert-info');
                    modelStatusMessage.textContent = 'Running in demonstration mode. Face detection works, but face swapping will show visual indicators instead of actual face swaps.';
                } else if (!data.face_swap) {
                    modelStatusAlert.classList.remove('d-none');
                    modelStatusMessage.textContent = 'Face swap model is not loaded. The application will only detect faces but cannot swap them.';
                } else {
                    modelStatusAlert.classList.add('d-none');
                }
            })
            .catch(error => {
                modelStatusAlert.classList.remove('d-none');
                modelStatusMessage.textContent = 'Could not check model status. There might be connection issues.';
            });
    }
});