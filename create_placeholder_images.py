"""Create placeholder images for the static folder"""
import os
import cv2
import numpy as np

def create_placeholder_images():
    """Create placeholder images for use in the template preview."""
    static_dir = 'static'
    os.makedirs(static_dir, exist_ok=True)
    
    # Create the main placeholder image first
    create_main_placeholder(static_dir)
    
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

def create_main_placeholder(output_dir):
    """Create a main placeholder image for error handling"""
    # Create a placeholder image with dark purple background
    img_height, img_width = 800, 600
    img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Set background color to dark purple (BGR format)
    dark_purple = (68, 20, 43)  # #2b1744 in BGR
    img[:] = dark_purple
    
    # Add a decorative frame
    frame_thickness = 10
    cv2.rectangle(img, 
                 (frame_thickness, frame_thickness), 
                 (img_width - frame_thickness, img_height - frame_thickness),
                 (200, 200, 200), 2)
    
    # Add text
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # Main text
    main_text = "Image Not Available"
    main_text_size = cv2.getTextSize(main_text, font, 1.5, 2)[0]
    main_text_x = (img_width - main_text_size[0]) // 2
    main_text_y = (img_height - main_text_size[1]) // 2
    
    # Subtitle
    subtitle = "Please select a different template"
    subtitle_size = cv2.getTextSize(subtitle, font, 0.8, 1)[0]
    subtitle_x = (img_width - subtitle_size[0]) // 2
    subtitle_y = main_text_y + main_text_size[1] + 30
    
    # Add a semi-transparent overlay for better text visibility
    overlay = img.copy()
    cv2.rectangle(overlay, 
                (main_text_x - 40, main_text_y - main_text_size[1] - 30),
                (max(main_text_x + main_text_size[0], subtitle_x + subtitle_size[0]) + 40, 
                 subtitle_y + 20),
                (0, 0, 0), -1)
    
    # Apply the overlay with transparency
    alpha = 0.6
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
    
    # Draw texts
    cv2.putText(img, main_text, (main_text_x, main_text_y), font, 1.5, (255, 255, 255), 2)
    cv2.putText(img, subtitle, (subtitle_x, subtitle_y), font, 0.8, (200, 200, 200), 1)
    
    # Add the VOW BRIDE watermark
    watermark = "VOW BRIDE"
    watermark_size = cv2.getTextSize(watermark, font, 1.0, 1)[0]
    watermark_x = (img_width - watermark_size[0]) // 2
    watermark_y = img_height - 30
    
    cv2.putText(img, watermark, (watermark_x, watermark_y), font, 1.0, (100, 100, 100), 1)
    
    # Save the placeholder image
    output_path = os.path.join(output_dir, "placeholder.jpg")
    cv2.imwrite(output_path, img)
    print(f"Created main placeholder image: {output_path}")

if __name__ == "__main__":
    create_placeholder_images()
    print("Placeholder images created successfully in the static directory!")