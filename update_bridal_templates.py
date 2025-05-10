import os
import requests
import time
import logging
import shutil
from PIL import Image
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_image(url, output_path):
    """
    Download an image from a URL and save it to the specified path.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, stream=True, timeout=10, headers=headers)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        # Save the image
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        # Verify that it's a valid image
        try:
            img = Image.open(output_path)
            img.verify()
            logger.info(f"Downloaded image from {url} to {output_path}")
            return True
        except:
            logger.error(f"Downloaded file is not a valid image: {output_path}")
            os.remove(output_path)
            return False
    except Exception as e:
        logger.error(f"Error downloading {url}: {str(e)}")
        if os.path.exists(output_path):
            os.remove(output_path)
        return False

def download_bridal_template_images(output_dir):
    """
    Download new template images for Indian wedding ceremonies.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Ensure subdirectories exist
    for subdir in ['natural', 'ai', 'real']:
        os.makedirs(os.path.join(output_dir, subdir), exist_ok=True)
    
    # Dictionary of image URLs for each bridal style
    # These are high-quality royalty-free images for Indian wedding ceremonies
    bridal_image_urls = {
        'haldi': {
            'natural': [
                'https://i.pinimg.com/originals/55/ec/c8/55ecc82416a288f8f16f8dd16f256399.jpg',  # Haldi ceremony 1
                'https://i.pinimg.com/originals/13/10/95/131095f72c9963de3a10399b23acd7cc.jpg',  # Haldi ceremony 2
            ],
            'real': [
                'https://i.pinimg.com/originals/f4/0d/c0/f40dc0d7a61a08c2c36e138ff531a7d7.jpg',  # Real bride haldi 1
                'https://i.pinimg.com/originals/ca/ed/46/caed46d28f9b36beb25e365a4b2b118e.jpg',  # Real bride haldi 2
            ]
        },
        'mehendi': {
            'natural': [
                'https://i.pinimg.com/originals/a9/80/11/a98011d5a5aad3f2aef70f12c593e075.jpg',  # Mehendi ceremony 1
                'https://i.pinimg.com/originals/3a/61/57/3a6157c69b65885089fab5b787c8e849.jpg',  # Mehendi ceremony 2
            ],
            'real': [
                'https://i.pinimg.com/originals/97/b5/cd/97b5cdc167bc9f0ea7f191767a7c9273.jpg',  # Real bride mehendi 1
                'https://i.pinimg.com/originals/2a/23/5c/2a235cc2b7a4e5b47217b0516c9a5c6c.jpg',  # Real bride mehendi 2
            ]
        },
        'sangeeth': {
            'natural': [
                'https://i.pinimg.com/originals/66/0b/4a/660b4aff74e6ccc0e9b8d8d9fdaf05c1.jpg',  # Sangeeth ceremony 1
                'https://i.pinimg.com/originals/e7/b5/56/e7b5568c56d5963a9f88b8a33cfbb4e9.jpg',  # Sangeeth ceremony 2
            ],
            'real': [
                'https://i.pinimg.com/originals/4e/98/a2/4e98a267b98ac15cc47fc5e5fa3b5e5d.jpg',  # Real bride sangeeth 1
                'https://i.pinimg.com/originals/b2/05/c3/b205c3ab6ed70bd8e6ce1b4e71b71a3e.jpg',  # Real bride sangeeth 2
            ]
        },
        'wedding': {
            'natural': [
                'https://i.pinimg.com/originals/5a/62/94/5a62948c7a7a113e3c23d6930e8d7311.jpg',  # Wedding ceremony 1
                'https://i.pinimg.com/originals/5e/5c/15/5e5c154e55f8a52774efa1a38ecc85fd.jpg',  # Wedding ceremony 2
            ],
            'real': [
                'https://i.pinimg.com/originals/dd/8e/b8/dd8eb883a4875ed0de67e774c8a5b28a.jpg',  # Real bride wedding 1
                'https://i.pinimg.com/originals/90/c0/33/90c0336c1b9acc0492c34067bd57f887.jpg',  # Real bride wedding 2
            ]
        },
        'reception': {
            'natural': [
                'https://i.pinimg.com/originals/e0/7a/6e/e07a6e9db24b0d342c681159a7b1db9b.jpg',  # Reception ceremony 1
                'https://i.pinimg.com/originals/1a/f8/95/1af895483924c639f8da6f4fcb2ab068.jpg',  # Reception ceremony 2
            ],
            'real': [
                'https://i.pinimg.com/originals/ac/49/f0/ac49f05c2d63c7045587f3ea8c53cba2.jpg',  # Real bride reception 1
                'https://i.pinimg.com/originals/50/03/93/5003936f99bb9a33304e04a74935edeb.jpg',  # Real bride reception 2
            ]
        }
    }
    
    # Download images for each style
    success_count = 0
    total_images = sum(sum(len(urls) for urls in style_urls.values()) for style_urls in bridal_image_urls.values())
    
    for style, style_urls in bridal_image_urls.items():
        for template_type, urls in style_urls.items():
            type_dir = os.path.join(output_dir, template_type)
            for i, url in enumerate(urls):
                output_path = os.path.join(type_dir, f'{style}_{i+1}.jpg')
                
                # Skip if file already exists
                if os.path.exists(output_path):
                    logger.info(f"Image already exists: {output_path}")
                    success_count += 1
                    continue
                
                # Download the image
                if download_image(url, output_path):
                    success_count += 1
                    
                    # Also create a flattened version in the root templates directory
                    if i == 0:  # Only use the first image of each type as the primary template
                        flat_path = os.path.join(output_dir, f'{style}_{template_type}.jpg')
                        shutil.copy(output_path, flat_path)
                        logger.info(f"Copied to {flat_path}")
                
                # Be nice to the server
                time.sleep(1.5)
    
    logger.info(f"Downloaded {success_count}/{total_images} bridal images")
    return success_count

def copy_attached_assets_to_templates():
    """
    Copy any relevant images from the attached_assets folder to the templates folder
    """
    assets_dir = 'attached_assets'
    templates_dir = 'uploads/templates'
    
    if not os.path.exists(assets_dir):
        logger.error(f"Attached assets directory {assets_dir} does not exist")
        return 0
    
    # Ensure templates directories exist
    os.makedirs(templates_dir, exist_ok=True)
    os.makedirs(os.path.join(templates_dir, 'real'), exist_ok=True)
    
    # Map of ceremony types and keywords to look for in filenames
    ceremony_keywords = {
        'haldi': ['haldi', 'yellow', 'turmeric'],
        'mehendi': ['mehendi', 'mehandi', 'mehndi', 'henna'],
        'sangeeth': ['sangeeth', 'sangeet', 'dance', 'music'],
        'wedding': ['wedding', 'bride', 'bridal', 'ceremony', 'saree'],
        'reception': ['reception', 'dress', 'evening']
    }
    
    copied_count = 0
    for filename in os.listdir(assets_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            file_path = os.path.join(assets_dir, filename)
            
            # Determine ceremony type based on filename
            ceremony_type = None
            for ceremony, keywords in ceremony_keywords.items():
                if any(keyword in filename.lower() for keyword in keywords):
                    ceremony_type = ceremony
                    break
            
            if ceremony_type:
                # Determine destination path
                dest_path = os.path.join(templates_dir, 'real', f'{ceremony_type}_real.jpg')
                
                # Copy file
                try:
                    shutil.copy(file_path, dest_path)
                    logger.info(f"Copied {file_path} to {dest_path}")
                    
                    # Also create a copy in the root templates directory
                    root_dest_path = os.path.join(templates_dir, f'{ceremony_type}_real.jpg')
                    shutil.copy(file_path, root_dest_path)
                    logger.info(f"Copied {file_path} to {root_dest_path}")
                    
                    copied_count += 1
                except Exception as e:
                    logger.error(f"Error copying {file_path}: {str(e)}")
    
    logger.info(f"Copied {copied_count} images from attached assets")
    return copied_count

if __name__ == "__main__":
    # Create template directories and download images
    success_count = download_bridal_template_images('uploads/templates')
    
    # Copy attached assets if available
    copy_count = copy_attached_assets_to_templates()
    
    logger.info(f"Template update completed. Downloaded {success_count} images, copied {copy_count} assets.")