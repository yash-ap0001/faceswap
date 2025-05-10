import os
import requests
import io
import cv2
import numpy as np
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont

"""
Generate a high-quality AI image for Indian Haldi ceremony using OpenAI DALL-E.
"""

# Setup OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def download_image(url, filename):
    """Download image from URL and save to file."""
    response = requests.get(url)
    img = Image.open(io.BytesIO(response.content))
    img.save(filename)
    return filename

def add_text_overlay(img_path, variation_num=1):
    """Add descriptive text overlay to the image."""
    img = cv2.imread(img_path)
    if img is None:
        print(f"Error: Could not read image: {img_path}")
        return
    
    # Convert to PIL for better text handling
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    width, height = img_pil.size
    
    # Create semi-transparent overlay for text at bottom
    overlay = Image.new('RGBA', img_pil.size, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    draw_overlay.rectangle([(0, height-80), (width, height)], fill=(0, 0, 0, 180))
    
    # Create a composite with the overlay
    img_pil = img_pil.convert('RGBA')
    overlay_composite = Image.alpha_composite(img_pil, overlay)
    img_pil = overlay_composite.convert('RGB')
    
    # Add text
    draw = ImageDraw.Draw(img_pil)
    
    title = 'Haldi Ceremony'
    description = 'A traditional pre-wedding ceremony filled with turmeric paste rituals'
    
    # Use default font if custom font is not available
    try:
        title_font = ImageFont.truetype("arial.ttf", 36)
        desc_font = ImageFont.truetype("arial.ttf", 18)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Add text
    draw.text((20, height-70), title, fill=(255, 255, 255), font=title_font)
    draw.text((20, height-30), description, fill=(200, 200, 200), font=desc_font)
    
    # Add variation indicator
    style_names = ["Standard", "High Contrast", "Warm Tone", "Soft Focus", "Vivid Colors"]
    variation_text = f"Style {variation_num}: {style_names[variation_num-1]}"
    
    # Add style badge at top-right
    badge_width = 150
    badge_height = 30
    draw.rectangle(
        [(width-badge_width-10, 10), (width-10, 10+badge_height)],
        fill=(255, 215, 0, 220)  # Yellow for Haldi
    )
    draw.text(
        (width-badge_width+5, 15), 
        variation_text, 
        fill=(0, 0, 0),
        font=desc_font
    )
    
    # Convert back to OpenCV format and save
    result_img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    cv2.imwrite(img_path, result_img)
    print(f"Added text overlay to {img_path}")

def generate_haldi_image():
    """Generate AI image for Haldi ceremony."""
    # Define output directories
    templates_dir = "uploads/templates"
    ai_dir = os.path.join(templates_dir, "ai")
    create_directory_if_not_exists(ai_dir)
    
    # Create impressive prompt for Haldi ceremony
    prompt = """
    Create a stunning portrait of an Indian bride during her Haldi ceremony. 
    She should be wearing a traditional yellow saree or lehenga with intricate gold embroidery, 
    adorned with floral jewelry including marigold flowers. 
    Her skin should have turmeric paste application in beautiful patterns.
    The scene should be bright and vibrant with golden yellows and rich warm tones.
    Professional wedding photography style with soft, natural lighting and sharp details.
    Must be photorealistic and high quality, showcasing authentic Indian cultural elements.
    """
    
    print("Generating Haldi image with DALL-E...")
    
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="hd",
            n=1,
        )
        
        # Get image URL
        image_url = response.data[0].url
        if image_url:
            # Save image
            output_path = os.path.join(ai_dir, "haldi_1.jpg")
            download_image(image_url, output_path)
            print(f"Saved Haldi image to {output_path}")
            
            # Add text overlay
            add_text_overlay(output_path, 1)
            
            # Also make a copy as the main file
            main_path = os.path.join(ai_dir, "haldi.jpg")
            main_template_path = os.path.join(templates_dir, "haldi_ai.jpg")
            img = cv2.imread(output_path)
            cv2.imwrite(main_path, img)
            cv2.imwrite(main_template_path, img)
            print(f"Created main template: {main_path}")
            print(f"Created template in parent directory: {main_template_path}")
            
            return True
        else:
            print("No image URL returned.")
            return False
            
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return False

if __name__ == "__main__":
    generate_haldi_image()