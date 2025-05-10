/**
 * Category-specific features for the bridal gallery
 * Each ceremony type has its own set of interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all category features
    initHaldiFeatures();
    initMehendiFeatures();
    initSangeethFeatures();
    initWeddingFeatures();
    initReceptionFeatures();
    
    // Initialize common interaction features
    initCommonFeatures();
});

/**
 * Haldi ceremony specific features
 * - Color customization for Haldi outfits
 * - Turmeric intensity slider
 */
function initHaldiFeatures() {
    const haldiContainer = document.getElementById('haldi-templates-container');
    if (!haldiContainer) return;
    
    // Add color customization button to each Haldi card
    const haldiCards = haldiContainer.querySelectorAll('.bridal-card');
    haldiCards.forEach((card, index) => {
        // Add custom color selector button
        const colorButton = document.createElement('button');
        colorButton.className = 'btn btn-sm btn-warning position-absolute';
        colorButton.style.bottom = '10px';
        colorButton.style.right = '10px';
        colorButton.style.zIndex = '10';
        colorButton.innerHTML = '<i class="fas fa-palette"></i>';
        colorButton.title = 'Customize yellow shade';
        colorButton.setAttribute('data-bs-toggle', 'modal');
        colorButton.setAttribute('data-bs-target', '#haldiCustomizeModal');
        colorButton.onclick = function() {
            // Store the selected card index
            localStorage.setItem('selectedHaldiCard', index);
        };
        card.style.position = 'relative';
        card.appendChild(colorButton);
    });
    
    // Create Haldi customization modal if it doesn't exist
    if (!document.getElementById('haldiCustomizeModal')) {
        const modalHTML = `
        <div class="modal fade" id="haldiCustomizeModal" tabindex="-1" aria-labelledby="haldiCustomizeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="haldiCustomizeModalLabel">Customize Haldi Look</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="yellowShadeRange" class="form-label">Yellow Shade Intensity</label>
                            <input type="range" class="form-range" min="0" max="100" value="50" id="yellowShadeRange">
                        </div>
                        <div class="mb-3">
                            <label for="turmericPatternSelect" class="form-label">Turmeric Pattern</label>
                            <select class="form-select bg-dark text-white" id="turmericPatternSelect">
                                <option value="traditional">Traditional Pattern</option>
                                <option value="modern">Modern Minimalist</option>
                                <option value="artistic">Artistic Design</option>
                                <option value="floral">Floral Pattern</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="accessoriesSelect" class="form-label">Accessories</label>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="flowerAccessory">
                                    <label class="form-check-label" for="flowerAccessory">
                                        Flower Garland
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="jewelryAccessory">
                                    <label class="form-check-label" for="jewelryAccessory">
                                        Gold Jewelry
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="banglesAccessory">
                                    <label class="form-check-label" for="banglesAccessory">
                                        Traditional Bangles
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="applyHaldiCustomization">
                            <i class="fas fa-magic me-2"></i>Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Handle apply button click
        document.getElementById('applyHaldiCustomization').addEventListener('click', function() {
            // Simulate applying customization (would be implemented with real face swap)
            const modal = bootstrap.Modal.getInstance(document.getElementById('haldiCustomizeModal'));
            modal.hide();
            
            // Show toast notification
            showToast('Haldi customization applied!');
        });
    }
}

/**
 * Mehendi ceremony specific features
 * - Henna pattern selection
 * - Shade and intensity controls
 */
function initMehendiFeatures() {
    const mehendiContainer = document.getElementById('mehendi-templates-container');
    if (!mehendiContainer) return;
    
    // Add henna pattern customization button to each Mehendi card
    const mehendiCards = mehendiContainer.querySelectorAll('.bridal-card');
    mehendiCards.forEach((card, index) => {
        // Add customization button
        const patternButton = document.createElement('button');
        patternButton.className = 'btn btn-sm btn-success position-absolute';
        patternButton.style.bottom = '10px';
        patternButton.style.right = '10px';
        patternButton.style.zIndex = '10';
        patternButton.innerHTML = '<i class="fas fa-paint-brush"></i>';
        patternButton.title = 'Customize henna patterns';
        patternButton.setAttribute('data-bs-toggle', 'modal');
        patternButton.setAttribute('data-bs-target', '#mehendiCustomizeModal');
        patternButton.onclick = function() {
            // Store the selected card index
            localStorage.setItem('selectedMehendiCard', index);
        };
        card.style.position = 'relative';
        card.appendChild(patternButton);
    });
    
    // Create Mehendi customization modal if it doesn't exist
    if (!document.getElementById('mehendiCustomizeModal')) {
        const modalHTML = `
        <div class="modal fade" id="mehendiCustomizeModal" tabindex="-1" aria-labelledby="mehendiCustomizeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="mehendiCustomizeModalLabel">Customize Mehendi Look</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="hennaStyleSelect" class="form-label">Henna Style</label>
                            <select class="form-select bg-dark text-white" id="hennaStyleSelect">
                                <option value="arabic">Arabic Style</option>
                                <option value="indian">Traditional Indian</option>
                                <option value="moroccan">Moroccan Patterns</option>
                                <option value="contemporary">Contemporary Design</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="hennaColorSelect" class="form-label">Henna Color</label>
                            <select class="form-select bg-dark text-white" id="hennaColorSelect">
                                <option value="dark">Dark Brown</option>
                                <option value="red">Reddish Brown</option>
                                <option value="black">Black</option>
                                <option value="maroon">Deep Maroon</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="hennaCoverageRange" class="form-label">Coverage Extent</label>
                            <input type="range" class="form-range" min="0" max="100" value="70" id="hennaCoverageRange">
                        </div>
                        <div class="mb-3">
                            <label for="outfitSelect" class="form-label">Outfit Color</label>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm" style="background-color: #006400;" data-color="darkgreen"></button>
                                <button class="btn btn-sm" style="background-color: #8B0000;" data-color="darkred"></button>
                                <button class="btn btn-sm" style="background-color: #4B0082;" data-color="indigo"></button>
                                <button class="btn btn-sm" style="background-color: #800080;" data-color="purple"></button>
                                <button class="btn btn-sm" style="background-color: #B8860B;" data-color="goldenrod"></button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="applyMehendiCustomization">
                            <i class="fas fa-magic me-2"></i>Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Handle apply button click
        document.getElementById('applyMehendiCustomization').addEventListener('click', function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('mehendiCustomizeModal'));
            modal.hide();
            
            // Show toast notification
            showToast('Mehendi customization applied!');
        });
    }
}

/**
 * Sangeeth ceremony specific features
 * - Music selection
 * - Dance style options
 * - Outfit color customization
 */
function initSangeethFeatures() {
    const sangeethContainer = document.getElementById('sangeeth-templates-container');
    if (!sangeethContainer) return;
    
    // Add music and dance customization button to each Sangeeth card
    const sangeethCards = sangeethContainer.querySelectorAll('.bridal-card');
    sangeethCards.forEach((card, index) => {
        // Add customization button
        const musicButton = document.createElement('button');
        musicButton.className = 'btn btn-sm btn-info position-absolute';
        musicButton.style.bottom = '10px';
        musicButton.style.right = '10px';
        musicButton.style.zIndex = '10';
        musicButton.innerHTML = '<i class="fas fa-music"></i>';
        musicButton.title = 'Customize music and dance';
        musicButton.setAttribute('data-bs-toggle', 'modal');
        musicButton.setAttribute('data-bs-target', '#sangeethCustomizeModal');
        musicButton.onclick = function() {
            // Store the selected card index
            localStorage.setItem('selectedSangeethCard', index);
        };
        card.style.position = 'relative';
        card.appendChild(musicButton);
    });
    
    // Create Sangeeth customization modal if it doesn't exist
    if (!document.getElementById('sangeethCustomizeModal')) {
        const modalHTML = `
        <div class="modal fade" id="sangeethCustomizeModal" tabindex="-1" aria-labelledby="sangeethCustomizeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="sangeethCustomizeModalLabel">Customize Sangeeth Experience</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="musicStyleSelect" class="form-label">Music Style</label>
                            <select class="form-select bg-dark text-white" id="musicStyleSelect">
                                <option value="classical">Classical</option>
                                <option value="bollywood">Bollywood</option>
                                <option value="fusion">Fusion</option>
                                <option value="folk">Folk</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="danceStyleSelect" class="form-label">Dance Style</label>
                            <select class="form-select bg-dark text-white" id="danceStyleSelect">
                                <option value="bhangra">Bhangra</option>
                                <option value="kathak">Kathak</option>
                                <option value="garba">Garba</option>
                                <option value="bollywood">Bollywood</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="outfitColorSelect" class="form-label">Outfit Color Scheme</label>
                            <div class="d-flex gap-2 flex-wrap">
                                <button class="btn btn-sm" style="background-color: #FF1493;" data-color="pink">Pink</button>
                                <button class="btn btn-sm" style="background-color: #4169E1;" data-color="blue">Blue</button>
                                <button class="btn btn-sm" style="background-color: #9932CC;" data-color="purple">Purple</button>
                                <button class="btn btn-sm" style="background-color: #FFD700;" data-color="gold">Gold</button>
                                <button class="btn btn-sm" style="background-color: #FF4500;" data-color="orange">Orange</button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Stage Lighting</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="discoLights">
                                <label class="form-check-label" for="discoLights">
                                    Disco Lights
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="spotlights">
                                <label class="form-check-label" for="spotlights">
                                    Spotlights
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="applySangeethCustomization">
                            <i class="fas fa-magic me-2"></i>Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Handle apply button click
        document.getElementById('applySangeethCustomization').addEventListener('click', function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('sangeethCustomizeModal'));
            modal.hide();
            
            // Show toast notification
            showToast('Sangeeth customization applied!');
        });
    }
}

/**
 * Wedding ceremony specific features
 * - Traditional attire selection
 * - Jewelry customization
 * - Venue background options
 */
function initWeddingFeatures() {
    const weddingContainer = document.getElementById('wedding-templates-container');
    if (!weddingContainer) return;
    
    // Add wedding customization button to each Wedding card
    const weddingCards = weddingContainer.querySelectorAll('.bridal-card');
    weddingCards.forEach((card, index) => {
        // Add customization button
        const weddingButton = document.createElement('button');
        weddingButton.className = 'btn btn-sm btn-danger position-absolute';
        weddingButton.style.bottom = '10px';
        weddingButton.style.right = '10px';
        weddingButton.style.zIndex = '10';
        weddingButton.innerHTML = '<i class="fas fa-heart"></i>';
        weddingButton.title = 'Customize wedding ceremony';
        weddingButton.setAttribute('data-bs-toggle', 'modal');
        weddingButton.setAttribute('data-bs-target', '#weddingCustomizeModal');
        weddingButton.onclick = function() {
            // Store the selected card index
            localStorage.setItem('selectedWeddingCard', index);
        };
        card.style.position = 'relative';
        card.appendChild(weddingButton);
    });
    
    // Create Wedding customization modal if it doesn't exist
    if (!document.getElementById('weddingCustomizeModal')) {
        const modalHTML = `
        <div class="modal fade" id="weddingCustomizeModal" tabindex="-1" aria-labelledby="weddingCustomizeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="weddingCustomizeModalLabel">Customize Wedding Look</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="attireStyleSelect" class="form-label">Bridal Attire Style</label>
                            <select class="form-select bg-dark text-white" id="attireStyleSelect">
                                <option value="lehenga">Traditional Lehenga</option>
                                <option value="saree">Wedding Saree</option>
                                <option value="anarkali">Anarkali Suit</option>
                                <option value="gown">Fusion Gown</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="embroiderySelect" class="form-label">Embroidery Style</label>
                            <select class="form-select bg-dark text-white" id="embroiderySelect">
                                <option value="zari">Zari Work</option>
                                <option value="zardozi">Zardozi</option>
                                <option value="kundan">Kundan</option>
                                <option value="resham">Resham Embroidery</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="jewelrySetSelect" class="form-label">Jewelry Set</label>
                            <select class="form-select bg-dark text-white" id="jewelrySetSelect">
                                <option value="kundan">Kundan Set</option>
                                <option value="polki">Polki Jewelry</option>
                                <option value="temple">Temple Jewelry</option>
                                <option value="diamond">Diamond Set</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="venueSelect" class="form-label">Venue Background</label>
                            <select class="form-select bg-dark text-white" id="venueSelect">
                                <option value="temple">Traditional Temple</option>
                                <option value="palace">Royal Palace</option>
                                <option value="garden">Garden Setting</option>
                                <option value="beach">Beach Ceremony</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="applyWeddingCustomization">
                            <i class="fas fa-magic me-2"></i>Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Handle apply button click
        document.getElementById('applyWeddingCustomization').addEventListener('click', function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('weddingCustomizeModal'));
            modal.hide();
            
            // Show toast notification
            showToast('Wedding customization applied!');
        });
    }
}

/**
 * Reception ceremony specific features
 * - Modern outfit selection
 * - Hairstyle options
 * - Makeup intensity
 */
function initReceptionFeatures() {
    const receptionContainer = document.getElementById('reception-templates-container');
    if (!receptionContainer) return;
    
    // Add reception customization button to each Reception card
    const receptionCards = receptionContainer.querySelectorAll('.bridal-card');
    receptionCards.forEach((card, index) => {
        // Add customization button
        const receptionButton = document.createElement('button');
        receptionButton.className = 'btn btn-sm btn-primary position-absolute';
        receptionButton.style.bottom = '10px';
        receptionButton.style.right = '10px';
        receptionButton.style.zIndex = '10';
        receptionButton.innerHTML = '<i class="fas fa-glass-cheers"></i>';
        receptionButton.title = 'Customize reception look';
        receptionButton.setAttribute('data-bs-toggle', 'modal');
        receptionButton.setAttribute('data-bs-target', '#receptionCustomizeModal');
        receptionButton.onclick = function() {
            // Store the selected card index
            localStorage.setItem('selectedReceptionCard', index);
        };
        card.style.position = 'relative';
        card.appendChild(receptionButton);
    });
    
    // Create Reception customization modal if it doesn't exist
    if (!document.getElementById('receptionCustomizeModal')) {
        const modalHTML = `
        <div class="modal fade" id="receptionCustomizeModal" tabindex="-1" aria-labelledby="receptionCustomizeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="receptionCustomizeModalLabel">Customize Reception Look</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="outfitDesignSelect" class="form-label">Outfit Design</label>
                            <select class="form-select bg-dark text-white" id="outfitDesignSelect">
                                <option value="gown">Indo-Western Gown</option>
                                <option value="saree">Designer Saree</option>
                                <option value="lehenga">Modern Lehenga</option>
                                <option value="suit">Elegant Suit</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="hairstyleSelect" class="form-label">Hairstyle</label>
                            <select class="form-select bg-dark text-white" id="hairstyleSelect">
                                <option value="updo">Elegant Updo</option>
                                <option value="curls">Soft Curls</option>
                                <option value="straight">Sleek Straight</option>
                                <option value="braid">Braided Style</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="makeupIntensityRange" class="form-label">Makeup Intensity</label>
                            <input type="range" class="form-range" min="0" max="100" value="70" id="makeupIntensityRange">
                        </div>
                        <div class="mb-3">
                            <label for="accessoriesSelect" class="form-label">Accessories</label>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="diamondJewelry" checked>
                                    <label class="form-check-label" for="diamondJewelry">
                                        Diamond Jewelry
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="clutchBag">
                                    <label class="form-check-label" for="clutchBag">
                                        Designer Clutch
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="hairAccessory">
                                    <label class="form-check-label" for="hairAccessory">
                                        Hair Accessory
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="applyReceptionCustomization">
                            <i class="fas fa-magic me-2"></i>Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Handle apply button click
        document.getElementById('applyReceptionCustomization').addEventListener('click', function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('receptionCustomizeModal'));
            modal.hide();
            
            // Show toast notification
            showToast('Reception customization applied!');
        });
    }
}

/**
 * Common features shared across all categories
 * - Preview generation
 * - Template selection
 * - Photo export
 */
function initCommonFeatures() {
    // Add toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Initialize Show More buttons
    const showMoreButtons = document.querySelectorAll('.btn-outline-secondary');
    showMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle between "Show More" and "Show Less"
            const currentText = this.innerText;
            if (currentText.includes('Show More')) {
                this.innerHTML = '<i class="fas fa-angle-up me-2"></i>Show Less Templates';
                // Would load additional templates in a real implementation
                showToast('Loading more templates...');
            } else {
                this.innerHTML = '<i class="fas fa-angle-down me-2"></i>Show More Templates';
                // Would hide additional templates in a real implementation
            }
        });
    });
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 */
function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}