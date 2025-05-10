import os
import cv2
import numpy as np

def create_simple_templates(output_dir):
    """Create simple AI-generated and natural-looking bridal templates."""
    os.makedirs(output_dir, exist_ok=True)
    
    # Create templates for each style
    create_template('haldi', output_dir)
    create_template('mehendi', output_dir)
    create_template('wedding', output_dir)
    create_template('reception', output_dir)
    
    print("All templates created successfully.")
    
def create_template(style, output_dir):
    """Create natural and AI templates for a specific bridal style."""
    # Image dimensions
    width, height = 800, 1000
    
    # Create the natural-style template
    natural_img = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Set background color based on style
    if style == 'haldi':
        # Yellow for Haldi
        background_color = (50, 200, 240)  # BGR for yellow
        outfit_color = (0, 180, 230)
        accent_color = (0, 220, 250)
    elif style == 'mehendi':
        # Green for Mehendi
        background_color = (50, 150, 50)
        outfit_color = (20, 120, 20)
        accent_color = (80, 180, 80)
    elif style == 'wedding':
        # Red for Wedding
        background_color = (50, 50, 200)
        outfit_color = (30, 30, 180)
        accent_color = (70, 70, 220)
    elif style == 'reception':
        # Purple/Maroon for Reception
        background_color = (130, 50, 130)
        outfit_color = (100, 30, 100)
        accent_color = (150, 70, 150)
    
    # Fill background
    natural_img[:] = background_color
    
    # Add decorative header
    cv2.rectangle(natural_img, (0, 0), (width, 150), accent_color, -1)
    
    # Add a face oval in the upper part
    face_center_y = 350
    face_center_x = width // 2
    face_radius_y = 120
    face_radius_x = 100
    
    # Draw face
    cv2.ellipse(natural_img, 
                (face_center_x, face_center_y), 
                (face_radius_x, face_radius_y), 
                0, 0, 360, (220, 220, 220), -1)
    
    # Draw eyes
    eye_radius = 15
    eye_y = face_center_y - 20
    left_eye_x = face_center_x - 40
    right_eye_x = face_center_x + 40
    
    cv2.circle(natural_img, (left_eye_x, eye_y), eye_radius, (50, 50, 50), -1)
    cv2.circle(natural_img, (right_eye_x, eye_y), eye_radius, (50, 50, 50), -1)
    
    # Draw mouth
    mouth_y = face_center_y + 50
    cv2.ellipse(natural_img, 
                (face_center_x, mouth_y), 
                (40, 20), 
                0, 0, 180, (50, 50, 150), -1)
    
    # Draw body - simple triangle shape
    body_points = np.array([
        [face_center_x - 100, face_center_y + face_radius_y],
        [face_center_x + 100, face_center_y + face_radius_y],
        [face_center_x + 300, height],
        [face_center_x - 300, height]
    ], dtype=np.int32)
    
    cv2.fillPoly(natural_img, [body_points], outfit_color)
    
    # Add some decorative elements based on style
    if style == 'haldi':
        # Yellow dots for turmeric
        for _ in range(30):
            x = np.random.randint(width // 4, 3 * width // 4)
            y = np.random.randint(face_center_y + face_radius_y, height)
            radius = np.random.randint(3, 8)
            cv2.circle(natural_img, (x, y), radius, (0, 240, 255), -1)
    
    elif style == 'mehendi':
        # Green patterns for henna
        for i in range(10):
            start_y = face_center_y + face_radius_y + i * 50
            cv2.line(natural_img, 
                    (width // 4, start_y), 
                    (3 * width // 4, start_y), 
                    accent_color, 3)
    
    elif style == 'wedding':
        # Gold decorations for wedding
        for i in range(15):
            start_y = face_center_y + face_radius_y + i * 40
            cv2.line(natural_img, 
                    (width // 4 + i * 20, start_y), 
                    (3 * width // 4 - i * 20, start_y), 
                    (0, 200, 255), 3)  # Gold color
            
    elif style == 'reception':
        # Sparkles for reception
        for _ in range(50):
            x = np.random.randint(width // 4, 3 * width // 4)
            y = np.random.randint(face_center_y + face_radius_y, height)
            radius = np.random.randint(1, 3)
            cv2.circle(natural_img, (x, y), radius, (200, 200, 200), -1)
    
    # Add text label
    font = cv2.FONT_HERSHEY_COMPLEX
    cv2.putText(natural_img, 
                f"{style.capitalize()} Template", 
                (width // 4, height - 50), 
                font, 1, (255, 255, 255), 2)
    
    # Save natural template
    cv2.imwrite(os.path.join(output_dir, f'{style}_natural.jpg'), natural_img)
    print(f"Created natural template for {style}")
    
    # Create AI template (slightly modified version)
    ai_img = natural_img.copy()
    
    # Add different background pattern
    for i in range(0, height, 2):
        cv2.line(ai_img, (0, i), (width, i), 
                (background_color[0]+10, background_color[1]+10, background_color[2]+10), 1)
    
    # Add "AI-generated" label
    cv2.putText(ai_img, 
                "AI-generated", 
                (width // 4, height - 20), 
                font, 0.8, (255, 255, 255), 1)
    
    # Save AI template
    cv2.imwrite(os.path.join(output_dir, f'{style}_ai.jpg'), ai_img)
    print(f"Created AI template for {style}")

if __name__ == "__main__":
    create_simple_templates('uploads/templates')