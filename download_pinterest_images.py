import os
import time
import requests
import trafilatura
from bs4 import BeautifulSoup
import re
import random
from urllib.parse import urljoin

"""
Script to download wedding saree images from a Pinterest board.
This script uses web scraping techniques to extract image URLs.

Note: Web scraping Pinterest is challenging due to dynamic loading and
potential rate limiting, so this script uses a careful approach.
"""

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def get_pinterest_board_html(url):
    """
    Get the HTML content of a Pinterest board.
    Uses trafilatura for initial retrieval.
    """
    print(f"Fetching board: {url}")
    try:
        # First attempt with trafilatura
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            print("Successfully fetched page with trafilatura")
            return downloaded
        
        # Second attempt with requests
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.pinterest.com/'
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("Successfully fetched page with requests")
            return response.text
        else:
            print(f"Failed to fetch page: Status code {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching board: {e}")
        return None

def extract_image_urls(html_content):
    """
    Extract image URLs from Pinterest board HTML.
    This function looks for high-resolution image URLs in the HTML content.
    """
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    image_urls = []
    
    # Method 1: Look for image tags with data attributes
    images = soup.select('img[src]')
    for img in images:
        src = img.get('src')
        if src and ('pinimg.com' in src or 'media-amazon.com' in src):
            # Filter for larger images and skip icons/thumbnails
            if 'x' in src and not src.endswith('.gif') and not 'avatars' in src:
                # Try to get the highest resolution version
                src = re.sub(r'/\d+x/|/\d+x\d+/', '/originals/', src)
                image_urls.append(src)
    
    # Method 2: Look for URLs in JSON data
    script_tags = soup.find_all('script', type='application/json')
    for script in script_tags:
        if script.string:
            # Find image URLs in the JSON content
            matches = re.findall(r'https?://[^"\']+\.(?:jpg|jpeg|png|webp)', script.string)
            for match in matches:
                if 'pinimg.com' in match and not match.endswith('.gif') and not 'avatars' in match:
                    # Try to get the highest resolution version
                    match = re.sub(r'/\d+x/|/\d+x\d+/', '/originals/', match)
                    image_urls.append(match)
    
    # Method 3: Find regular image elements
    for img in soup.find_all('img'):
        if not img.get('src'):
            continue
        src = img.get('src')
        if src and ('pinimg.com' in src or 'media-amazon.com' in src):
            if not src.endswith('.gif') and not 'avatars' in src:
                src = re.sub(r'/\d+x/|/\d+x\d+/', '/originals/', src)
                image_urls.append(src)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_image_urls = []
    for url in image_urls:
        if url not in seen:
            seen.add(url)
            unique_image_urls.append(url)
    
    print(f"Found {len(unique_image_urls)} unique image URLs")
    return unique_image_urls

def categorize_image(url):
    """
    Simple categorization of images based on URL or other features.
    This is a basic implementation and could be improved with image analysis.
    """
    url_lower = url.lower()
    if 'red' in url_lower or 'wedding' in url_lower:
        return 'wedding'
    elif 'yellow' in url_lower or 'haldi' in url_lower:
        return 'haldi'
    elif 'green' in url_lower or 'mehendi' in url_lower or 'mehndi' in url_lower:
        return 'mehendi'
    elif 'reception' in url_lower:
        return 'reception'
    elif 'sangeeth' in url_lower or 'sangeet' in url_lower:
        return 'sangeeth'
    else:
        # If we can't categorize, use a weighted random approach
        # Wedding and reception are more common
        categories = ['wedding', 'reception', 'sangeeth', 'mehendi', 'haldi']
        weights = [0.3, 0.25, 0.15, 0.15, 0.15]  # Probabilities adding up to 1
        return random.choices(categories, weights=weights)[0]

def download_image(url, output_path):
    """
    Download an image from a URL and save it to the specified path.
    Adds a delay between downloads to avoid rate limiting.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.pinterest.com/'
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

def download_pinterest_images(board_url, output_base_dir):
    """
    Download images from a Pinterest board URL.
    Images are saved to category-specific directories.
    """
    # Create the base output directory
    create_directory_if_not_exists(output_base_dir)
    
    # Create ceremony-specific directories
    ceremonies = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    for ceremony in ceremonies:
        ceremony_dir = os.path.join(output_base_dir, ceremony)
        create_directory_if_not_exists(ceremony_dir)
    
    # Get the board HTML
    html_content = get_pinterest_board_html(board_url)
    if not html_content:
        print("Failed to get board content.")
        return
    
    # Extract image URLs
    image_urls = extract_image_urls(html_content)
    if not image_urls:
        print("No image URLs found.")
        return
    
    # Download each image
    successful_downloads = 0
    for i, url in enumerate(image_urls):
        # Categorize the image
        category = categorize_image(url)
        output_dir = os.path.join(output_base_dir, category)
        
        # Create a filename based on index and category
        filename = f"{category}_{i+1}.jpg"
        output_path = os.path.join(output_dir, filename)
        
        # Download the image
        if download_image(url, output_path):
            successful_downloads += 1
        
        # Limit to 5 successful downloads per category to avoid overwhelming
        if successful_downloads >= 25:  # 5 images * 5 categories
            break
    
    print(f"Successfully downloaded {successful_downloads} images.")

if __name__ == "__main__":
    # Pinterest board URL
    pinterest_board_url = "https://in.pinterest.com/gayurovks/wedding-saree/"
    
    # Output directory for downloaded images
    output_directory = "uploads/templates/pinterest"
    
    # Download the images
    download_pinterest_images(pinterest_board_url, output_directory)