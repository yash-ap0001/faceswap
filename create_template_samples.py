"""
Script to create sample template images for each ceremony type.
This will organize images from the attached_assets folder into the template structure.
"""

import os
import shutil
import cv2
import numpy as np

def create_template_samples():
    """Create sample templates for each ceremony type."""
    # Create template directories
    template_dir = 'uploads/templates'
    os.makedirs(template_dir, exist_ok=True)
    
    for template_type in ['real', 'natural', 'ai']:
        type_dir = os.path.join(template_dir, template_type)
        os.makedirs(type_dir, exist_ok=True)
    
    # Map attached assets to template types and ceremonies
    asset_mapping = {
        'real': {
            'haldi': ['attached_assets/weeding saree.jpg'],
            'mehendi': ['attached_assets/halfhand.jpg'],
            'sangeeth': ['attached_assets/jewellary.jpg'],
            'wedding': ['attached_assets/voni dress.jpg', 'attached_assets/full dress.jpg'],
            'reception': ['attached_assets/jewellary.jpg']
        }
    }
    
    # Process all mapped assets
    for template_type, ceremonies in asset_mapping.items():
        type_dir = os.path.join(template_dir, template_type)
        
        for ceremony, assets in ceremonies.items():
            # Each ceremony should have up to 5 templates
            max_templates = min(5, len(assets))
            
            for i in range(max_templates):
                asset_path = assets[i % len(assets)]  # Loop through available assets if not enough
                
                if os.path.exists(asset_path):
                    # Copy to type-specific directory
                    output_path = os.path.join(type_dir, f"{ceremony}_{i+1}.jpg")
                    shutil.copy(asset_path, output_path)
                    
                    # Also create the combined template filename
                    combined_path = os.path.join(template_dir, f"{ceremony}_{template_type}.jpg")
                    if not os.path.exists(combined_path):
                        shutil.copy(asset_path, combined_path)

    # Create placeholder images for missing templates
    create_placeholder_templates(template_dir)

def create_placeholder_templates(template_dir):
    """Create placeholder images for ceremonies that don't have templates."""
    ceremony_types = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    template_types = ['natural', 'ai']
    
    # Ceremony-specific colors (BGR format)
    ceremony_colors = {
        'haldi': (0, 215, 255),     # Yellow
        'mehendi': (0, 128, 0),     # Green
        'sangeeth': (255, 100, 0),  # Blue with orange tint
        'wedding': (0, 0, 255),     # Red
        'reception': (128, 0, 128)  # Purple
    }
    
    for ceremony in ceremony_types:
        for template_type in template_types:
            # Check if we need to create this template
            combined_path = os.path.join(template_dir, f"{ceremony}_{template_type}.jpg")
            type_dir = os.path.join(template_dir, template_type)
            
            if not os.path.exists(combined_path):
                # Create a placeholder image with ceremony-specific color
                img_height, img_width = 768, 512
                img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
                
                # Set background color
                img[:] = ceremony_colors.get(ceremony, (100, 100, 100))
                
                # Add text
                font = cv2.FONT_HERSHEY_SIMPLEX
                text = f"{ceremony.capitalize()} {template_type.capitalize()}"
                text_size = cv2.getTextSize(text, font, 1, 2)[0]
                text_x = (img_width - text_size[0]) // 2
                text_y = (img_height + text_size[1]) // 2
                
                # Add a dark overlay for better text visibility
                cv2.rectangle(img, 
                             (text_x - 10, text_y - text_size[1] - 10),
                             (text_x + text_size[0] + 10, text_y + 10),
                             (0, 0, 0, 128), -1)
                
                cv2.putText(img, text, (text_x, text_y), font, 1, (255, 255, 255), 2)
                
                # Save the placeholder image
                cv2.imwrite(combined_path, img)
                
                # Also save in type-specific directory (5 variants)
                for i in range(1, 6):
                    subtype_path = os.path.join(type_dir, f"{ceremony}_{i}.jpg")
                    cv2.imwrite(subtype_path, img)
            
            # Ensure there are 5 variants in the type-specific directory
            for i in range(1, 6):
                subtype_path = os.path.join(type_dir, f"{ceremony}_{i}.jpg")
                if not os.path.exists(subtype_path):
                    # If the combined template exists, copy it
                    if os.path.exists(combined_path):
                        shutil.copy(combined_path, subtype_path)
                    else:
                        # Create a unique placeholder
                        img_height, img_width = 768, 512
                        img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
                        img[:] = ceremony_colors.get(ceremony, (100, 100, 100))
                        
                        # Add text with variant number
                        font = cv2.FONT_HERSHEY_SIMPLEX
                        text = f"{ceremony.capitalize()} {template_type.capitalize()} #{i}"
                        text_size = cv2.getTextSize(text, font, 1, 2)[0]
                        text_x = (img_width - text_size[0]) // 2
                        text_y = (img_height + text_size[1]) // 2
                        
                        # Add a dark overlay for better text visibility
                        cv2.rectangle(img, 
                                    (text_x - 10, text_y - text_size[1] - 10),
                                    (text_x + text_size[0] + 10, text_y + 10),
                                    (0, 0, 0, 128), -1)
                        
                        cv2.putText(img, text, (text_x, text_y), font, 1, (255, 255, 255), 2)
                        cv2.imwrite(subtype_path, img)

if __name__ == "__main__":
    create_template_samples()
    print("Template samples created successfully!")