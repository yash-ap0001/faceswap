import os
import requests
from pathlib import Path
import time

# Path to save the models
MODELS_DIR = Path("models/enhancement")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def download_model(repo_id, filename, output_path, subfolder=None):
    """
    Download a model from Hugging Face Hub.
    
    Args:
        repo_id (str): The repository ID on Hugging Face Hub.
        filename (str): The filename in the repository.
        output_path (str): The path to save the downloaded model.
        subfolder (str, optional): Subfolder in the repository.
    """
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        raise ValueError("HUGGINGFACE_TOKEN environment variable is not set")
    
    path_part = f"{subfolder}/{filename}" if subfolder else filename
    url = f"https://huggingface.co/{repo_id}/resolve/main/{path_part}"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Downloading {url} to {output_path}...")
    response = requests.get(url, headers=headers, stream=True)
    
    if response.status_code == 200:
        file_size = int(response.headers.get('content-length', 0))
        print(f"File size: {file_size / (1024 * 1024):.2f} MB")
        
        with open(output_path, "wb") as f:
            downloaded = 0
            start_time = time.time()
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                
                # Print progress
                progress = min(100, downloaded * 100 / file_size if file_size > 0 else 100)
                elapsed = time.time() - start_time
                speed = downloaded / (1024 * 1024 * elapsed) if elapsed > 0 else 0
                print(f"\rProgress: {progress:.1f}% ({downloaded/(1024*1024):.2f} MB), Speed: {speed:.2f} MB/s", end="")
        
        print(f"\nSuccessfully downloaded to {output_path}")
        return True
    else:
        print(f"Failed to download: {response.status_code}")
        return False

def try_alternative_models(model_name, output_path):
    """Try downloading from alternative repositories."""
    alternatives = {
        "faster_codeformer_onnx": [
            {"repo_id": "hrcheng1066/face-restoration", "filename": "codeformer.onnx"},
            {"repo_id": "TheoBIoT/animegan", "filename": "FaceEnhancer.onnx"},
            {"repo_id": "ccw613/TravellingFace", "filename": "CodeFormer.onnx"}
        ],
        "gfpgan_1.4": [
            {"repo_id": "ashleykleynhans/gfpgan", "filename": "GFPGANv1.4.onnx"},
            {"repo_id": "ccw613/TravellingFace", "filename": "gfpgan_v1.4.onnx"},
            {"repo_id": "camenduru/GFPGANv1.4", "filename": "GFPGANv1.4.onnx"}
        ]
    }
    
    if model_name in alternatives:
        print(f"Trying alternative sources for {model_name}...")
        for alt in alternatives[model_name]:
            if download_model(alt["repo_id"], alt["filename"], output_path, subfolder=alt.get("subfolder")):
                return True
    
    return False

def main():
    # Define models to download
    models = [
        {
            "name": "faster_codeformer_onnx",
            "repo_id": "TheLastBen/dependencies", 
            "filename": "CodeFormer/codeformer-v0.1.0.onnx",
            "output_filename": "faster_codeformer_onnx.onnx"
        },
        {
            "name": "gfpgan_1.4",
            "repo_id": "camenduru/GFPGANv1.4", 
            "filename": "GFPGANv1.4.onnx",
            "output_filename": "gfpgan_1.4.onnx"
        }
    ]
    
    # Download each model
    for model in models:
        output_path = MODELS_DIR / model.get("output_filename", f"{model['name']}.onnx")
        
        # Try direct download first
        success = download_model(
            model["repo_id"], 
            model["filename"], 
            output_path,
            subfolder=model.get("subfolder")
        )
        
        # If direct download fails, try alternatives
        if not success:
            success = try_alternative_models(model["name"], output_path)
        
        if not success:
            print(f"Failed to download {model['name']} model after trying multiple sources.")

if __name__ == "__main__":
    main()