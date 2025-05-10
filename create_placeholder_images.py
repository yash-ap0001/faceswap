"""Create placeholder images for the static folder"""
import os
import cv2
import numpy as np

def create_placeholder_images():
    """Create placeholder images for use in the template preview."""
    static_dir = 'static'
    os.makedirs(static_dir, exist_ok=True)
    
    # Template types and their colors (BGR format)
    template_types = {
        'real': (0, 0, 180),     # Dark red
        'natural': (120, 180, 0), # Blue-green
        'ai': (180, 0, 180)      # Purple
    }
    
    for template_type, color in template_types.items():
        # Create a placeholder image
        img_height, img_width = 768, 512
        img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
        
        # Set background color
        img[:] = color
        
        # Add text
        font = cv2.FONT_HERSHEY_SIMPLEX
        text = f"{template_type.capitalize()} Template"
        text_size = cv2.getTextSize(text, font, 1.5, 2)[0]
        text_x = (img_width - text_size[0]) // 2
        text_y = (img_height + text_size[1]) // 2
        
        # Add a dark overlay for better text visibility
        cv2.rectangle(img, 
                    (text_x - 20, text_y - text_size[1] - 20),
                    (text_x + text_size[0] + 20, text_y + 20),
                    (0, 0, 0, 128), -1)
        
        cv2.putText(img, text, (text_x, text_y), font, 1.5, (255, 255, 255), 2)
        
        # Save the placeholder image
        output_path = os.path.join(static_dir, f"placeholder_{template_type}.jpg")
        cv2.imwrite(output_path, img)

if __name__ == "__main__":
    create_placeholder_images()
    print("Placeholder images created successfully in the static directory!")