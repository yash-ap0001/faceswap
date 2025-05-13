import os
import numpy as np
import cv2

def create_placeholder_image():
    # Create a 800x600 image with a purple gradient background
    width, height = 800, 600
    img = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Create gradient from top to bottom (darker purple to lighter purple)
    for y in range(height):
        # Calculate gradient color
        r = int(156 + (y / height) * (92 - 156))  # 9c to 5b
        g = int(77 + (y / height) * (43 - 77))    # 4d to 2b
        b = int(204 + (y / height) * (117 - 204)) # cc to 75
        
        img[y, :] = [b, g, r]  # OpenCV uses BGR
    
    # Add some decorative elements (circles with low opacity)
    overlay = img.copy()
    for _ in range(10):
        x = np.random.randint(0, width)
        y = np.random.randint(0, height)
        radius = np.random.randint(30, 100)
        cv2.circle(overlay, (x, y), radius, (220, 200, 255), -1)  # Light purple circles
    
    # Apply the overlay with transparency
    alpha = 0.2
    img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)
    
    # Add text
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img, "Bridal Salon", (width//3, height//2 - 20), font, 1.5, (255, 255, 255), 3, cv2.LINE_AA)
    cv2.putText(img, "Beauty Services & Makeup Artists", (width//5, height//2 + 30), font, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
    
    # Create directory if it doesn't exist
    os.makedirs('static/images', exist_ok=True)
    
    # Save the image
    cv2.imwrite('static/images/placeholder_saloon.jpg', img)
    print("Placeholder image created at: static/images/placeholder_saloon.jpg")

if __name__ == "__main__":
    create_placeholder_image()