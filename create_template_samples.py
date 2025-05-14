"""
Script to create sample template images for each ceremony type.
This will organize images from the attached_assets folder into the template structure.
"""

import os
import shutil
from pathlib import Path
import cv2
import numpy as np

def create_template_samples():
    """Create sample templates for each ceremony type."""
    # Define ceremony types
    ceremony_types = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    
    # Create base directories for templates
    base_dir = Path("static/images/templates")
    base_dir.mkdir(exist_ok=True, parents=True)
    
    for ceremony in ceremony_types:
        ceremony_dir = base_dir / ceremony
        ceremony_dir.mkdir(exist_ok=True)
        
        # Check if the directory already has templates
        existing_templates = list(ceremony_dir.glob('*.jpg'))
        if existing_templates:
            print(f"Directory {ceremony_dir} already has {len(existing_templates)} templates. Skipping.")
            continue
            
        print(f"Creating templates for {ceremony}...")
        
        # Look for source images in attached_assets
        source_dir = Path("attached_assets")
        source_images = list(source_dir.glob('*.jpg'))
        
        if not source_images:
            # Create basic placeholder instead
            print(f"No source images found for {ceremony}. Creating placeholders.")
            create_placeholder_templates(ceremony_dir)
            continue
            
        # Use the first 6 images or fewer if not enough images
        count = min(6, len(source_images))
        for i in range(count):
            source_path = source_images[i]
            target_path = ceremony_dir / f"{i+1}.jpg"
            
            # Copy the image
            try:
                shutil.copy(source_path, target_path)
                print(f"  Copied {source_path.name} to {target_path}")
            except Exception as e:
                print(f"  Error copying {source_path.name}: {str(e)}")
                # Create a placeholder instead
                create_placeholder_image(target_path, ceremony)

def create_placeholder_templates(template_dir):
    """Create placeholder images for ceremonies that don't have templates."""
    ceremony = template_dir.name
    for i in range(1, 7):
        target_path = template_dir / f"{i}.jpg"
        create_placeholder_image(target_path, ceremony)
        print(f"  Created placeholder template {i} for {ceremony}")

def create_placeholder_image(path, ceremony_type):
    """Create a custom placeholder image for the specified ceremony type."""
    # Define colors for different ceremonies
    colors = {
        'haldi': (0, 165, 255),  # Yellow
        'mehendi': (0, 128, 0),   # Green
        'sangeeth': (128, 0, 128), # Purple
        'wedding': (0, 0, 255),    # Red
        'reception': (255, 0, 0)   # Blue
    }
    
    # Get color for this ceremony (default to gray if not found)
    color = colors.get(ceremony_type, (128, 128, 128))
    
    # Create a base image (640x480)
    img = np.ones((480, 640, 3), dtype=np.uint8) * 255
    
    # Add a colored border
    cv2.rectangle(img, (10, 10), (630, 470), color, 5)
    
    # Add ceremony name
    cv2.putText(img, f"{ceremony_type.upper()} TEMPLATE", (120, 240), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    
    # Add template number from filename
    template_num = path.stem
    cv2.putText(img, f"Template #{template_num}", (250, 300), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    
    # Save the image
    cv2.imwrite(str(path), img)

if __name__ == "__main__":
    create_template_samples()