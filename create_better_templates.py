import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

"""
Create better template images using the attached assets.
"""

# Map assets to ceremony types with better labels
ASSET_MAPPINGS = {
    'haldi': {
        'image': 'weeding saree.jpg',
        'title': 'Haldi Ceremony',
        'description': 'Traditional pre-wedding turmeric ceremony',
        'color': (255, 215, 0),  # Yellow
        'tint_factor': 0.15
    },
    'mehendi': {
        'image': 'halfhand.jpg',
        'title': 'Mehendi Celebration',
        'description': 'Artistic henna application ceremony',
        'color': (76, 175, 80),  # Green
        'tint_factor': 0.10
    },
    'sangeeth': {
        'image': 'voni dress.jpg',
        'title': 'Sangeeth Night',
        'description': 'Musical celebration with dance performances',
        'color': (63, 81, 181),  # Indigo
        'tint_factor': 0.12
    },
    'wedding': {
        'image': 'full dress.jpg',
        'title': 'Wedding Ceremony',
        'description': 'Traditional wedding rituals and vows',
        'color': (211, 47, 47),  # Red
        'tint_factor': 0.10
    },
    'reception': {
        'image': 'jewellary.jpg',
        'title': 'Reception Celebration',
        'description': 'Formal gathering to celebrate the newlyweds',
        'color': (156, 39, 176),  # Purple
        'tint_factor': 0.12
    }
}

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def add_style_overlay(img, ceremony_type, variation_num):
    """Add stylized overlay to the image."""
    if img is None:
        print(f"Error: Image is None for {ceremony_type}")
        return None
        
    ceremony_info = ASSET_MAPPINGS.get(ceremony_type, {})
    
    # Convert to PIL for better editing
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    
    # Resize the image to maintain aspect ratio but ensure consistent dimensions
    target_width = 1024
    target_height = 768
    
    # Calculate new dimensions preserving aspect ratio
    width, height = img_pil.size
    ratio = min(target_width/width, target_height/height)
    new_size = (int(width * ratio), int(height * ratio))
    
    img_pil = img_pil.resize(new_size, Image.LANCZOS)
    
    # If image is smaller than target, create a new image with padding
    if new_size[0] < target_width or new_size[1] < target_height:
        background = Image.new('RGB', (target_width, target_height), (0, 0, 0))
        offset = ((target_width - new_size[0]) // 2, (target_height - new_size[1]) // 2)
        background.paste(img_pil, offset)
        img_pil = background
    
    # Apply different effects based on variation number
    if variation_num == 1:  # Standard
        # Slight enhancement
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.1)
        
        # Add slight color tint
        ceremony_color = ceremony_info.get('color', (255, 255, 255))
        tint_factor = ceremony_info.get('tint_factor', 0.1)
        color_layer = Image.new('RGB', img_pil.size, ceremony_color)
        img_pil = Image.blend(img_pil, color_layer, tint_factor)
        
    elif variation_num == 2:  # Higher contrast
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.3)
        
        # Saturate colors
        enhancer = ImageEnhance.Color(img_pil)
        img_pil = enhancer.enhance(1.2)
        
    elif variation_num == 3:  # Warm tone
        # Add sepia effect
        sepia_effect = Image.new('RGB', img_pil.size, (255, 179, 102))
        img_pil = Image.blend(img_pil, sepia_effect, 0.2)
        
        # Increase warmth
        r, g, b = img_pil.split()
        r = r.point(lambda i: min(i + 15, 255))
        g = g.point(lambda i: min(i + 5, 255))
        img_pil = Image.merge('RGB', (r, g, b))
        
    elif variation_num == 4:  # Soft focus
        img_pil = img_pil.filter(ImageFilter.GaussianBlur(radius=1))
        
        # Brighten
        enhancer = ImageEnhance.Brightness(img_pil)
        img_pil = enhancer.enhance(1.1)
        
    elif variation_num == 5:  # Vivid colors
        enhancer = ImageEnhance.Color(img_pil)
        img_pil = enhancer.enhance(1.5)
        
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.15)
    
    # Add overlay with ceremony name and style
    width, height = img_pil.size
    
    # Create semi-transparent overlay for text
    overlay = Image.new('RGBA', img_pil.size, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    
    # Add dark gradient at bottom for text
    for i in range(100):
        opacity = int(180 * i / 100)  # Gradient from 0 to 180 opacity
        draw_overlay.rectangle(
            [(0, height - 100 + i), (width, height - 99 + i)],
            fill=(0, 0, 0, opacity)
        )
    
    # Add style badge at top
    style_names = ["Standard", "High Contrast", "Warm Tone", "Soft Focus", "Vivid Colors"]
    badge_text = f"Style {variation_num}: {style_names[variation_num-1]}"
    
    # Create badge background
    badge_width = len(badge_text) * 7 + 20  # Adjust width based on text length
    badge_height = 30
    
    # Get ceremony color for badge
    ceremony_color = ceremony_info.get('color', (255, 255, 255))
    r, g, b = ceremony_color
    
    # Draw badge with rounded corners
    draw_overlay.rectangle(
        [(width - badge_width - 10, 10), (width - 10, 10 + badge_height)],
        fill=(r, g, b, 200),
        outline=(255, 255, 255, 150),
        width=1
    )
    
    # Convert to RGBA for overlay
    img_pil = img_pil.convert('RGBA')
    img_with_overlay = Image.alpha_composite(img_pil, overlay)
    
    # Add text
    draw = ImageDraw.Draw(img_with_overlay)
    
    # Try to get a good font, otherwise use default
    try:
        title_font = ImageFont.truetype("arial.ttf", 40)
        badge_font = ImageFont.truetype("arial.ttf", 18)
        desc_font = ImageFont.truetype("arial.ttf", 20)
    except:
        title_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Add badge text
    badge_text_color = (0, 0, 0) if sum(ceremony_color) > 500 else (255, 255, 255)
    draw.text(
        (width - badge_width - 5, 15),
        badge_text,
        fill=badge_text_color,
        font=badge_font
    )
    
    # Add ceremony title and description
    title = ceremony_info.get('title', ceremony_type.title())
    description = ceremony_info.get('description', '')
    
    draw.text((30, height - 80), title, font=title_font, fill=(255, 255, 255))
    draw.text((30, height - 35), description, font=desc_font, fill=(220, 220, 220))
    
    # Convert back to RGB and then to OpenCV format
    img_result = img_with_overlay.convert('RGB')
    img_cv = cv2.cvtColor(np.array(img_result), cv2.COLOR_RGB2BGR)
    
    return img_cv

def create_template_images():
    """Create improved template images."""
    # First copy existing real/natural images to avoid losing them
    template_dir = "uploads/templates"
    ai_dir = os.path.join(template_dir, "ai")
    
    # Ensure output directories exist
    create_directory_if_not_exists(ai_dir)
    
    # Process each ceremony type
    for ceremony_type, info in ASSET_MAPPINGS.items():
        # Load the image
        image_path = os.path.join("attached_assets", info['image'])
        if not os.path.exists(image_path):
            print(f"Error: Source image not found: {image_path}")
            continue
            
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image: {image_path}")
            continue
            
        print(f"Processing {ceremony_type} ceremony...")
        
        # Generate variations
        for i in range(1, 6):
            # Create styled variation
            output_img = add_style_overlay(img.copy(), ceremony_type, i)
            if output_img is not None:
                # Save the variation
                output_path = os.path.join(ai_dir, f"{ceremony_type}_{i}.jpg")
                cv2.imwrite(output_path, output_img)
                print(f"Created variation {i}: {output_path}")
                
                # Also copy variation 1 as the main template
                if i == 1:
                    main_path = os.path.join(ai_dir, f"{ceremony_type}.jpg")
                    cv2.imwrite(main_path, output_img)
                    
                    # Update the main template in the templates directory
                    template_path = os.path.join(template_dir, f"{ceremony_type}_ai.jpg")
                    cv2.imwrite(template_path, output_img)
                    print(f"Updated main template: {template_path}")
    
    print("Finished creating improved template images.")

if __name__ == "__main__":
    create_template_images()