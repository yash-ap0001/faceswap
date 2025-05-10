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
                resultContainer.classList.remove('d-none');
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
                if (!data.face_detection || !data.face_swap) {
                    modelStatusAlert.classList.remove('d-none');
                    modelStatusMessage.textContent = 'Some AI models are not loaded properly. The application may not work correctly.';
                    
                    if (!data.face_detection && !data.face_swap) {
                        modelStatusMessage.textContent = 'Face detection and face swap models are not loaded. Please check server logs.';
                    } else if (!data.face_detection) {
                        modelStatusMessage.textContent = 'Face detection model is not loaded. Please check server logs.';
                    } else if (!data.face_swap) {
                        modelStatusMessage.textContent = 'Face swap model is not loaded. Please check server logs.';
                    }
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