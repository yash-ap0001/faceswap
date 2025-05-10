import os
import cv2
import numpy as np

def create_bridal_template(style, output_dir):
    """
    Create a template image for the specified bridal style.
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Set image dimensions
    img_height, img_width = 1024, 768
    
    # Create a base image with color based on the style
    template_img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Set background color and add decorative elements based on style
    if style == 'haldi':
        # Yellow/gold for Haldi
        template_img[:] = (50, 215, 255)  # BGR for yellow
        
        # Add decorative elements - marigold-like flowers at the top
        for i in range(10):
            center_x = int(img_width * (i + 0.5) / 10)
            center_y = 50
            # Draw marigold flower
            cv2.circle(template_img, (center_x, center_y), 40, (0, 165, 255), -1)  # Orange center
            for j in range(12):
                angle = j * 30
                rx = int(40 * np.cos(np.radians(angle)))
                ry = int(40 * np.sin(np.radians(angle)))
                cv2.circle(template_img, (center_x + rx, center_y + ry), 20, (0, 215, 255), -1)  # Yellow petals
                
    elif style == 'mehendi':
        # Green for Mehendi
        template_img[:] = (50, 128, 50)  # BGR for green
        
        # Add decorative henna-like patterns on the sides
        for i in range(5):
            y_pos = int(img_height * (i + 0.5) / 5)
            # Left side pattern
            cv2.circle(template_img, (50, y_pos), 30, (50, 200, 50), -1)
            cv2.circle(template_img, (50, y_pos), 20, (50, 128, 50), -1)
            cv2.circle(template_img, (50, y_pos), 10, (50, 250, 50), -1)
            
            # Right side pattern
            cv2.circle(template_img, (img_width - 50, y_pos), 30, (50, 200, 50), -1)
            cv2.circle(template_img, (img_width - 50, y_pos), 20, (50, 128, 50), -1)
            cv2.circle(template_img, (img_width - 50, y_pos), 10, (50, 250, 50), -1)
            
    elif style == 'wedding':
        # Red for Wedding
        template_img[:] = (50, 50, 200)  # BGR for red
        
        # Add mandap-like decorative elements at the top
        cv2.rectangle(template_img, (img_width//4, 20), (3*img_width//4, 100), (50, 100, 200), -1)
        for i in range(5):
            x_pos = img_width//4 + i * img_width//10
            cv2.line(template_img, (x_pos, 100), (x_pos, 150), (50, 150, 200), 5)
            
    elif style == 'reception':
        # Maroon/purple for Reception
        template_img[:] = (128, 50, 128)  # BGR for maroon/purple
        
        # Add stage lighting effects
        for i in range(7):
            x_pos = int(img_width * (i + 0.5) / 7)
            # Draw light cone
            points = np.array([[x_pos, 0], [x_pos - 100, img_height//2], [x_pos + 100, img_height//2]])
            cv2.fillPoly(template_img, [points], (200, 100, 200), lineType=cv2.LINE_AA)
    
    # Add a central area for the person/face
    cv2.rectangle(template_img, (img_width//4, img_height//4), 
                 (3*img_width//4, 3*img_height//4), (100, 100, 100), 2)
    
    # Add text at the bottom
    font = cv2.FONT_HERSHEY_SCRIPT_COMPLEX
    text = f"{style.capitalize()} Ceremony"
    text_size = cv2.getTextSize(text, font, 2, 3)[0]
    text_x = (img_width - text_size[0]) // 2
    text_y = img_height - 50
    cv2.putText(template_img, text, (text_x, text_y), font, 2, (255, 255, 255), 3, lineType=cv2.LINE_AA)
    
    # Add a face placeholder
    face_center_x, face_center_y = img_width // 2, img_height // 3
    face_radius = min(img_width, img_height) // 7
    
    # Draw face circle
    cv2.circle(template_img, (face_center_x, face_center_y), face_radius, (220, 220, 220), -1)
    cv2.circle(template_img, (face_center_x, face_center_y), face_radius, (255, 255, 255), 2)
    
    # Draw eyes
    eye_radius = face_radius // 5
    left_eye_x = face_center_x - face_radius // 3
    right_eye_x = face_center_x + face_radius // 3
    eyes_y = face_center_y - face_radius // 5
    
    cv2.circle(template_img, (left_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    cv2.circle(template_img, (right_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    
    # Draw mouth
    mouth_y = face_center_y + face_radius // 3
    cv2.ellipse(template_img, (face_center_x, mouth_y), 
               (face_radius // 3, face_radius // 6), 
               0, 20, 160, (50, 50, 150), -1)
    
    # Add a body outline or traditional dress indicators
    # Neck
    cv2.rectangle(template_img, 
                 (face_center_x - face_radius//3, face_center_y + face_radius),
                 (face_center_x + face_radius//3, face_center_y + face_radius*2),
                 (220, 220, 220), -1)
    
    # Shoulders and upper body
    body_top_y = face_center_y + face_radius*2
    body_width = face_radius * 3
    
    # Draw upper body shape based on style
    body_color = (220, 220, 220)
    if style == 'haldi':
        body_color = (50, 200, 240)  # Yellow saree
    elif style == 'mehendi':
        body_color = (50, 150, 50)   # Green lehenga
    elif style == 'wedding':
        body_color = (50, 50, 180)   # Red lehenga
    elif style == 'reception':
        body_color = (130, 50, 130)  # Maroon gown
    
    # Draw upper body
    points = np.array([
        [face_center_x - body_width//2, body_top_y],
        [face_center_x + body_width//2, body_top_y],
        [face_center_x + body_width//2 + 50, img_height],
        [face_center_x - body_width//2 - 50, img_height]
    ])
    cv2.fillPoly(template_img, [points], body_color, lineType=cv2.LINE_AA)
    
    # Add style-specific embellishments to the dress
    if style == 'haldi':
        # Add turmeric dots
        for i in range(20):
            dot_x = np.random.randint(face_center_x - body_width//2, face_center_x + body_width//2)
            dot_y = np.random.randint(body_top_y, img_height - 100)
            cv2.circle(template_img, (dot_x, dot_y), 5, (0, 240, 255), -1)
    elif style == 'mehendi':
        # Add henna patterns on hands
        for i in range(10):
            pattern_y = body_top_y + i * 30
            cv2.line(template_img, 
                    (face_center_x - body_width//2 - 20, pattern_y),
                    (face_center_x - body_width//2 + 50, pattern_y),
                    (0, 200, 0), 3)
            cv2.line(template_img, 
                    (face_center_x + body_width//2 + 20, pattern_y),
                    (face_center_x + body_width//2 - 50, pattern_y),
                    (0, 200, 0), 3)
    elif style == 'wedding':
        # Add gold jewelry patterns
        for i in range(5):
            y_pos = body_top_y + i * 40
            cv2.line(template_img, 
                    (face_center_x - body_width//3, y_pos),
                    (face_center_x + body_width//3, y_pos),
                    (0, 200, 255), 5)  # Gold color
    elif style == 'reception':
        # Add sparkle effects for reception
        for i in range(15):
            sparkle_x = np.random.randint(face_center_x - body_width//2, face_center_x + body_width//2)
            sparkle_y = np.random.randint(body_top_y, img_height - 100)
            cv2.drawMarker(template_img, (sparkle_x, sparkle_y), 
                          (255, 255, 255), markerType=cv2.MARKER_STAR, 
                          markerSize=10, thickness=1)
    
    # Save the template
    output_path = os.path.join(output_dir, f'{style}_template.jpg')
    cv2.imwrite(output_path, template_img)
    print(f"Created template for {style} at {output_path}")
    
    return output_path

if __name__ == "__main__":
    # Create templates for all styles
    template_dir = 'uploads/templates'
    for style in ['haldi', 'mehendi', 'wedding', 'reception']:
        create_bridal_template(style, template_dir)