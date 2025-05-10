import os
import cv2
import numpy as np
import random
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

"""
Script to create enhanced AI template images for each ceremony type
with ceremony-specific visual effects and styles.
"""

# Define ceremony types and their characteristic colors/effects
CEREMONY_CONFIGS = {
    'haldi': {
        'color': (0, 215, 255),  # Yellow (BGR)
        'filter': 'yellow_tint',
        'text': 'Haldi Ceremony',
        'border_color': (0, 165, 255),  # Dark Yellow
        'description': 'A traditional pre-wedding ceremony filled with turmeric paste rituals'
    },
    'mehendi': {
        'color': (0, 128, 0),  # Green (BGR)
        'filter': 'green_tint',
        'text': 'Mehendi Celebration',
        'border_color': (0, 100, 0),  # Dark Green
        'description': 'Artistic henna application ceremony with intricate designs'
    },
    'sangeeth': {
        'color': (255, 100, 0),  # Blue-Orange (BGR)
        'filter': 'warm_tint',
        'text': 'Sangeeth Night',
        'border_color': (200, 80, 0),  # Dark Orange-Blue
        'description': 'Musical celebration with dance performances from family and friends'
    },
    'wedding': {
        'color': (0, 0, 200),  # Red (BGR)
        'filter': 'red_tint',
        'text': 'Wedding Ceremony',
        'border_color': (0, 0, 150),  # Dark Red
        'description': 'The main wedding ceremony with traditional rituals and vows'
    },
    'reception': {
        'color': (128, 0, 128),  # Purple (BGR)
        'filter': 'elegant',
        'text': 'Reception Celebration',
        'border_color': (100, 0, 100),  # Dark Purple
        'description': 'Formal gathering to celebrate the newlyweds with dinner and dancing'
    }
}

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def apply_filter(img, ceremony_type):
    """Apply ceremony-specific filter to the image."""
    if ceremony_type == 'haldi':
        # Yellow tint for Haldi
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        # Shift hue toward yellow (30 in HSV)
        h = cv2.add(h, 15)
        # Increase saturation
        s = cv2.add(s, 30)
        hsv = cv2.merge([h, s, v])
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    elif ceremony_type == 'mehendi':
        # Green tint for Mehendi with henna pattern overlay
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        # Shift hue toward green (60 in HSV)
        h = cv2.add(h, 30)
        hsv = cv2.merge([h, s, v])
        result = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        
        # Add vignette effect
        rows, cols = img.shape[:2]
        kernel_x = cv2.getGaussianKernel(cols, cols/4)
        kernel_y = cv2.getGaussianKernel(rows, rows/4)
        kernel = kernel_y * kernel_x.T
        mask = 255 * kernel / np.linalg.norm(kernel)
        mask = mask.astype(np.uint8)
        
        # Apply the vignette
        for i in range(3):
            result[:,:,i] = result[:,:,i] * mask / 255
            
        return result
    
    elif ceremony_type == 'sangeeth':
        # Vibrant warm colors for Sangeeth
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        # Increase saturation for vibrant colors
        s = cv2.add(s, 40)
        # Increase brightness
        v = cv2.add(v, 20)
        hsv = cv2.merge([h, s, v])
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    elif ceremony_type == 'wedding':
        # Red/warm tint for Wedding
        b, g, r = cv2.split(img)
        # Increase red channel
        r = cv2.add(r, 30)
        # Slightly decrease blue for warmer look
        b = cv2.subtract(b, 10)
        return cv2.merge([b, g, r])
    
    elif ceremony_type == 'reception':
        # Elegant look with slight purple tint for Reception
        b, g, r = cv2.split(img)
        # Increase blue and red for purple tint
        b = cv2.add(b, 15)
        r = cv2.add(r, 15)
        result = cv2.merge([b, g, r])
        
        # Add subtle glow
        blur = cv2.GaussianBlur(result, (0, 0), 10)
        result = cv2.addWeighted(result, 0.8, blur, 0.2, 0)
        
        return result
    
    # Default case - return original
    return img

def add_decorative_border(img, ceremony_type):
    """Add a decorative border based on ceremony type."""
    config = CEREMONY_CONFIGS.get(ceremony_type)
    border_color = config.get('border_color', (255, 255, 255))
    
    # Add simple border
    border_size = 20
    bordered_img = cv2.copyMakeBorder(
        img, 
        border_size, border_size, border_size, border_size,
        cv2.BORDER_CONSTANT,
        value=border_color
    )
    
    # For certain ceremonies, add specific decorative elements
    if ceremony_type == 'mehendi':
        # Add henna-inspired corners
        h, w = bordered_img.shape[:2]
        overlay = bordered_img.copy()
        
        # Draw corner patterns
        cv2.circle(overlay, (border_size*2, border_size*2), border_size, (0, 200, 0), -1)
        cv2.circle(overlay, (w-border_size*2, border_size*2), border_size, (0, 200, 0), -1)
        cv2.circle(overlay, (border_size*2, h-border_size*2), border_size, (0, 200, 0), -1)
        cv2.circle(overlay, (w-border_size*2, h-border_size*2), border_size, (0, 200, 0), -1)
        
        # Apply the overlay with transparency
        bordered_img = cv2.addWeighted(overlay, 0.3, bordered_img, 0.7, 0)
    
    elif ceremony_type == 'haldi':
        # Add yellow flower-like patterns
        h, w = bordered_img.shape[:2]
        for _ in range(8):
            x = random.randint(border_size, w-border_size)
            y = random.randint(border_size, h-border_size)
            if random.random() > 0.5:  # Only draw some of them on the border
                if not (border_size < x < w-border_size and border_size < y < h-border_size):
                    cv2.circle(bordered_img, (x, y), 5, (0, 255, 255), -1)
    
    return bordered_img

def add_text_overlay(img, ceremony_type):
    """Add ceremony-specific text overlay to the image."""
    config = CEREMONY_CONFIGS.get(ceremony_type)
    text = config.get('text', ceremony_type.capitalize())
    description = config.get('description', '')
    
    # Convert to PIL for better text handling
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    
    # Use a default font if custom font is not available
    try:
        font_large = ImageFont.truetype("arial.ttf", 40)
        font_small = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Add semi-transparent background for text
    width, height = img_pil.size
    overlay = Image.new('RGBA', img_pil.size, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    draw_overlay.rectangle([(0, height-80), (width, height)], fill=(0, 0, 0, 128))
    img_pil.paste(Image.alpha_composite(Image.new('RGBA', img_pil.size, (0, 0, 0, 0)), overlay).convert('RGB'), (0, 0), mask=0)
    
    # Draw text
    draw = ImageDraw.Draw(img_pil)
    draw.text((20, height-70), text, font=font_large, fill=(255, 255, 255))
    draw.text((20, height-30), description, font=font_small, fill=(200, 200, 200))
    
    # Convert back to OpenCV format
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

def create_template_variations(base_img, ceremony_type, output_dir, count=5):
    """Create multiple variations of a template with different effects."""
    for i in range(1, count + 1):
        # Apply different variations for each index
        img_copy = base_img.copy()
        
        # Apply ceremony-specific filter
        img_filtered = apply_filter(img_copy, ceremony_type)
        
        # Apply additional effects based on variation number
        if i == 1:
            # Standard filter only
            img_result = img_filtered
        elif i == 2:
            # Higher contrast
            img_pil = Image.fromarray(cv2.cvtColor(img_filtered, cv2.COLOR_BGR2RGB))
            enhancer = ImageEnhance.Contrast(img_pil)
            img_pil = enhancer.enhance(1.3)
            img_result = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        elif i == 3:
            # Warmer tone
            b, g, r = cv2.split(img_filtered)
            r = cv2.add(r, 20)
            b = cv2.subtract(b, 10)
            img_result = cv2.merge([b, g, r])
        elif i == 4:
            # Slightly blurred/dreamy
            img_pil = Image.fromarray(cv2.cvtColor(img_filtered, cv2.COLOR_BGR2RGB))
            img_pil = img_pil.filter(ImageFilter.GaussianBlur(radius=1))
            img_result = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        elif i == 5:
            # Higher saturation
            img_pil = Image.fromarray(cv2.cvtColor(img_filtered, cv2.COLOR_BGR2RGB))
            enhancer = ImageEnhance.Color(img_pil)
            img_pil = enhancer.enhance(1.5)
            img_result = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        
        # Add decorative border
        img_result = add_decorative_border(img_result, ceremony_type)
        
        # Add text overlay for variations
        img_result = add_text_overlay(img_result, ceremony_type)
        
        # Save the result
        output_path = os.path.join(output_dir, f"{ceremony_type}_{i}.jpg")
        cv2.imwrite(output_path, img_result)
        print(f"Created template variation: {output_path}")
        
        # Also save a copy as the main file for first variation
        if i == 1:
            main_path = os.path.join(output_dir, f"{ceremony_type}.jpg")
            cv2.imwrite(main_path, img_result)
            print(f"Created main template: {main_path}")

def create_base_images(output_dir):
    """Create base images for each ceremony type if they don't exist."""
    for ceremony_type, config in CEREMONY_CONFIGS.items():
        # Check if we already have base images in the attached_assets folder
        potential_paths = [
            f"attached_assets/{ceremony_type}.jpg",
            f"attached_assets/{ceremony_type}_template.jpg",
            f"attached_assets/{ceremony_type} dress.jpg",
            f"attached_assets/{ceremony_type}_dress.jpg",
        ]
        
        base_img = None
        for path in potential_paths:
            if os.path.exists(path):
                base_img = cv2.imread(path)
                print(f"Using existing image as base: {path}")
                break
        
        # If no existing image, create a placeholder with the ceremony color
        if base_img is None:
            print(f"No existing image found for {ceremony_type}, creating placeholder")
            base_img = np.ones((768, 1024, 3), dtype=np.uint8) * 255  # White background
            
            # Fill with ceremony color
            color = config.get('color', (255, 255, 255))
            base_img[:] = color
            
            # Add text
            cv2.putText(
                base_img,
                f"{ceremony_type.capitalize()} Template",
                (int(1024/2) - 150, int(768/2)),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.5,
                (255, 255, 255),
                3
            )
        
        # Create variations
        create_template_variations(base_img, ceremony_type, output_dir)

def main():
    # Define output directory for AI templates
    output_dir = "uploads/templates/ai"
    create_directory_if_not_exists(output_dir)
    
    # Create template variations
    create_base_images(output_dir)
    
    print("All template variations created successfully!")

if __name__ == "__main__":
    main()