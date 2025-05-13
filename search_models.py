import os
import requests
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def search_models(query, token):
    """Search for models on Hugging Face Hub."""
    url = "https://huggingface.co/api/models"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"search": query, "limit": 20}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        results = response.json()
        
        logger.info(f"Found {len(results)} results for query '{query}'")
        for i, model in enumerate(results):
            logger.info(f"{i+1}. {model['id']} - {model.get('pipeline_tag', 'Unknown')}")
            
        return results
    except Exception as e:
        logger.error(f"Error searching for models: {str(e)}")
        return []

def main():
    # Get Hugging Face token
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        logger.error("HUGGINGFACE_TOKEN environment variable not set")
        return False
    
    # Search for CodeFormer models
    logger.info("Searching for CodeFormer models...")
    codeformer_results = search_models("codeformer onnx", token)
    
    # Search for GFPGAN models
    logger.info("Searching for GFPGAN models...")
    gfpgan_results = search_models("gfpgan onnx", token)
    
    return True

if __name__ == "__main__":
    main()