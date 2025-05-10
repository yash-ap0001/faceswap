import os
import cv2
import numpy as np
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

"""
Script to create visually appealing template images for each ceremony type
using the attached assets as base images.
"""

# Map assets to ceremony types and add visual effects
CEREMONY_IMAGE_MAPPINGS = {
    'haldi': ['weeding saree.jpg', (255, 215, 0)],      # Haldi (Yellow)
    'mehendi': ['halfhand.jpg', (76, 175, 80)],         # Mehendi (Green)
    'sangeeth': ['voni dress.jpg', (63, 81, 181)],      # Sangeeth (Indigo)
    'wedding': ['full dress.jpg', (211, 47, 47)],       # Wedding (Red)
    'reception': ['jewellary.jpg', (156, 39, 176)]      # Reception (Purple)
}

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def add_ceremony_overlay(img, ceremony_type, variation=1):
    """Add ceremony-specific overlay effects to the image."""
    # Convert to PIL for better text and effects
    if img is None:
        return None
        
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    
    # Apply different effects based on variation
    if variation == 1:
        # Standard filter - slight enhancement
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.2)
        
    elif variation == 2:
        # High contrast 
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.5)
        
    elif variation == 3:
        # Warm tone
        enhancer = ImageEnhance.Color(img_pil)
        img_pil = enhancer.enhance(1.3)
        # Apply sepia tone effect
        sepia_effect = Image.new('RGB', img_pil.size, (255, 179, 102))
        img_pil = Image.blend(img_pil, sepia_effect, 0.3)
        
    elif variation == 4:
        # Soft focus/dreamy
        img_pil = img_pil.filter(ImageFilter.GaussianBlur(radius=1))
        enhancer = ImageEnhance.Brightness(img_pil)
        img_pil = enhancer.enhance(1.1)
        
    elif variation == 5:
        # Vivid colors
        enhancer = ImageEnhance.Color(img_pil)
        img_pil = enhancer.enhance(1.7)
    
    # Add ceremony-specific color tint based on the ceremony color
    ceremony_color = CEREMONY_IMAGE_MAPPINGS.get(ceremony_type, [(0, 0, 0)])[1]
    color_layer = Image.new('RGB', img_pil.size, ceremony_color)
    img_pil = Image.blend(img_pil, color_layer, 0.15)
    
    # Add text overlay
    draw = ImageDraw.Draw(img_pil)
    width, height = img_pil.size
    
    # Add semi-transparent background for text
    overlay = Image.new('RGBA', img_pil.size, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    draw_overlay.rectangle([(0, height-80), (width, height)], fill=(0, 0, 0, 180))
    
    # Use a default font
    try:
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_small = ImageFont.truetype("arial.ttf", 18)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Add ceremony text
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
    
    # Convert back to RGBA for alpha blending
    img_pil = img_pil.convert('RGBA')
    img_with_overlay = Image.alpha_composite(img_pil, overlay.convert('RGBA'))
    img_pil = img_with_overlay.convert('RGB')
    
    # Add text on top of overlay
    draw = ImageDraw.Draw(img_pil)
    title = ceremony_titles.get(ceremony_type, ceremony_type.title())
    description = ceremony_descriptions.get(ceremony_type, '')
    
    draw.text((20, height-70), title, font=font_large, fill=(255, 255, 255))
    draw.text((20, height-30), description, font=font_small, fill=(200, 200, 200))
    
    # Add variation indicator
    if variation > 0:
        style_names = ["Standard", "High Contrast", "Warm Tone", "Soft Focus", "Vivid Colors"]
        variation_text = f"Style {variation}: {style_names[variation-1]}"
        
        # Add style badge at top-right
        badge_width = 150
        badge_height = 30
        draw.rectangle(
            [(width-badge_width-10, 10), (width-10, 10+badge_height)],
            fill=ceremony_color
        )
        draw.text(
            (width-badge_width, 15), 
            variation_text, 
            font=ImageFont.load_default(), 
            fill=(255, 255, 255)
        )
    
    # Convert back to OpenCV format
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

def create_template_variations(source_img, ceremony_type, output_dir):
    """Create multiple variations for each template."""
    if source_img is None:
        print(f"Error: Source image for {ceremony_type} is None")
        return
        
    # Create main AI template
    main_path = os.path.join(output_dir, f"{ceremony_type}.jpg")
    main_img = add_ceremony_overlay(source_img, ceremony_type)
    cv2.imwrite(main_path, main_img)
    print(f"Created main AI template: {main_path}")
    
    # Create variations with different effects
    for i in range(1, 6):
        variation_path = os.path.join(output_dir, f"{ceremony_type}_{i}.jpg")
        variation_img = add_ceremony_overlay(source_img, ceremony_type, variation=i)
        cv2.imwrite(variation_path, variation_img)
        print(f"Created AI variation {i}: {variation_path}")

def main():
    # Define output directories
    template_dir = "uploads/templates" 
    ai_dir = os.path.join(template_dir, "ai")
    create_directory_if_not_exists(ai_dir)
    
    # Process each ceremony type
    for ceremony_type, (image_name, _) in CEREMONY_IMAGE_MAPPINGS.items():
        # Load source image from attached assets
        source_path = os.path.join("attached_assets", image_name)
        
        if os.path.exists(source_path):
            source_img = cv2.imread(source_path)
            if source_img is not None:
                print(f"Creating templates for {ceremony_type} using {image_name}")
                create_template_variations(source_img, ceremony_type, ai_dir)
                
                # Also copy the main AI template to the templates directory
                ai_main = os.path.join(ai_dir, f"{ceremony_type}.jpg")
                main_target = os.path.join(template_dir, f"{ceremony_type}_ai.jpg")
                if os.path.exists(ai_main):
                    shutil.copy2(ai_main, main_target)
                    print(f"Copied to main directory: {main_target}")
            else:
                print(f"Failed to read image: {source_path}")
        else:
            print(f"Warning: Source image {source_path} not found for {ceremony_type}")

if __name__ == "__main__":
    main()