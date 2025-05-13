import os
import requests
import logging
from pathlib import Path
import huggingface_hub

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Path to save the models
MODELS_DIR = Path("models/enhancement")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def list_repo_files(repo_id, token=None):
    """List all files in a Hugging Face repo."""
    try:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        api_url = f"https://huggingface.co/api/models/{repo_id}/tree/main"
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        
        files = response.json()
        logger.info(f"Found {len(files)} files in repo {repo_id}")
        for file in files:
            if file.get("type") == "file":
                logger.info(f"- {file.get('path')}")
        
        return files
    except Exception as e:
        logger.error(f"Error listing files in repo {repo_id}: {str(e)}")
        return []

def download_file(url, output_path, token=None):
    """Download a file from URL."""
    try:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        logger.info(f"Downloading from {url}")
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()
        
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        logger.info(f"Downloaded to {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error downloading {url}: {str(e)}")
        return False

def download_model_from_hf(repo_id, filepath, output_path, token=None):
    """Download a specific file from a Hugging Face repo."""
    try:
        if token:
            huggingface_hub.login(token=token)
        
        url = huggingface_hub.hf_hub_url(repo_id=repo_id, filename=filepath)
        logger.info(f"Attempting to download {repo_id}/{filepath}")
        
        huggingface_hub.hf_hub_download(
            repo_id=repo_id,
            filename=filepath,
            local_dir=MODELS_DIR.parent,
            local_dir_use_symlinks=False,
            token=token
        )
        logger.info(f"Successfully downloaded {filepath} from {repo_id}")
        return True
    except Exception as e:
        logger.error(f"Error downloading from {repo_id}/{filepath}: {str(e)}")
        return False

def download_from_repos():
    """Download models from the found repositories."""
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        logger.warning("HUGGINGFACE_TOKEN not set")
    
    # Define target models
    target_models = [
        # CodeFormer models
        {
            "repo_id": "Oil3/faster_codeformer_onnx",
            "output_file": MODELS_DIR / "faster_codeformer_onnx.onnx",
            "possible_filenames": [
                "faster_codeformer_onnx.onnx", 
                "model.onnx", 
                "codeformer.onnx",
                "CodeFormer.onnx"
            ]
        },
        # GFPGAN models
        {
            "repo_id": "Neus/GFPGANv1.4",
            "output_file": MODELS_DIR / "gfpgan_1.4.onnx",
            "possible_filenames": [
                "GFPGANv1.4.onnx",
                "gfpgan_v1.4.onnx",
                "gfpgan.onnx",
                "GFPGAN.onnx",
                "model.onnx"
            ]
        }
    ]
    
    for model in target_models:
        logger.info(f"Attempting to download from {model['repo_id']}")
        
        # List files in the repo
        files = list_repo_files(model['repo_id'], token)
        
        # Try to find matching files
        file_paths = []
        for file in files:
            if file.get("type") == "file" and file.get("path", "").endswith(".onnx"):
                file_paths.append(file.get("path"))
        
        # Try downloading each matching file
        success = False
        for filepath in file_paths:
            filename = os.path.basename(filepath)
            if filename in model["possible_filenames"] or any(possible.lower() == filename.lower() for possible in model["possible_filenames"]):
                try:
                    download_model_from_hf(
                        model["repo_id"], 
                        filepath, 
                        model["output_file"],
                        token
                    )
                    success = True
                    break
                except Exception as e:
                    logger.error(f"Failed to download {filepath}: {str(e)}")
        
        if not success:
            logger.warning(f"Could not find or download any matching file from {model['repo_id']}")

if __name__ == "__main__":
    try:
        import huggingface_hub
        download_from_repos()
    except ImportError:
        logger.error("huggingface_hub not installed. Installing...")
        os.system("pip install huggingface_hub")
        try:
            import huggingface_hub
            download_from_repos()
        except Exception as e:
            logger.error(f"Failed to install or import huggingface_hub: {str(e)}")