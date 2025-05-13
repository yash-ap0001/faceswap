import os
import cv2
import numpy as np
from basicsr.archs.rrdbnet_arch import RRDBNet
from basicsr.utils.download_util import load_file_from_url

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

# Model URLs and paths
MODEL_PATHS = {
    'gfpgan': {
        'url': 'https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth',
        'path': 'models/gfpgan/GFPGANv1.3.pth'
    },
    'esrgan': {
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
        'path': 'models/esrgan/RealESRGAN_x4plus.pth'
    },
    'codeformer': {
        'url': 'https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth',
        'path': 'models/codeformer/codeformer.pth'
    },
}

def ensure_dir(path):
    """Ensure directory exists."""
    os.makedirs(os.path.dirname(path), exist_ok=True)

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
    try:
        from gfpgan import GFPGANer
        
        # Ensure model folder exists
        os.makedirs(ensure_folder, exist_ok=True)
        
        # Download model if not exists
        model_path = MODEL_PATHS['gfpgan']['path']
        if not os.path.isfile(model_path):
            ensure_dir(model_path)
            load_file_from_url(MODEL_PATHS['gfpgan']['url'], model_path)
        
        # Initialize GFPGAN
        restorer = GFPGANer(
            model_path=model_path,
            upscale=2,
            arch='clean',
            channel_multiplier=2,
            bg_upsampler=None
        )
        
        # Process image
        _, _, output = restorer.enhance(
            img,
            has_aligned=False,
            only_center_face=False,
            paste_back=True,
            weight=strength
        )
        
        return output
    except (ImportError, Exception) as e:
        print(f"GFPGAN enhancement failed: {e}")
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
    try:
        from codeformer.app import inference_app
        
        # Ensure model folder exists
        os.makedirs(ensure_folder, exist_ok=True)
        
        # Download model if not exists
        model_path = MODEL_PATHS['codeformer']['path']
        if not os.path.isfile(model_path):
            ensure_dir(model_path)
            load_file_from_url(MODEL_PATHS['codeformer']['url'], model_path)
        
        # Process image
        output, _ = inference_app(img, model_path, strength, 2)
        return output
    except (ImportError, Exception) as e:
        print(f"CodeFormer enhancement failed: {e}")
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
    try:
        from realesrgan import RealESRGANer
        
        # Ensure model folder exists
        os.makedirs(ensure_folder, exist_ok=True)
        
        # Download model if not exists
        model_path = MODEL_PATHS['esrgan']['path']
        if not os.path.isfile(model_path):
            ensure_dir(model_path)
            load_file_from_url(MODEL_PATHS['esrgan']['url'], model_path)
        
        # Initialize upscaler
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=upscale_factor)
        upscaler = RealESRGANer(
            scale=upscale_factor,
            model_path=model_path,
            model=model,
            tile=0,
            tile_pad=10,
            pre_pad=0,
            half=False
        )
        
        # Process image
        output, _ = upscaler.enhance(img, outscale=upscale_factor)
        return output
    except (ImportError, Exception) as e:
        print(f"ESRGAN upscaling failed: {e}")
        return None

def try_gpen_enhance(img, ensure_folder='models/gpen'):
    """
    Enhance face using GPEN if available
    
    Args:
        img: Input image (numpy array)
        
    Returns:
        Enhanced image or None if GPEN is not available
    """
    # GPEN implementation would go here
    # This is a placeholder for future implementation
    return None

def enhance_image(img, method='basic', strength=0.8, upscale_factor=2):
    """
    Enhance image using specified method
    
    Args:
        img: Input image path or numpy array
        method: Enhancement method ('basic', 'gfpgan', 'codeformer', 'esrgan', 'gpen')
        strength: Enhancement strength (0.0 to 1.0)
        upscale_factor: Upscale factor for ESRGAN
        
    Returns:
        Enhanced image
    """
    # Convert file path to image if needed
    if isinstance(img, str):
        img = cv2.imread(img)
        if img is None:
            raise ValueError(f"Could not read image from {img}")
    
    # Make a copy to ensure we don't modify the original
    result = img.copy()
    
    # Apply enhancement based on method
    if method == 'basic':
        result = basic_enhance(result)
    elif method == 'gfpgan':
        enhanced = try_gfpgan_enhance(result, strength)
        if enhanced is not None:
            result = enhanced
        else:
            # Fall back to basic enhancement
            result = basic_enhance(result)
    elif method == 'codeformer':
        enhanced = try_codeformer_enhance(result, strength)
        if enhanced is not None:
            result = enhanced
        else:
            # Fall back to basic enhancement
            result = basic_enhance(result)
    elif method == 'esrgan':
        enhanced = try_esrgan_upscale(result, upscale_factor)
        if enhanced is not None:
            result = enhanced
        else:
            # Fall back to basic enhancement
            result = basic_enhance(result)
    elif method == 'gpen':
        enhanced = try_gpen_enhance(result)
        if enhanced is not None:
            result = enhanced
        else:
            # Fall back to basic enhancement
            result = basic_enhance(result)
    else:
        # Default to basic enhancement
        result = basic_enhance(result)
    
    return result