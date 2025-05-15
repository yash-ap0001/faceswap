import os
from PIL import Image, ImageDraw, ImageFont

# Create a directory for the placeholder if it doesn't exist
os.makedirs('static', exist_ok=True)

# Create a 400x400 image with a gray background
img = Image.new('RGB', (400, 400), color=(40, 40, 40))
d = ImageDraw.Draw(img)

# Add text
text = "Image not available"
text_position = (100, 200)
text_color = (200, 200, 200)

# Draw text on the image
d.text(text_position, text, fill=text_color)

# Add a border
border_color = (80, 80, 80)
d.rectangle([(0, 0), (399, 399)], outline=border_color, width=5)

# Save the image
img.save('static/placeholder.png')
print("Placeholder image created at static/placeholder.png")