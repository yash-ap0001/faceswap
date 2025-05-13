import os
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def search_huggingface(query, token=None):
    """
    Search for models on Hugging Face Hub.
    
    Args:
        query (str): Search query
        token (str, optional): Hugging Face API token
    
    Returns:
        list: List of matching models
    """
    url = f"https://huggingface.co/api/models?search={query}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        logger.info(f"Searching Hugging Face Hub for: {query}")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        models = response.json()
        logger.info(f"Found {len(models)} results")
        
        # Filter models with ONNX format
        onnx_models = [model for model in models if 'onnx' in model.get('pipeline_tag', '').lower() 
                      or 'onnx' in model.get('tags', [])]
        
        logger.info(f"Found {len(onnx_models)} ONNX models")
        return onnx_models
    
    except Exception as e:
        logger.error(f"Error searching Hugging Face Hub: {str(e)}")
        return []

def main():
    """Main function to search for face enhancement models"""
    # Get Hugging Face token
    token = os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        logger.warning("HUGGINGFACE_TOKEN environment variable not set, searching without authentication")
    
    # Search for models
    queries = ["codeformer", "gfpgan", "face enhancement", "face restoration"]
    
    all_results = []
    for query in queries:
        results = search_huggingface(query, token)
        all_results.extend(results)
        
        # Print results
        logger.info(f"Search results for '{query}':")
        for model in results:
            model_id = model.get('modelId', 'unknown')
            model_type = model.get('pipeline_tag', 'unknown')
            tags = model.get('tags', [])
            
            logger.info(f"- {model_id} (Type: {model_type}, Tags: {', '.join(tags)})")
    
    # Save results to file
    with open("hf_model_search_results.json", "w") as f:
        json.dump(all_results, f, indent=2)
    
    logger.info(f"Saved {len(all_results)} search results to hf_model_search_results.json")

if __name__ == "__main__":
    main()