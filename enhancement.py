import os
import cv2
import numpy as np
import logging

"""
Image Enhancement Module for VowBride

This module provides image enhancement capabilities using various methods:
1. Basic OpenCV-based enhancement
2. GFPGAN for face restoration (if available)
3. CodeFormer for face enhancement (if available)
4. ESRGAN for general image upscaling (if available)
5. GPEN for face reconstruction (if available)

Most methods require additional models that will be downloaded on first use.
"""

# Configure logging
logger = logging.getLogger(__name__)

# Enhancement options that we support
ENHANCEMENT_METHODS = [
    'basic',      # Basic image enhancement with OpenCV
    'gfpgan',     # Face restoration (future)
    'codeformer', # Face enhancement (future)
    'esrgan',     # General image upscaling (future)
    'gpen',       # Face reconstruction (future)
]

# Model paths - will be used when models are available
MODEL_PATHS = {
    'gfpgan': './models/gfpgan/GFPGANv1.3.pth',
    'codeformer': './models/codeformer/codeformer.pth',
    'esrgan': './models/esrgan/RealESRGAN_x4plus.pth',
    'gpen_256': './models/gpen/GPEN-BFR-256.onnx',
    'gpen_512': './models/gpen/GPEN-BFR-512.onnx',
}

def basic_enhance(img, brightness=1.1, contrast=1.2, sharpen=True):
    """
    Basic image enhancement using OpenCV
    
    Args:
        img: Input image (numpy array)
        brightness: Brightness adjustment factor
        contrast: Contrast adjustment factor
        sharpen: Whether to apply sharpening
        
    Returns:
        Enhanced image
    """
    # Convert to float for processing
    img_float = img.astype(np.float32) / 255.0
    
    # Apply brightness and contrast
    img_enhanced = cv2.convertScaleAbs(img_float, alpha=contrast, beta=brightness-1)
    
    if sharpen:
        # Apply sharpening
        kernel = np.array([[-1, -1, -1],
                           [-1,  9, -1],
                           [-1, -1, -1]])
        img_enhanced = cv2.filter2D(img_enhanced, -1, kernel)
    
    # Ensure values are in valid range
    img_enhanced = np.clip(img_enhanced, 0, 1) * 255
    
    return img_enhanced.astype(np.uint8)

def try_gfpgan_enhance(img, strength=0.8, ensure_folder='models/gfpgan'):
    """
    Enhance face using GFPGAN if available
    
    Args:
        img: Input image (numpy array)
        strength: Enhancement strength (0.0 to 1.0)
        
    Returns:
        Enhanced image or None if GFPGAN is not available
    """
    # GFPGAN is not installed in this environment
    # This is a placeholder for future implementation when the libraries are available
    print("GFPGAN enhancement not available")
    return None

def try_codeformer_enhance(img, strength=0.8, ensure_folder='models/codeformer'):
    """
    Enhance face using CodeFormer if available
    
    Args:
        img: Input image (numpy array)
        strength: Enhancement strength (0.0 to 1.0)
        
    Returns:
        Enhanced image or None if CodeFormer is not available
    """
    # CodeFormer is not installed in this environment
    # This is a placeholder for future implementation when the libraries are available
    print("CodeFormer enhancement not available")
    return None

def try_esrgan_upscale(img, upscale_factor=2, ensure_folder='models/esrgan'):
    """
    Upscale image using Real-ESRGAN if available
    
    Args:
        img: Input image (numpy array)
        upscale_factor: Factor to upscale the image (2, 3, 4)
        
    Returns:
        Upscaled image or None if ESRGAN is not available
    """
    # ESRGAN is not installed in this environment
    # This is a placeholder for future implementation when the libraries are available
    print("ESRGAN upscaling not available")
    return None

def try_gpen_enhance(img, model_size=256, ensure_folder='models/gpen'):
    """
    Enhance face using GPEN if available
    
    Args:
        img: Input image (numpy array)
        model_size: GPEN model size (256 or 512)
        
    Returns:
        Enhanced image or None if GPEN is not available
    """
    # Import ONNX runtime only when needed to avoid startup dependency
    try:
        import onnxruntime
        
        # Ensure model folder exists
        os.makedirs(ensure_folder, exist_ok=True)
        
        # Select model based on size
        if model_size == 512:
            model_path = MODEL_PATHS['gpen_512']
        else:
            model_path = MODEL_PATHS['gpen_256']
            
        # Skip if model doesn't exist
        if not os.path.isfile(model_path):
            logger.warning(f"GPEN model not found at {model_path}")
            return None
        
        # Load model
        providers = ['CPUExecutionProvider']
        session = onnxruntime.InferenceSession(model_path, providers=providers)
        
        # Preprocess image
        h, w, c = img.shape
        size = model_size  # model input size
        img_input = cv2.resize(img, (size, size))
        img_input = img_input.astype(np.float32) / 255.0
        img_input = np.transpose(img_input, (2, 0, 1))
        img_input = np.expand_dims(img_input, axis=0)
        
        # Run inference
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        output = session.run([output_name], {input_name: img_input})[0]
        
        # Postprocess output
        output = np.clip(output, 0, 1)
        output = np.transpose(output[0], (1, 2, 0)) * 255.0
        output = cv2.resize(output, (w, h))
        
        return output.astype(np.uint8)
    except (ImportError, Exception) as e:
        logger.error(f"GPEN enhancement failed: {e}")
        return None

def enhance_image(img, method='basic', strength=0.8, upscale_factor=2, model_size=256):
    """
    Enhance image using specified method
    
    Args:
        img: Input image path or numpy array
        method: Enhancement method ('basic', 'gfpgan', 'codeformer', 'esrgan', 'gpen')
        strength: Enhancement strength (0.0 to 1.0)
        upscale_factor: Upscale factor for ESRGAN (2, 4)
        model_size: Size for GPEN model (256 or 512)
        
    Returns:
        Enhanced image
    """
    # Convert file path to image if needed
    if isinstance(img, str):
        img = cv2.imread(img)
        if img is None:
            logger.error(f"Could not read image from {img}")
            return None
    
    # Make a copy to ensure we don't modify the original
    result = img.copy()
    
    # Log the enhancement method
    logger.info(f"Enhancing image using {method} method")
    
    try:
        # Apply enhancement based on method
        if method == 'basic':
            result = basic_enhance(result)
            logger.info("Basic enhancement applied")
        elif method == 'gfpgan':
            enhanced = try_gfpgan_enhance(result, strength)
            if enhanced is not None:
                result = enhanced
                logger.info("GFPGAN enhancement successful")
            else:
                # Fall back to basic enhancement
                result = basic_enhance(result)
                logger.info("Fallback to basic enhancement (GFPGAN not available)")
        elif method == 'codeformer':
            enhanced = try_codeformer_enhance(result, strength)
            if enhanced is not None:
                result = enhanced
                logger.info("CodeFormer enhancement successful")
            else:
                # Fall back to basic enhancement
                result = basic_enhance(result)
                logger.info("Fallback to basic enhancement (CodeFormer not available)")
        elif method == 'esrgan':
            enhanced = try_esrgan_upscale(result, upscale_factor)
            if enhanced is not None:
                result = enhanced
                logger.info(f"ESRGAN upscaling (x{upscale_factor}) successful")
            else:
                # Fall back to basic enhancement
                result = basic_enhance(result)
                logger.info("Fallback to basic enhancement (ESRGAN not available)")
        elif method == 'gpen':
            enhanced = try_gpen_enhance(result, model_size)
            if enhanced is not None:
                result = enhanced
                logger.info(f"GPEN-{model_size} enhancement successful")
            else:
                # Fall back to basic enhancement
                result = basic_enhance(result)
                logger.info(f"Fallback to basic enhancement (GPEN-{model_size} not available)")
        else:
            # Default to basic enhancement for unknown methods
            logger.warning(f"Unknown enhancement method: {method}, using basic enhancement")
            result = basic_enhance(result)
            
    except Exception as e:
        # Handle any unexpected errors in the enhancement process
        logger.error(f"Error during image enhancement: {str(e)}")
        # Return the original image if enhancement fails
        logger.info("Returning original image due to enhancement error")
        result = img.copy()
    
    return result

def preprocess_for_face_swap(img):
    """Prepare an image for face swapping by enhancing brightness and contrast"""
    return basic_enhance(img, brightness=1.1, contrast=1.15, sharpen=False)

def postprocess_face_swap(img, method='basic'):
    """Apply post-processing enhancement after face swap"""
    return enhance_image(img, method=method)