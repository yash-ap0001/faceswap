"""
Generate a single AI template for each ceremony category using OpenAI's DALL-E 3.
This will create one realistic Indian bridal image for each ceremony type.
"""

import os
import requests
import json
from openai import OpenAI
from PIL import Image
from io import BytesIO

# Configure OpenAI API
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Define the ceremonies and their descriptions for generation
CEREMONIES = {
    'haldi': 'Indian bride in a yellow outfit during Haldi ceremony, face covered with turmeric paste, traditional setting, decorative flowers, professional photography, detailed, realistic',
    'mehendi': 'Indian bride in green attire during Mehendi ceremony, intricate henna designs on hands, professional photography, detailed mehendi patterns, realistic, cheerful setting',
    'sangeeth': 'Indian bride in vibrant blue outfit during Sangeeth ceremony, dancing pose, professional photography, elaborate jewelry, decorations, colorful setting, realistic',
    'wedding': 'Indian bride in traditional red wedding saree or lehenga, elaborate gold jewelry, professional photography, wedding mandap background, realistic, detailed',
    'reception': 'Indian bride in elegant maroon or purple reception gown or lehenga, modern setting, professional photography, elegant jewelry, sophisticated look, realistic'
}

def generate_ai_template(ceremony, prompt):
    """Generate an AI image for a ceremony template using DALL-E."""
    try:
        # Create output directory if it doesn't exist
        template_dir = os.path.join('uploads', 'templates', 'ai')
        os.makedirs(template_dir, exist_ok=True)
        
        # Add specific instructions for image generation
        full_prompt = f"Create a professional, high-quality photograph of an {prompt}. The image must be a close-up portrait of a beautiful Indian bride, showing her face clearly. No text or watermarks. Focus on face details and ornate jewelry. Realistic style."
        
        print(f"Generating image for {ceremony}...")
        
        # Generate image with DALL-E
        response = client.images.generate(
            model="dall-e-3",
            prompt=full_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        # Get the image URL
        image_url = response.data[0].url
        
        # Download the image
        image_response = requests.get(image_url)
        img = Image.open(BytesIO(image_response.content))
        
        # Save the image in the type folder
        filename = f"{ceremony}.jpg"
        output_path = os.path.join(template_dir, filename)
        img.save(output_path, "JPEG")
        
        # Also save a copy with the index 1
        indexed_path = os.path.join(template_dir, f"{ceremony}_1.jpg")
        img.save(indexed_path, "JPEG")
        
        # Also save a copy in the main ceremony_type.jpg format
        main_output_path = os.path.join('uploads', 'templates', f"{ceremony}_ai.jpg")
        img.save(main_output_path, "JPEG")
        
        print(f"Saved: {output_path}")
        print(f"Saved: {indexed_path}")
        print(f"Saved: {main_output_path}")
        
        return output_path
    
    except Exception as e:
        print(f"Error generating image for {ceremony}: {str(e)}")
        return None

def main():
    """Generate AI templates for all ceremonies."""
    print("Starting AI template generation...")
    
    for ceremony, description in CEREMONIES.items():
        print(f"\nGenerating template for {ceremony.upper()} ceremony...")
        
        output_path = generate_ai_template(ceremony, description)
        
        if output_path:
            print(f"Successfully generated image for {ceremony}")
        else:
            print(f"Failed to generate image for {ceremony}")
    
    print("\nAI template generation complete!")

if __name__ == "__main__":
    main()