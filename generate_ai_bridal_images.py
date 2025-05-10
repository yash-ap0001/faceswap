import os
import requests
import io
import cv2
import numpy as np
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont
import time

"""
Generate high-quality AI images for Indian wedding ceremonies using OpenAI DALL-E.
"""

# Setup OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# Define ceremony types with specific prompts
CEREMONY_PROMPTS = {
    'haldi': [
        "A beautiful Indian bride during her Haldi ceremony, wearing traditional yellow outfit, professional wedding photography, golden jewelry, yellow turmeric paste, warm lighting, bright colors, high detail, photorealistic",
        "Portrait of an Indian bride during Haldi pre-wedding ritual, traditional yellow saree, turmeric ceremony, wedding photography style, soft natural lighting, clear facial details, ornate gold jewelry",
        "Close-up portrait of an Indian bride at her Haldi ceremony, adorned with floral jewelry, yellow turmeric paste on skin, professional photography, golden hour lighting, traditional yellow outfit, high-end photography",
        "Full body portrait of an Indian bride during Haldi ceremony, sitting in traditional pose, yellow saree with gold embroidery, surrounded by marigold flowers, professional wedding photography style",
        "Side profile of an Indian bride during her Haldi ceremony, candid moment, beautiful yellow and gold traditional outfit, floral decorations, professional photography style, clear facial features"
    ],
    'mehendi': [
        "A beautiful Indian bride showing her intricate henna designs during Mehendi ceremony, professional wedding photography, red and green traditional outfit, elaborate jewelry, detailed henna patterns on hands",
        "Close-up of an Indian bride's hands with elaborate mehndi/henna designs, traditional bridal jewelry, red wedding outfit in background, professional photography with soft lighting",
        "Portrait of an Indian bride during Mehendi ceremony, showing off detailed henna designs on her hands, wearing traditional red lehenga, gold jewelry, professional wedding photography",
        "Full body portrait of a seated Indian bride during her Mehendi ceremony, intricate henna designs visible on hands, traditional red and green outfit, professional studio photography",
        "Indian bride with elaborate mehendi/henna designs on hands and feet, wearing traditional bridal jewelry and red outfit, professional photography with soft focus background"
    ],
    'sangeeth': [
        "Indian bride and groom dancing during their Sangeet ceremony, professional wedding photography, colorful traditional outfits, stage lighting, celebration atmosphere, clear faces",
        "Portrait of an Indian bride during Sangeet ceremony, colorful lehenga with embroidery, traditional jewelry, professional photography with stage lighting, joyful expression",
        "Indian bride performing classical dance at Sangeet ceremony, blue and gold traditional outfit, professional wedding photography, dynamic pose with clear facial features",
        "Group celebration at Indian Sangeet ceremony with bride in center, colorful traditional outfits, professional photography, stage lighting, festive atmosphere",
        "Close-up portrait of Indian bride during Sangeet night, traditional colorful outfit with detailed embroidery, professional photography with soft stage lighting"
    ],
    'wedding': [
        "Portrait of an Indian bride in traditional red wedding saree with gold embroidery, complete bridal jewelry set, professional wedding photography, clear facial features, soft background",
        "Full length portrait of an Indian bride in traditional red lehenga with heavy gold embroidery, complete bridal jewelry set including maang tikka, professional wedding photography",
        "Indian bride and groom during their wedding ceremony, traditional outfits, bride in red lehenga, professional photography with mandap in background, clear faces",
        "Side profile of an Indian bride in full traditional red wedding attire and complete gold jewelry set, professional photography with decorative background",
        "Close-up portrait of Indian bride's face with traditional bridal makeup, red bindi, nose ring, and complete jewelry set, professional wedding photography style"
    ],
    'reception': [
        "Indian bride and groom at their wedding reception, formal portrait, bride in elegant reception lehenga, professional indoor photography, decorative background, clear faces",
        "Portrait of an Indian bride at wedding reception, wearing elegant purple or maroon lehenga with silver embroidery, sophisticated jewelry, professional indoor photography",
        "Full length portrait of Indian bride in modern reception outfit, fusion of traditional and contemporary styles, professional photography with venue decorations in background",
        "Indian bride and groom cutting cake at reception, bride wearing elegant reception outfit, professional event photography with venue lighting, clear faces",
        "Close-up portrait of Indian bride at reception, elegant hairstyle with flowers, sophisticated jewelry, professional photography with soft lighting"
    ]
}

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

def add_text_overlay(img_path, ceremony_type, variation_num=0):
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
    
    # Ceremony titles and descriptions
    ceremony_titles = {
        'haldi': 'Haldi Ceremony',
        'mehendi': 'Mehendi Celebration',
        'sangeeth': 'Sangeeth Night',
        'wedding': 'Wedding Ceremony',
        'reception': 'Reception Celebration'
    }
    
    ceremony_descriptions = {
        'haldi': 'A traditional pre-wedding ceremony filled with turmeric paste rituals',
        'mehendi': 'Artistic henna application ceremony with intricate designs',
        'sangeeth': 'Musical celebration with dance performances from family and friends',
        'wedding': 'The main wedding ceremony with traditional rituals and vows',
        'reception': 'Formal gathering to celebrate the newlyweds with dinner and dancing'
    }
    
    title = ceremony_titles.get(ceremony_type, ceremony_type.title())
    description = ceremony_descriptions.get(ceremony_type, '')
    
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
    
    # Add variation indicator if specified
    if variation_num > 0:
        style_badge = f"Style {variation_num}"
        # Add badge at top-right
        badge_width = 80
        badge_height = 30
        draw.rectangle(
            [(width-badge_width-10, 10), (width-10, 10+badge_height)],
            fill=(100, 100, 100, 180)
        )
        draw.text(
            (width-badge_width-5, 15), 
            style_badge, 
            fill=(255, 255, 255),
            font=desc_font
        )
    
    # Convert back to OpenCV format and save
    result_img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    cv2.imwrite(img_path, result_img)
    print(f"Added text overlay to {img_path}")

def generate_images_for_ceremony(ceremony_type, output_dir):
    """Generate 5 AI images for a specific ceremony type."""
    # Force regeneration of all images
    print(f"Generating new AI images for {ceremony_type}...")
        
    prompts = CEREMONY_PROMPTS.get(ceremony_type, [])
    if not prompts:
        print(f"No prompts defined for {ceremony_type}")
        return
        
    # Generate images for each prompt
    for i, prompt in enumerate(prompts, 1):
        print(f"Generating {ceremony_type} image {i} of {len(prompts)}...")
        
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            # Get image URL
            image_url = response.data[0].url
            if image_url:
                # Save image
                output_path = os.path.join(output_dir, f"{ceremony_type}_{i}.jpg")
                download_image(image_url, output_path)
                print(f"Saved image to {output_path}")
                
                # Add text overlay
                add_text_overlay(output_path, ceremony_type, i)
                
                # Also make a copy as the main file for the first image
                if i == 1:
                    main_path = os.path.join(output_dir, f"{ceremony_type}.jpg")
                    main_template_path = os.path.join(os.path.dirname(output_dir), f"{ceremony_type}_ai.jpg")
                    img = cv2.imread(output_path)
                    cv2.imwrite(main_path, img)
                    cv2.imwrite(main_template_path, img)
                    print(f"Created main template: {main_path}")
                    print(f"Created template in parent directory: {main_template_path}")
            else:
                print(f"No image URL returned for {ceremony_type} image {i}")
                
            # Rate limit: Wait 2 seconds between requests to avoid hitting rate limits
            time.sleep(2)
            
        except Exception as e:
            print(f"Error generating image for {ceremony_type}: {str(e)}")

def main():
    # Create output directory
    templates_dir = "uploads/templates"
    ai_dir = os.path.join(templates_dir, "ai")
    create_directory_if_not_exists(ai_dir)
    
    # Generate images for each ceremony type
    for ceremony_type in CEREMONY_PROMPTS.keys():
        print(f"\nGenerating images for {ceremony_type.upper()} ceremony...")
        generate_images_for_ceremony(ceremony_type, ai_dir)
        
    print("\nAI image generation complete!")

if __name__ == "__main__":
    main()