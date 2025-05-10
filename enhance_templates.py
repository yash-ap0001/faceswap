"""
Enhance existing template images with color adjustments and effects
specific to each ceremony type.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import shutil

def create_enhanced_templates():
    """Create enhanced templates for each ceremony type."""
    print("Enhancing template images...")
    
    # Source images from attached assets
    source_images = {
        'haldi': 'attached_assets/weeding saree.jpg',
        'mehendi': 'attached_assets/halfhand.jpg',
        'sangeeth': 'attached_assets/jewellary.jpg',
        'wedding': 'attached_assets/voni dress.jpg',
        'reception': 'attached_assets/full dress.jpg'
    }
    
    # Ceremony-specific enhancements
    enhancements = {
        'haldi': {'color': (0, 215, 255), 'text': 'Haldi Ceremony'},  # Yellow
        'mehendi': {'color': (0, 128, 0), 'text': 'Mehendi Function'},  # Green
        'sangeeth': {'color': (255, 100, 0), 'text': 'Sangeeth Dance'},  # Blue-orange
        'wedding': {'color': (0, 0, 255), 'text': 'Wedding Day'},  # Red
        'reception': {'color': (128, 0, 128), 'text': 'Reception Look'}  # Purple
    }
    
    # Make sure AI template directory exists
    ai_dir = os.path.join('uploads', 'templates', 'ai')
    os.makedirs(ai_dir, exist_ok=True)
    
    # Process each ceremony type
    for ceremony, source_path in source_images.items():
        if os.path.exists(source_path):
            print(f"Enhancing template for {ceremony}...")
            
            # Load the source image
            img = cv2.imread(source_path)
            
            if img is None:
                print(f"Error: Could not read image {source_path}")
                continue
            
            # Get the enhancement settings
            color = enhancements[ceremony]['color']
            text = enhancements[ceremony]['text']
            
            # Apply a color filter overlay
            overlay = img.copy()
            h, w, _ = overlay.shape
            color_overlay = np.full((h, w, 3), color, dtype=np.uint8)
            
            # Blend the original image with the color overlay
            enhanced = cv2.addWeighted(img, 0.7, color_overlay, 0.3, 0)
            
            # Add text
            font = cv2.FONT_HERSHEY_DUPLEX
            text_size = cv2.getTextSize(text, font, 1.2, 2)[0]
            text_x = (w - text_size[0]) // 2
            text_y = h - 30
            
            # Add a dark overlay for better text visibility
            cv2.rectangle(enhanced, 
                        (text_x - 10, text_y - text_size[1] - 10),
                        (text_x + text_size[0] + 10, text_y + 10),
                        (0, 0, 0, 128), -1)
            
            cv2.putText(enhanced, text, (text_x, text_y), font, 1.2, (255, 255, 255), 2)
            
            # Apply a subtle vignette effect
            mask = np.zeros((h, w), dtype=np.uint8)
            center = (w // 2, h // 2)
            radius = min(w, h) // 2
            cv2.circle(mask, center, radius, 255, -1)
            mask = cv2.GaussianBlur(mask, (51, 51), 0)
            
            # Normalize the mask
            mask = mask.astype(float) / 255
            mask = np.stack([mask, mask, mask], axis=2)
            
            # Apply vignette
            enhanced = enhanced * mask + cv2.multiply(enhanced, 0.5) * (1 - mask)
            enhanced = np.clip(enhanced, 0, 255).astype(np.uint8)
            
            # Save in AI directory
            ai_main_path = os.path.join(ai_dir, f"{ceremony}.jpg")
            ai_indexed_path = os.path.join(ai_dir, f"{ceremony}_1.jpg")
            ai_template_path = os.path.join('uploads', 'templates', f"{ceremony}_ai.jpg")
            
            cv2.imwrite(ai_main_path, enhanced)
            cv2.imwrite(ai_indexed_path, enhanced)
            cv2.imwrite(ai_template_path, enhanced)
            
            print(f"Created enhanced templates for {ceremony}")
            
            # Create duplicate versions with variations for templates 2-5
            for i in range(2, 6):
                # For each variation, apply a different effect
                variation = enhanced.copy()
                
                if i == 2:
                    # Increase brightness
                    variation = cv2.convertScaleAbs(variation, alpha=1.2, beta=10)
                elif i == 3:
                    # Increase contrast
                    variation = cv2.convertScaleAbs(variation, alpha=1.3, beta=0)
                elif i == 4:
                    # Apply sepia tone
                    sepia_kernel = np.array([[0.272, 0.534, 0.131],
                                            [0.349, 0.686, 0.168],
                                            [0.393, 0.769, 0.189]])
                    variation = cv2.transform(variation, sepia_kernel)
                elif i == 5:
                    # Apply blur and sharpen
                    blurred = cv2.GaussianBlur(variation, (0, 0), 3)
                    variation = cv2.addWeighted(variation, 1.5, blurred, -0.5, 0)
                
                # Save the variation
                variation_path = os.path.join(ai_dir, f"{ceremony}_{i}.jpg")
                cv2.imwrite(variation_path, variation)
                print(f"Created variation {i} for {ceremony}")
        else:
            print(f"Warning: Source image {source_path} not found. Skipping {ceremony}.")

if __name__ == "__main__":
    create_enhanced_templates()
    print("Template enhancement complete!")