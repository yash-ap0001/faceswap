import os
import cv2
import numpy as np

def create_ai_bridal_templates(output_dir):
    """
    Create more sophisticated AI-generated bridal template images.
    These will be more detailed than the basic placeholders.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Template dimensions
    img_height, img_width = 1024, 768
    
    # 1. Haldi Ceremony Template (Yellow theme)
    haldi_img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Background gradient (yellow to gold)
    for y in range(img_height):
        yellow_intensity = int(180 + 75 * (y / img_height))
        haldi_img[y, :] = (0, yellow_intensity, 255)
    
    # Add decorative marigold flower patterns
    for i in range(20):
        x = np.random.randint(0, img_width)
        y = np.random.randint(0, img_height)
        size = np.random.randint(20, 50)
        
        # Draw flower
        cv2.circle(haldi_img, (x, y), size, (0, 165, 255), -1)  # Orange center
        for j in range(8):
            angle = j * 45
            rx = int(size * np.cos(np.radians(angle)))
            ry = int(size * np.sin(np.radians(angle)))
            cv2.circle(haldi_img, (x + rx, y + ry), size//2, (0, 215, 255), -1)
    
    # Add face frame (decorated area around the face)
    cv2.ellipse(haldi_img, (img_width//2, img_height//3), 
               (img_width//4, img_height//3), 
               0, 0, 360, (0, 200, 240), -1)
    cv2.ellipse(haldi_img, (img_width//2, img_height//3), 
               (img_width//4, img_height//3), 
               0, 0, 360, (0, 180, 220), 10)
    
    # Draw a face placeholder
    face_center_x, face_center_y = img_width//2, img_height//3
    face_radius = img_width//8
    
    # Face
    cv2.circle(haldi_img, (face_center_x, face_center_y), face_radius, (210, 210, 210), -1)
    # Eyes
    eye_radius = face_radius//5
    left_eye_x = face_center_x - face_radius//2
    right_eye_x = face_center_x + face_radius//2
    eyes_y = face_center_y - face_radius//6
    
    cv2.circle(haldi_img, (left_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    cv2.circle(haldi_img, (right_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    
    # Mouth
    mouth_y = face_center_y + face_radius//3
    cv2.ellipse(haldi_img, (face_center_x, mouth_y), 
               (face_radius//3, face_radius//6), 
               0, 0, 180, (50, 50, 150), -1)
    
    # Body outline
    body_points = np.array([
        [face_center_x - face_radius, face_center_y + face_radius],
        [face_center_x + face_radius, face_center_y + face_radius],
        [face_center_x + face_radius*2, img_height],
        [face_center_x - face_radius*2, img_height]
    ], dtype=np.int32)
    cv2.fillPoly(haldi_img, [body_points], (0, 180, 230))
    
    # Add text
    font = cv2.FONT_HERSHEY_SCRIPT_COMPLEX
    text = "Haldi Ceremony"
    text_size = cv2.getTextSize(text, font, 2, 3)[0]
    text_x = (img_width - text_size[0]) // 2
    text_y = img_height - 50
    cv2.putText(haldi_img, text, (text_x, text_y), font, 2, (255, 255, 255), 3, lineType=cv2.LINE_AA)
    
    # Save haldi template
    cv2.imwrite(os.path.join(output_dir, 'haldi_ai.jpg'), haldi_img)
    print(f"Created AI template for Haldi ceremony")
    
    # 2. Mehendi Function Template (Green theme)
    mehendi_img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Background gradient (light green to dark green)
    for y in range(img_height):
        green_intensity = int(150 - 100 * (y / img_height))
        mehendi_img[y, :] = (0, green_intensity, 0)
    
    # Add henna pattern decorations
    for i in range(30):
        x = np.random.randint(0, img_width)
        y = np.random.randint(0, img_height)
        size = np.random.randint(5, 15)
        
        # Draw henna-inspired pattern
        if np.random.random() > 0.5:
            # Circular pattern
            cv2.circle(mehendi_img, (x, y), size, (0, 200, 50), 2)
            cv2.circle(mehendi_img, (x, y), size//2, (0, 180, 40), 1)
        else:
            # Floral pattern
            for j in range(6):
                angle = j * 60
                rx = int(size * 2 * np.cos(np.radians(angle)))
                ry = int(size * 2 * np.sin(np.radians(angle)))
                cv2.line(mehendi_img, (x, y), (x + rx, y + ry), (0, 200, 50), 1)
    
    # Add face frame (decorated area around the face)
    cv2.rectangle(mehendi_img, 
                 (img_width//3, img_height//6), 
                 (2*img_width//3, img_height//2), 
                 (0, 180, 0), -1)
    
    # Draw intricate border
    for i in range(10):
        offset = i * 2
        cv2.rectangle(mehendi_img, 
                     (img_width//3 - offset, img_height//6 - offset), 
                     (2*img_width//3 + offset, img_height//2 + offset), 
                     (0, 160 + i*8, 0), 1)
    
    # Draw a face placeholder
    face_center_x, face_center_y = img_width//2, img_height//3
    face_radius = img_width//8
    
    # Face
    cv2.circle(mehendi_img, (face_center_x, face_center_y), face_radius, (220, 220, 220), -1)
    # Eyes
    eye_radius = face_radius//5
    left_eye_x = face_center_x - face_radius//2
    right_eye_x = face_center_x + face_radius//2
    eyes_y = face_center_y - face_radius//6
    
    cv2.circle(mehendi_img, (left_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    cv2.circle(mehendi_img, (right_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    
    # Mouth
    mouth_y = face_center_y + face_radius//3
    cv2.ellipse(mehendi_img, (face_center_x, mouth_y), 
               (face_radius//3, face_radius//6), 
               0, 0, 180, (50, 50, 150), -1)
    
    # Body outline (lehenga style)
    body_top_y = face_center_y + face_radius
    
    # Upper body
    upper_body_points = np.array([
        [face_center_x - face_radius, body_top_y],
        [face_center_x + face_radius, body_top_y],
        [face_center_x + face_radius*1.5, body_top_y + face_radius*2],
        [face_center_x - face_radius*1.5, body_top_y + face_radius*2]
    ], dtype=np.int32)
    cv2.fillPoly(mehendi_img, [upper_body_points], (0, 160, 0))
    
    # Lehenga (skirt)
    lehenga_points = np.array([
        [face_center_x - face_radius*1.5, body_top_y + face_radius*2],
        [face_center_x + face_radius*1.5, body_top_y + face_radius*2],
        [face_center_x + face_radius*3, img_height],
        [face_center_x - face_radius*3, img_height]
    ], dtype=np.int32)
    cv2.fillPoly(mehendi_img, [lehenga_points], (0, 150, 0))
    
    # Add embellishment lines on lehenga
    for i in range(5):
        y_pos = body_top_y + face_radius*2 + i * (img_height - body_top_y - face_radius*2)//5
        cv2.line(mehendi_img, 
                (face_center_x - face_radius*1.5 - i*face_radius*0.3, y_pos),
                (face_center_x + face_radius*1.5 + i*face_radius*0.3, y_pos),
                (0, 200, 50), 2)
    
    # Add text
    font = cv2.FONT_HERSHEY_SCRIPT_COMPLEX
    text = "Mehendi Function"
    text_size = cv2.getTextSize(text, font, 2, 3)[0]
    text_x = (img_width - text_size[0]) // 2
    text_y = img_height - 50
    cv2.putText(mehendi_img, text, (text_x, text_y), font, 2, (255, 255, 255), 3, lineType=cv2.LINE_AA)
    
    # Save mehendi template
    cv2.imwrite(os.path.join(output_dir, 'mehendi_ai.jpg'), mehendi_img)
    print(f"Created AI template for Mehendi function")
    
    # 3. Wedding Ceremony Template (Red theme)
    wedding_img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Background gradient (dark red to bright red)
    for y in range(img_height):
        red_intensity = int(100 + 155 * (y / img_height))
        wedding_img[y, :] = (30, 30, red_intensity)
    
    # Add mandap (wedding altar) at the top
    mandap_height = img_height // 3
    cv2.rectangle(wedding_img, (img_width//4, 0), (3*img_width//4, mandap_height), (50, 50, 180), -1)
    
    # Mandap pillars
    pillar_width = 20
    for x_pos in [img_width//4, 3*img_width//4]:
        cv2.rectangle(wedding_img, (x_pos - pillar_width//2, 0), (x_pos + pillar_width//2, mandap_height*1.5), (50, 70, 200), -1)
    
    # Mandap decorations (flowers)
    for i in range(30):
        x = np.random.randint(img_width//4, 3*img_width//4)
        y = np.random.randint(0, mandap_height)
        size = np.random.randint(5, 15)
        color = (np.random.randint(0, 100), np.random.randint(0, 100), np.random.randint(180, 255))
        cv2.circle(wedding_img, (x, y), size, color, -1)
    
    # Draw a face placeholder
    face_center_x, face_center_y = img_width//2, img_height//2
    face_radius = img_width//8
    
    # Face
    cv2.circle(wedding_img, (face_center_x, face_center_y), face_radius, (220, 220, 220), -1)
    # Eyes
    eye_radius = face_radius//5
    left_eye_x = face_center_x - face_radius//2
    right_eye_x = face_center_x + face_radius//2
    eyes_y = face_center_y - face_radius//6
    
    cv2.circle(wedding_img, (left_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    cv2.circle(wedding_img, (right_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    
    # Mouth
    mouth_y = face_center_y + face_radius//3
    cv2.ellipse(wedding_img, (face_center_x, mouth_y), 
               (face_radius//3, face_radius//6), 
               0, 0, 180, (50, 50, 150), -1)
    
    # Bridal headpiece/veil
    for i in range(10):
        offset = i * 5
        cv2.ellipse(wedding_img, (face_center_x, face_center_y - face_radius//2), 
                   (face_radius + offset, face_radius//2 + offset//2), 
                   0, 180, 360, (50, 50, 200 - i*5), 2)
    
    # Red lehenga (wedding dress)
    body_top_y = face_center_y + face_radius
    
    # Upper body
    upper_body_points = np.array([
        [face_center_x - face_radius, body_top_y],
        [face_center_x + face_radius, body_top_y],
        [face_center_x + face_radius*1.5, body_top_y + face_radius*2],
        [face_center_x - face_radius*1.5, body_top_y + face_radius*2]
    ])
    cv2.fillPoly(wedding_img, [upper_body_points], (30, 30, 200))
    
    # Lehenga (skirt)
    lehenga_points = np.array([
        [face_center_x - face_radius*1.5, body_top_y + face_radius*2],
        [face_center_x + face_radius*1.5, body_top_y + face_radius*2],
        [face_center_x + face_radius*3, img_height],
        [face_center_x - face_radius*3, img_height]
    ])
    cv2.fillPoly(wedding_img, [lehenga_points], (30, 30, 180))
    
    # Gold embellishments on lehenga
    for i in range(8):
        y_pos = body_top_y + face_radius*2 + i * (img_height - body_top_y - face_radius*2)//8
        cv2.line(wedding_img, 
                (face_center_x - face_radius*1.5 - i*face_radius*0.25, y_pos),
                (face_center_x + face_radius*1.5 + i*face_radius*0.25, y_pos),
                (0, 180, 240), 3)  # Gold color
    
    # Add jewelry (necklace)
    for i in range(5):
        radius = face_radius//2 + i*5
        cv2.ellipse(wedding_img, (face_center_x, body_top_y), 
                   (radius, radius//2), 
                   0, 180, 360, (0, 180, 240), 2)  # Gold color
    
    # Add text
    font = cv2.FONT_HERSHEY_SCRIPT_COMPLEX
    text = "Wedding Ceremony"
    text_size = cv2.getTextSize(text, font, 2, 3)[0]
    text_x = (img_width - text_size[0]) // 2
    text_y = img_height - 50
    cv2.putText(wedding_img, text, (text_x, text_y), font, 2, (255, 255, 255), 3, lineType=cv2.LINE_AA)
    
    # Save wedding template
    cv2.imwrite(os.path.join(output_dir, 'wedding_ai.jpg'), wedding_img)
    print(f"Created AI template for Wedding ceremony")
    
    # 4. Reception Template (Maroon/Purple elegant theme)
    reception_img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Background gradient (dark purple to lighter purple)
    for y in range(img_height):
        purple_b = int(80 + 50 * (1 - y / img_height))  # blue component
        purple_r = int(80 + 50 * (1 - y / img_height))  # red component
        reception_img[y, :] = (purple_b, 0, purple_r)
    
    # Add stage backdrop
    cv2.rectangle(reception_img, (0, 0), (img_width, img_height//3), (100, 0, 100), -1)
    
    # Add lighting effects
    for i in range(7):
        x_pos = i * img_width // 6
        # Light cone
        points = np.array([
            [x_pos, 0],
            [x_pos - 100, img_height//2],
            [x_pos + 100, img_height//2]
        ])
        cv2.fillPoly(reception_img, [points], (150, 50, 150), lineType=cv2.LINE_AA)
    
    # Add decorative lights
    for i in range(50):
        x = np.random.randint(0, img_width)
        y = np.random.randint(0, img_height//2)
        size = np.random.randint(2, 5)
        brightness = np.random.randint(150, 255)
        cv2.circle(reception_img, (x, y), size, (brightness, brightness//2, brightness), -1)
    
    # Draw a face placeholder
    face_center_x, face_center_y = img_width//2, img_height//2
    face_radius = img_width//8
    
    # Face
    cv2.circle(reception_img, (face_center_x, face_center_y), face_radius, (220, 220, 220), -1)
    # Eyes
    eye_radius = face_radius//5
    left_eye_x = face_center_x - face_radius//2
    right_eye_x = face_center_x + face_radius//2
    eyes_y = face_center_y - face_radius//6
    
    cv2.circle(reception_img, (left_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    cv2.circle(reception_img, (right_eye_x, eyes_y), eye_radius, (50, 50, 50), -1)
    
    # Mouth
    mouth_y = face_center_y + face_radius//3
    cv2.ellipse(reception_img, (face_center_x, mouth_y), 
               (face_radius//3, face_radius//6), 
               0, 0, 180, (50, 50, 150), -1)
    
    # Designer gown or modern lehenga
    body_top_y = face_center_y + face_radius
    
    # Upper body
    upper_body_points = np.array([
        [face_center_x - face_radius, body_top_y],
        [face_center_x + face_radius, body_top_y],
        [face_center_x + face_radius*1.2, body_top_y + face_radius*2],
        [face_center_x - face_radius*1.2, body_top_y + face_radius*2]
    ])
    cv2.fillPoly(reception_img, [upper_body_points], (150, 0, 150))
    
    # Gown skirt (A-line)
    gown_points = np.array([
        [face_center_x - face_radius*1.2, body_top_y + face_radius*2],
        [face_center_x + face_radius*1.2, body_top_y + face_radius*2],
        [face_center_x + face_radius*2.5, img_height],
        [face_center_x - face_radius*2.5, img_height]
    ])
    cv2.fillPoly(reception_img, [gown_points], (130, 0, 130))
    
    # Add sparkle/sequin effects on dress
    for i in range(30):
        x = np.random.randint(int(face_center_x - face_radius*2), int(face_center_x + face_radius*2))
        y = np.random.randint(body_top_y, img_height)
        size = np.random.randint(2, 4)
        cv2.circle(reception_img, (x, y), size, (200, 200, 200), -1)
    
    # Add jewelry (diamond-like)
    for i in range(3):
        radius = face_radius//2 + i*3
        cv2.ellipse(reception_img, (face_center_x, body_top_y), 
                   (radius, radius//3), 
                   0, 180, 360, (200, 200, 200), 1)  # Silver/diamond color
    
    # Add text
    font = cv2.FONT_HERSHEY_SCRIPT_COMPLEX
    text = "Reception"
    text_size = cv2.getTextSize(text, font, 2, 3)[0]
    text_x = (img_width - text_size[0]) // 2
    text_y = img_height - 50
    cv2.putText(reception_img, text, (text_x, text_y), font, 2, (255, 255, 255), 3, lineType=cv2.LINE_AA)
    
    # Save reception template
    cv2.imwrite(os.path.join(output_dir, 'reception_ai.jpg'), reception_img)
    print(f"Created AI template for Reception")
    
    print("All AI bridal templates created successfully!")

if __name__ == "__main__":
    create_ai_bridal_templates('uploads/templates')