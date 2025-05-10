import os
import shutil
import cv2
import numpy as np

"""
Script to organize the attached assets into ceremony-specific template folders
"""

# Map attached assets to ceremony types
IMAGE_MAPPINGS = {
    'full dress.jpg': 'wedding',
    'halfhand.jpg': 'mehendi',
    'jewellary.jpg': 'reception',
    'voni dress.jpg': 'sangeeth',
    'weeding saree.jpg': 'haldi'
}

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def main():
    # Define output directories
    templates_dir = "uploads/templates"
    create_directory_if_not_exists(templates_dir)
    
    # Create subdirectories for each template type
    template_types = ['real', 'natural', 'ai']
    for template_type in template_types:
        create_directory_if_not_exists(os.path.join(templates_dir, template_type))
    
    # Process each attached asset
    for image_name, ceremony_type in IMAGE_MAPPINGS.items():
        source_path = os.path.join("attached_assets", image_name)
        
        # Make sure the source file exists
        if not os.path.exists(source_path):
            print(f"Warning: Source file {source_path} not found")
            continue
            
        # Read the image
        img = cv2.imread(source_path)
        if img is None:
            print(f"Warning: Could not read image {source_path}")
            continue
            
        # Copy to real templates
        real_path = os.path.join(templates_dir, "real", f"{ceremony_type}.jpg")
        cv2.imwrite(real_path, img)
        print(f"Copied {image_name} to {real_path}")
        
        # Create a "natural" version with slight modifications
        natural_img = img.copy()
        
        # Apply a slight filter based on ceremony type
        if ceremony_type == 'haldi':
            # Yellow tint for Haldi
            b, g, r = cv2.split(natural_img)
            r = cv2.add(r, 30)
            g = cv2.add(g, 30)
            natural_img = cv2.merge([b, g, r])
        elif ceremony_type == 'mehendi':
            # Green tint for Mehendi
            b, g, r = cv2.split(natural_img)
            g = cv2.add(g, 30)
            natural_img = cv2.merge([b, g, r])
        elif ceremony_type == 'wedding':
            # Red tint for Wedding
            b, g, r = cv2.split(natural_img)
            r = cv2.add(r, 30)
            natural_img = cv2.merge([b, g, r])
            
        natural_path = os.path.join(templates_dir, "natural", f"{ceremony_type}.jpg")
        cv2.imwrite(natural_path, natural_img)
        print(f"Created natural version at {natural_path}")
        
        # Also copy to the main templates directory
        main_real_path = os.path.join(templates_dir, f"{ceremony_type}_real.jpg")
        main_natural_path = os.path.join(templates_dir, f"{ceremony_type}_natural.jpg")
        
        cv2.imwrite(main_real_path, img)
        cv2.imwrite(main_natural_path, natural_img)
        
        print(f"Copied to main directory as {main_real_path} and {main_natural_path}")
        
    print("Asset organization complete")

if __name__ == "__main__":
    main()