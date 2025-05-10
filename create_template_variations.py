import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

"""
Create multiple variations of attached assets for different ceremonies.
This approach avoids the need to download new images from external sources.
"""

# Define ceremony types and their styling properties
CEREMONY_STYLES = {
    'haldi': {
        'title': 'Haldi Ceremony',
        'description': 'Traditional pre-wedding turmeric ceremony',
        'color': (255, 215, 0),  # Yellow
        'tint_factor': 0.15
    },
    'mehendi': {
        'title': 'Mehendi Celebration',
        'description': 'Artistic henna application ceremony',
        'color': (76, 175, 80),  # Green
        'tint_factor': 0.10
    },
    'sangeeth': {
        'title': 'Sangeeth Night',
        'description': 'Musical celebration with dance performances',
        'color': (63, 81, 181),  # Indigo
        'tint_factor': 0.12
    },
    'wedding': {
        'title': 'Wedding Ceremony',
        'description': 'Traditional wedding rituals and vows',
        'color': (211, 47, 47),  # Red
        'tint_factor': 0.10
    },
    'reception': {
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

def process_image(img, ceremony_type, style_num):
    """Apply different style effects based on ceremony type and style number."""
    ceremony_info = CEREMONY_STYLES.get(ceremony_type, {})
    
    # Convert to PIL for editing
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    
    # Resize to maintain aspect ratio while ensuring consistent dimensions
    target_width = 1024
    target_height = int(target_width * (img_pil.height / img_pil.width))
    img_pil = img_pil.resize((target_width, target_height), Image.LANCZOS)
    
    # Apply different effects based on style number
    if style_num == 1:  # Standard with ceremony tint
        # Apply ceremony-specific color tint
        ceremony_color = ceremony_info.get('color', (255, 255, 255))
        tint_factor = ceremony_info.get('tint_factor', 0.1)
        tint_layer = Image.new('RGB', img_pil.size, ceremony_color)
        img_pil = Image.blend(img_pil, tint_layer, tint_factor)
        
        # Slight enhancement
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.1)
        
    elif style_num == 2:  # Vintage effect
        # Convert to sepia tone
        sepia_effect = Image.new('RGB', img_pil.size, (112, 66, 20))
        img_pil = Image.blend(img_pil, sepia_effect, 0.25)
        
        # Add slight vignette
        # Create circular mask
        mask = Image.new('L', img_pil.size, 255)
        draw = ImageDraw.Draw(mask)
        width, height = img_pil.size
        
        # Draw rectangle with rounded corners (vignette effect)
        for i in range(100):
            opacity = int(120 * i / 100)  # Edge darkness
            draw.rectangle(
                [(i, i), (width-i, height-i)],
                outline=255-opacity
            )
        
        # Apply the mask
        img_pil.putalpha(mask)
        img_pil = img_pil.convert('RGB')  # Convert back to RGB
        
    elif style_num == 3:  # Vibrant
        # Increase saturation
        enhancer = ImageEnhance.Color(img_pil)
        img_pil = enhancer.enhance(1.5)
        
        # Increase contrast
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.3)
        
    elif style_num == 4:  # Soft Glow
        # Add soft blur
        img_pil = img_pil.filter(ImageFilter.GaussianBlur(radius=2))
        
        # Overlay original with reduced opacity for glow effect
        original = Image.fromarray(img_rgb).resize((target_width, target_height), Image.LANCZOS)
        img_pil = Image.blend(img_pil, original, 0.7)
        
        # Increase brightness slightly
        enhancer = ImageEnhance.Brightness(img_pil)
        img_pil = enhancer.enhance(1.1)
        
    elif style_num == 5:  # Dramatic
        # High contrast
        enhancer = ImageEnhance.Contrast(img_pil)
        img_pil = enhancer.enhance(1.4)
        
        # Reduce brightness slightly
        enhancer = ImageEnhance.Brightness(img_pil)
        img_pil = enhancer.enhance(0.95)
        
        # Add vignette effect
        # Create circular mask
        mask = Image.new('L', img_pil.size, 255)
        draw = ImageDraw.Draw(mask)
        width, height = img_pil.size
        
        # Draw radial gradient
        for i in range(min(width, height)//3):
            opacity = int(150 * i / (min(width, height)//3))  # Edge darkness
            draw.ellipse(
                [(i, i), (width-i, height-i)],
                outline=255-opacity
            )
        
        # Apply the mask
        img_pil.putalpha(mask)
        img_pil = img_pil.convert('RGB')  # Convert back to RGB
    
    # Add title and description overlay
    width, height = img_pil.size
    overlay = Image.new('RGBA', img_pil.size, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    
    # Add gradient at bottom for text background
    for i in range(100):
        opacity = int(180 * i / 100)  # Gradient from 0 to 180 opacity
        draw_overlay.rectangle(
            [(0, height - 100 + i), (width, height - 99 + i)],
            fill=(0, 0, 0, opacity)
        )
    
    # Add style badge in top corner
    style_names = ["Ceremony Tint", "Vintage", "Vibrant", "Soft Glow", "Dramatic"]
    badge_text = f"Style {style_num}: {style_names[style_num-1]}"
    
    # Create style badge
    badge_width = len(badge_text) * 7 + 20
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
    
    # Try to get a suitable font
    try:
        title_font = ImageFont.truetype("arial.ttf", 40)
        badge_font = ImageFont.truetype("arial.ttf", 18)
        desc_font = ImageFont.truetype("arial.ttf", 20)
    except:
        # Use default font if custom font fails
        title_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Calculate text color based on badge background brightness
    badge_text_color = (0, 0, 0) if sum(ceremony_color) > 500 else (255, 255, 255)
    
    # Add badge text
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

def create_ceremony_variations():
    """Create variations of templates for each ceremony type."""
    # Source images from attached assets
    source_images = [
        "attached_assets/full dress.jpg",
        "attached_assets/halfhand.jpg",
        "attached_assets/jewellary.jpg",
        "attached_assets/voni dress.jpg",
        "attached_assets/weeding saree.jpg"
    ]
    
    # Define base output directory
    base_dir = "uploads/templates/pinterest"
    create_directory_if_not_exists(base_dir)
    
    # Create ceremony-specific directories
    for ceremony_type in CEREMONY_STYLES.keys():
        ceremony_dir = os.path.join(base_dir, ceremony_type)
        create_directory_if_not_exists(ceremony_dir)
    
    # Process each source image for each ceremony type
    for i, source_path in enumerate(source_images):
        if not os.path.exists(source_path):
            print(f"Warning: Source image not found: {source_path}")
            continue
        
        img = cv2.imread(source_path)
        if img is None:
            print(f"Warning: Could not read image: {source_path}")
            continue
        
        # Assign each source image to a different ceremony for variety
        ceremony_types = list(CEREMONY_STYLES.keys())
        ceremony_type = ceremony_types[i % len(ceremony_types)]
        
        print(f"Processing {source_path} for {ceremony_type} ceremony...")
        
        # Create variations for each style
        for style_num in range(1, 6):
            processed_img = process_image(img.copy(), ceremony_type, style_num)
            output_path = os.path.join(base_dir, ceremony_type, f"{ceremony_type}_{style_num}.jpg")
            
            cv2.imwrite(output_path, processed_img)
            print(f"Created {ceremony_type} style {style_num}: {output_path}")
            
            # Also make first style the main template
            if style_num == 1:
                main_path = os.path.join(base_dir, ceremony_type, f"{ceremony_type}.jpg")
                cv2.imwrite(main_path, processed_img)
                print(f"Created main template: {main_path}")
                
                # Update the main ceremony template in templates directory
                template_path = os.path.join("uploads/templates", f"{ceremony_type}_pinterest.jpg")
                cv2.imwrite(template_path, processed_img)
                print(f"Updated main template: {template_path}")

if __name__ == "__main__":
    create_ceremony_variations()