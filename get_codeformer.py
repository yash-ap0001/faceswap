import os
import requests
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def download_file(url, output_path, token=None):
    """Download a file from URL."""
    try:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        logger.info(f"Downloading from {url}")
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        logger.info(f"File size: {total_size / (1024 * 1024):.2f} MB")
        
        downloaded = 0
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    
                    # Log progress
                    if total_size > 0:
                        percent = min(100, downloaded * 100 / total_size)
                        if int(percent) % 10 == 0:
                            logger.info(f"Downloaded: {percent:.1f}% ({downloaded/(1024*1024):.2f} MB)")
        
        logger.info(f"Successfully downloaded to {output_path}")
        return True
    
    except Exception as e:
        logger.error(f"Error downloading from {url}: {str(e)}")
        return False

def main():
    """Try to download the CodeFormer model from various sources."""
    models_dir = Path("models/enhancement")
    codeformer_path = models_dir / "faster_codeformer_onnx.onnx"
    
    token = os.environ.get("HUGGINGFACE_TOKEN")
    
    # Different URLs to try
    urls = [
        "https://huggingface.co/Oil3/faster_codeformer_onnx/blob/main/faster_codeformer_onnx.onnx",
        "https://huggingface.co/bluefoxcreation/Codeformer-ONNX/resolve/main/codeformer.onnx",
        "https://huggingface.co/yuvraj108c/codeformer-onnx/resolve/main/codeformer.onnx",
        "https://huggingface.co/karanjakhar/codeformer/resolve/main/codeformer.onnx",
        "https://huggingface.co/hrcheng1066/face-restoration/resolve/main/codeformer.onnx"
    ]
    
    for url in urls:
        logger.info(f"Trying to download from {url}")
        if download_file(url, codeformer_path, token):
            logger.info(f"Successfully downloaded CodeFormer model from {url}")
            return True
    
    logger.error("Failed to download CodeFormer model from any source")
    return False

if __name__ == "__main__":
    main()