import os
import requests
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Path to save the models
MODELS_DIR = Path("models/enhancement")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def download_from_huggingface(repo_id, file_path, output_path, token=None):
    """
    Download a file from Hugging Face repository.
    
    Args:
        repo_id (str): The repository ID
        file_path (str): Path to the file within the repository
        output_path (Path): Where to save the file locally
        token (str, optional): Hugging Face token
    """
    url = f"https://huggingface.co/{repo_id}/resolve/main/{file_path}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    logger.info(f"Downloading from {url} to {output_path}")
    
    try:
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
    """Main function to download the models"""
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        logger.warning("HUGGINGFACE_TOKEN not set, attempting to download without authentication")
    
    # Models to download
    models = [
        {
            "name": "CodeFormer",
            "repo_id": "Oil3/faster_codeformer_onnx",
            "file_path": "faster_codeformer_onnx.onnx",
            "output_path": MODELS_DIR / "faster_codeformer_onnx.onnx"
        },
        {
            "name": "GFPGAN",
            "repo_id": "JackCui/facefusion",
            "file_path": "gfpgan_1.4.onnx",
            "output_path": MODELS_DIR / "gfpgan_1.4.onnx"
        }
    ]
    
    # Download each model
    for model in models:
        success = download_from_huggingface(
            model["repo_id"], 
            model["file_path"], 
            model["output_path"],
            token
        )
        
        if success:
            logger.info(f"Successfully downloaded {model['name']} model")
        else:
            logger.error(f"Failed to download {model['name']} model")

if __name__ == "__main__":
    main()