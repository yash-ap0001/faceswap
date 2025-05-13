import os
import requests
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create models directory
MODELS_DIR = Path("models/enhancement")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def download_file(url, output_path, token=None):
    """
    Download a file from URL to the specified path.
    
    Args:
        url (str): URL to download from
        output_path (Path): Path to save the file
        token (str, optional): Authentication token
    
    Returns:
        bool: True if download successful, False otherwise
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        logger.info(f"Downloading from {url} to {output_path}")
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 8192
        downloaded = 0
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=block_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    
                    # Print progress
                    if total_size > 0:
                        percent = downloaded / total_size * 100
                        if percent % 10 < 0.1:  # Log every 10%
                            logger.info(f"Downloaded {downloaded} / {total_size} bytes ({percent:.1f}%)")
        
        logger.info(f"Downloaded {output_path.name} successfully")
        return True
    
    except Exception as e:
        logger.error(f"Error downloading {url}: {str(e)}")
        return False

def main():
    """Main function to download models"""
    # Get Hugging Face token
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        logger.error("HUGGINGFACE_TOKEN environment variable not set")
        return False
    
    # Define models to download
    models = [
        {
            "name": "CodeFormer",
            "url": "https://huggingface.co/bluefoxcreation/faster_codeformer_onnx/resolve/main/faster_codeformer_onnx.onnx",
            "output": MODELS_DIR / "faster_codeformer_onnx.onnx"
        },
        {
            "name": "GFPGAN",
            "url": "https://huggingface.co/ashleykleynhans/gfpgan/resolve/main/GFPGANv1.4.onnx",
            "output": MODELS_DIR / "gfpgan_1.4.onnx"
        }
    ]
    
    # Alternative sources to try if the main ones fail
    alternative_sources = [
        {
            "name": "CodeFormer",
            "url": "https://huggingface.co/TencentARC/GFPGAN/resolve/main/GFPGANv1.4.onnx",
            "output": MODELS_DIR / "gfpgan_1.4.onnx"
        },
        {
            "name": "GFPGAN",
            "url": "https://huggingface.co/MonsterMMORPG/SECourses/resolve/main/GFPGANv1.4.onnx",
            "output": MODELS_DIR / "gfpgan_1.4.onnx"
        }
    ]
    
    # Download each model
    success_count = 0
    
    for model in models:
        if download_file(model["url"], model["output"], token):
            success_count += 1
        else:
            logger.warning(f"Failed to download {model['name']} from primary source")
    
    # Try alternative sources for any failed downloads
    if success_count < len(models):
        logger.info("Trying alternative sources...")
        for alt_source in alternative_sources:
            model_file = alt_source["output"]
            if not model_file.exists():
                if download_file(alt_source["url"], model_file, token):
                    success_count += 1
                    logger.info(f"Downloaded {alt_source['name']} from alternative source")
    
    logger.info(f"Successfully downloaded {success_count} out of {len(models)} models")
    return success_count > 0

if __name__ == "__main__":
    main()