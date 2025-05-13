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

def download_file(url, output_path, token):
    """
    Download a file from URL to the specified path.
    
    Args:
        url (str): URL to download from
        output_path (Path): Path to save the file
        token (str): Authentication token
    
    Returns:
        bool: True if download successful, False otherwise
    """
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        logger.info(f"Downloading from {url} to {output_path}")
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        total_size = int(response.headers.get('content-length', 0))
        logger.info(f"File size: {total_size / (1024 * 1024):.2f} MB")
        
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
                        if downloaded % (1024 * 1024) < block_size:  # Log every 1MB
                            logger.info(f"Downloaded {downloaded / (1024 * 1024):.2f} / {total_size / (1024 * 1024):.2f} MB ({percent:.1f}%)")
        
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
            "url": "https://huggingface.co/Oil3/faster_codeformer_onnx/resolve/main/faster_codeformer_onnx.onnx",
            "output": MODELS_DIR / "faster_codeformer_onnx.onnx"
        },
        {
            "name": "GFPGAN",
            "url": "https://huggingface.co/JackCui/facefusion/resolve/main/gfpgan_1.4.onnx",
            "output": MODELS_DIR / "gfpgan_1.4.onnx"
        }
    ]
    
    # Download each model
    success_count = 0
    
    for model in models:
        if download_file(model["url"], model["output"], token):
            success_count += 1
        else:
            logger.warning(f"Failed to download {model['name']}")
    
    logger.info(f"Successfully downloaded {success_count} out of {len(models)} models")
    return success_count == len(models)

if __name__ == "__main__":
    main()