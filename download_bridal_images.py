import os
import requests
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_image(url, output_path):
    """
    Download an image from a URL and save it to the specified path.
    """
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        logger.info(f"Downloaded image from {url} to {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error downloading {url}: {str(e)}")
        return False

def download_bridal_images(output_dir):
    """
    Download natural bridal images for Indian wedding ceremonies.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Dictionary of image URLs for each bridal style
    # These are sample placeholder URLs - replace with real image URLs
    bridal_image_urls = {
        'haldi': [
            'https://i.pinimg.com/originals/09/e7/1f/09e71f1a16fd5c23950d9a08a9b02def.jpg',  # Yellow outfit, haldi ceremony
        ],
        'mehendi': [
            'https://i.pinimg.com/originals/4a/8a/ba/4a8aba13dddd175fc4287289cb5f44f7.jpg',  # Green outfit, mehendi ceremony
        ],
        'wedding': [
            'https://i.pinimg.com/originals/9e/eb/ea/9eebeac1c461235a4ab10a2649050be8.jpg',  # Red bridal lehenga
        ],
        'reception': [
            'https://i.pinimg.com/originals/c1/a4/c1/c1a4c1f8f90de238192f6ca4d33dd602.jpg',  # Maroon reception outfit
        ]
    }
    
    # Download images for each style
    success_count = 0
    total_images = sum(len(urls) for urls in bridal_image_urls.values())
    
    for style, urls in bridal_image_urls.items():
        for i, url in enumerate(urls):
            output_path = os.path.join(output_dir, f'{style}_natural_{i+1}.jpg')
            
            # Skip if file already exists
            if os.path.exists(output_path):
                logger.info(f"Image already exists: {output_path}")
                success_count += 1
                continue
            
            # Download the image
            if download_image(url, output_path):
                success_count += 1
            
            # Be nice to the server
            time.sleep(1)
    
    logger.info(f"Downloaded {success_count}/{total_images} bridal images")
    return success_count == total_images

if __name__ == "__main__":
    download_bridal_images('uploads/templates')