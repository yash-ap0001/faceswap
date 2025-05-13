"""
Download Script for Enhancement Models

This script downloads the enhancement models needed for GPEN, GFPGAN, and CodeFormer.
The download process uses Hugging Face Hub API to get the models.
"""

import os
import logging
import requests
import onnx
import numpy as np
from tqdm import tqdm
import torch
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Model URLs and paths
MODEL_URLS = {
    'gpen_256': {
        'url': 'https://huggingface.co/spaces/vinthony/GPEN/resolve/main/GPEN-BFR-256.onnx',
        'path': './models/gpen/GPEN-BFR-256.onnx'
    },
    'gpen_512': {
        'url': 'https://huggingface.co/spaces/vinthony/GPEN/resolve/main/GPEN-BFR-512.onnx',
        'path': './models/gpen/GPEN-BFR-512.onnx'
    },
    'gfpgan': {
        'url': 'https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth',
        'path': './models/gfpgan/GFPGANv1.3.pth'
    },
    'codeformer': {
        'url': 'https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth',
        'path': './models/codeformer/codeformer.pth'
    },
    'esrgan': {
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
        'path': './models/esrgan/RealESRGAN_x4plus.pth'
    }
}

def download_file(url, path, token=None):
    """
    Download a file from a URL to a specified path.
    
    Args:
        url: URL to download the file from
        path: Path to save the file to
        token: Optional authorization token for Hugging Face
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    # Skip if file already exists
    if os.path.exists(path):
        logger.info(f"File already exists at {path}, skipping download")
        return True
    
    try:
        logger.info(f"Downloading from {url} to {path}")
        
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024  # 1 Kibibyte
        
        with open(path, 'wb') as file, tqdm(
            desc=os.path.basename(path),
            total=total_size,
            unit='iB',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for data in response.iter_content(block_size):
                size = file.write(data)
                bar.update(size)
        
        logger.info(f"Successfully downloaded to {path}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to download {url}: {str(e)}")
        if os.path.exists(path):
            os.remove(path)
        return False

def verify_onnx_model(model_path):
    """Verify an ONNX model can be loaded and is valid."""
    try:
        model = onnx.load(model_path)
        onnx.checker.check_model(model)
        logger.info(f"ONNX model at {model_path} is valid")
        return True
    except Exception as e:
        logger.error(f"ONNX model verification failed: {str(e)}")
        return False

def verify_torch_model(model_path):
    """Verify a PyTorch model can be loaded."""
    try:
        # Just check if it can be loaded
        model = torch.load(model_path, map_location="cpu")
        logger.info(f"PyTorch model at {model_path} can be loaded")
        return True
    except Exception as e:
        logger.error(f"PyTorch model verification failed: {str(e)}")
        return False

def download_and_verify_models(token=None):
    """Download and verify all enhancement models."""
    successes = 0
    failures = 0
    
    for model_name, model_info in MODEL_URLS.items():
        logger.info(f"Processing {model_name}...")
        success = download_file(model_info['url'], model_info['path'], token)
        
        if success:
            # Verify the model
            if model_info['path'].endswith('.onnx'):
                valid = verify_onnx_model(model_info['path'])
            elif model_info['path'].endswith('.pth'):
                valid = verify_torch_model(model_info['path'])
            else:
                logger.warning(f"Unknown model format for {model_info['path']}, skipping verification")
                valid = True
            
            if valid:
                successes += 1
            else:
                failures += 1
                if os.path.exists(model_info['path']):
                    os.remove(model_info['path'])
        else:
            failures += 1
    
    return successes, failures

if __name__ == "__main__":
    # Get Hugging Face token from environment
    hf_token = os.environ.get("HUGGINGFACE_TOKEN")
    
    logger.info("Starting enhancement model download...")
    start_time = time.time()
    
    successes, failures = download_and_verify_models(hf_token)
    
    end_time = time.time()
    duration = end_time - start_time
    
    logger.info(f"Download completed in {duration:.2f} seconds")
    logger.info(f"Successfully downloaded and verified {successes} models")
    
    if failures > 0:
        logger.warning(f"Failed to download or verify {failures} models")
    
    if successes > 0:
        logger.info("You can now use the following enhancement methods:")
        if os.path.exists(MODEL_URLS['gpen_256']['path']):
            logger.info("- GPEN Face Enhancement (256)")
        if os.path.exists(MODEL_URLS['gpen_512']['path']):
            logger.info("- GPEN Face Enhancement (512)")
        if os.path.exists(MODEL_URLS['gfpgan']['path']):
            logger.info("- GFPGAN Face Restoration")
        if os.path.exists(MODEL_URLS['codeformer']['path']):
            logger.info("- CodeFormer Face Enhancement")
        if os.path.exists(MODEL_URLS['esrgan']['path']):
            logger.info("- ESRGAN Upscaling")