import os
import requests
from pathlib import Path

# Path to save the models
MODELS_DIR = Path("models/enhancement")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def download_model(repo_id, filename, output_path):
    """
    Download a model from Hugging Face Hub.
    
    Args:
        repo_id (str): The repository ID on Hugging Face Hub.
        filename (str): The filename in the repository.
        output_path (str): The path to save the downloaded model.
    """
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        raise ValueError("HUGGINGFACE_TOKEN environment variable is not set")
    
    url = f"https://huggingface.co/{repo_id}/resolve/main/{filename}"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Downloading {url} to {output_path}...")
    response = requests.get(url, headers=headers, stream=True)
    
    if response.status_code == 200:
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Successfully downloaded to {output_path}")
        return True
    else:
        print(f"Failed to download: {response.status_code} - {response.text}")
        return False

def main():
    # Define models to download
    models = [
        {
            "name": "faster_codeformer_onnx",
            "repo_id": "bluefoxcreation/faster_codeformer_onnx", 
            "filename": "faster_codeformer_onnx.onnx"
        },
        {
            "name": "gfpgan_1.4",
            "repo_id": "ashleykleynhans/gfpgan", 
            "filename": "GFPGANv1.4.onnx"
        }
    ]
    
    # Download each model
    for model in models:
        output_path = MODELS_DIR / f"{model['name']}.onnx"
        success = download_model(model["repo_id"], model["filename"], output_path)
        
        if not success:
            print(f"Failed to download {model['name']} model.")

if __name__ == "__main__":
    main()