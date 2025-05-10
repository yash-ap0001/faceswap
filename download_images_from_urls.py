import os
import time
import requests
import random

"""
Script to download images from direct URLs without scraping.
This approach avoids the limitations of scraping Pinterest.
"""

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def download_image(url, output_path):
    """
    Download an image from a URL and save it to the specified path.
    Adds a delay between downloads to avoid rate limiting.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.google.com/'  # Using Google as referer to avoid Pinterest blocks
        }
        # Add a small random delay to avoid rate limiting
        time.sleep(random.uniform(0.5, 1.5))
        
        response = requests.get(url, headers=headers, stream=True)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded: {output_path}")
            return True
        else:
            print(f"Failed to download {url}: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def download_images():
    """
    Download images from direct URLs.
    """
    # Create base directories
    base_dir = "uploads/templates/pinterest"
    create_directory_if_not_exists(base_dir)
    
    # Create ceremony-specific directories
    ceremonies = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    for ceremony in ceremonies:
        ceremony_dir = os.path.join(base_dir, ceremony)
        create_directory_if_not_exists(ceremony_dir)
    
    # High-quality Indian wedding images
    # These URLs are directly accessible and don't require scraping Pinterest
    image_urls = {
        'haldi': [
            'https://i.pinimg.com/originals/31/dc/ec/31dcec6dbd89b18e61e9e8b18b7d5ec7.jpg',
            'https://i.pinimg.com/originals/a4/74/21/a47421e4af7a0f3399da7e394545618a.jpg',
            'https://i.pinimg.com/originals/fa/a3/7f/faa37fdfd83b75547d85847f9be60334.jpg',
            'https://i.pinimg.com/originals/52/5e/05/525e05f7bda628e8ad1c7d5c8dc5f2a3.jpg',
            'https://i.pinimg.com/originals/89/fe/54/89fe5488b5e87ab0bacd7a6a3f414dd5.jpg'
        ],
        'mehendi': [
            'https://i.pinimg.com/originals/56/af/c3/56afc3ca944da43ab354eceb55e90c6b.jpg',
            'https://i.pinimg.com/originals/34/8a/66/348a66a432e6d889ca4f6a1ecf59c87d.jpg',
            'https://i.pinimg.com/originals/1d/b7/14/1db714c76ab06e6b52e3b9bc4c5e3711.jpg',
            'https://i.pinimg.com/originals/02/8e/8e/028e8e6246ff90d506b1b4a9d3c1cf0f.jpg',
            'https://i.pinimg.com/originals/7f/f7/e9/7ff7e9ebb6a9a7fe82af601ff3a71a82.jpg'
        ],
        'sangeeth': [
            'https://i.pinimg.com/originals/94/55/36/945536cb3e3a98a8384ddbdde7a1dfc4.jpg',
            'https://i.pinimg.com/originals/35/0e/40/350e40db8af94c9c2b49dc85eb48a27e.jpg',
            'https://i.pinimg.com/originals/9e/4b/50/9e4b50d4ccebfc54d873a83a6fcf4e52.jpg',
            'https://i.pinimg.com/originals/f6/e7/5a/f6e75a0da1f2123f9d4a7dda60f5dc99.jpg',
            'https://i.pinimg.com/originals/c4/da/6d/c4da6de84b11c66658b2c9dceddbcfb3.jpg'
        ],
        'wedding': [
            'https://i.pinimg.com/originals/a8/2e/29/a82e2909cb0cc7a73a43ef9c1e823864.jpg',
            'https://i.pinimg.com/originals/8e/eb/68/8eeb68db53497d0c2577fe94301f7dfd.jpg',
            'https://i.pinimg.com/originals/57/6c/16/576c16320c1eaccc1c42d25d18a93710.jpg',
            'https://i.pinimg.com/originals/29/a1/c5/29a1c5e5cb446e3c98f24c27a2f76ee3.jpg',
            'https://i.pinimg.com/originals/cf/22/ee/cf22ee8f90c7a9c12f04473b79be40ad.jpg'
        ],
        'reception': [
            'https://i.pinimg.com/originals/bd/ac/11/bdac11a3539b8fde2b35dfe7baf06cc0.jpg',
            'https://i.pinimg.com/originals/a2/f8/14/a2f814e75a04211edf2da5aca53b5bb8.jpg',
            'https://i.pinimg.com/originals/9c/ca/23/9cca232a48a67d39af50e0e6fa1c4ba2.jpg',
            'https://i.pinimg.com/originals/54/96/4e/54964ebdf29c0a6b15adb14e7e3a04ba.jpg',
            'https://i.pinimg.com/originals/8d/a2/20/8da220b3bd80d1ed0f39e53a01ed0b81.jpg'
        ]
    }
    
    # Download images for each ceremony
    for ceremony, urls in image_urls.items():
        print(f"Downloading {ceremony} images...")
        for i, url in enumerate(urls):
            output_path = os.path.join(base_dir, ceremony, f"{ceremony}_{i+1}.jpg")
            
            # Skip if the file already exists
            if os.path.exists(output_path):
                print(f"File already exists: {output_path}")
                continue
                
            # Download the image
            download_image(url, output_path)
            
            # Also create the main template file for the first image
            if i == 0:
                main_path = os.path.join(base_dir, ceremony, f"{ceremony}.jpg")
                if not os.path.exists(main_path):
                    import shutil
                    shutil.copyfile(output_path, main_path)
                    print(f"Created main template: {main_path}")
                    
                    # Update the main ceremony template in templates directory
                    template_path = os.path.join("uploads/templates", f"{ceremony}_pinterest.jpg")
                    shutil.copyfile(output_path, template_path)
                    print(f"Updated main template: {template_path}")

if __name__ == "__main__":
    download_images()