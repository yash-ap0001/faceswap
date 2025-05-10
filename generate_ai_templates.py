"""
Generate AI templates for each ceremony category using OpenAI's DALL-E 3.
This will create realistic Indian bridal images for each ceremony type.
"""

import os
import time
import requests
import json
from openai import OpenAI
from PIL import Image
from io import BytesIO

# Configure OpenAI API
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Define the ceremonies and their descriptions for generation
CEREMONIES = {
    'haldi': {
        'description': 'Indian bride in a yellow outfit during Haldi ceremony, face covered with turmeric paste, traditional setting, decorative flowers, professional photography, detailed, realistic',
        'count': 5
    },
    'mehendi': {
        'description': 'Indian bride in green attire during Mehendi ceremony, intricate henna designs on hands, professional photography, detailed mehendi patterns, realistic, cheerful setting',
        'count': 5
    },
    'sangeeth': {
        'description': 'Indian bride in vibrant blue outfit during Sangeeth ceremony, dancing pose, professional photography, elaborate jewelry, decorations, colorful setting, realistic',
        'count': 5
    },
    'wedding': {
        'description': 'Indian bride in traditional red wedding saree or lehenga, elaborate gold jewelry, professional photography, wedding mandap background, realistic, detailed',
        'count': 5
    },
    'reception': {
        'description': 'Indian bride in elegant maroon or purple reception gown or lehenga, modern setting, professional photography, elegant jewelry, sophisticated look, realistic',
        'count': 5
    }
}

def generate_ai_template(ceremony, prompt, index):
    """Generate an AI image for a ceremony template using DALL-E."""
    try:
        # Create output directory if it doesn't exist
        template_dir = os.path.join('uploads', 'templates', 'ai')
        os.makedirs(template_dir, exist_ok=True)
        
        # Add specific instructions for image generation
        full_prompt = f"Create a professional, high-quality photograph of an {prompt}. The image must be a close-up portrait of a beautiful Indian bride, showing her face clearly. No text or watermarks. Focus on face details and ornate jewelry. Realistic style."
        
        print(f"Generating image for {ceremony} (#{index})...")
        
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
        
        # Save the image
        filename = f"{ceremony}_{index}.jpg"
        output_path = os.path.join(template_dir, filename)
        img.save(output_path, "JPEG")
        
        # Also save a copy in the main ceremony_type.jpg format if it's the first image
        if index == 1:
            main_output_path = os.path.join('uploads', 'templates', f"{ceremony}_ai.jpg")
            img.save(main_output_path, "JPEG")
            print(f"Saved main template: {main_output_path}")
        
        print(f"Saved: {output_path}")
        return output_path
    
    except Exception as e:
        print(f"Error generating image for {ceremony}: {str(e)}")
        return None

def main():
    """Generate AI templates for all ceremonies."""
    print("Starting AI template generation...")
    
    for ceremony, details in CEREMONIES.items():
        print(f"\nGenerating templates for {ceremony.upper()} ceremony...")
        
        for i in range(1, details['count'] + 1):
            output_path = generate_ai_template(ceremony, details['description'], i)
            
            if output_path:
                print(f"Successfully generated image {i}/{details['count']} for {ceremony}")
            else:
                print(f"Failed to generate image {i}/{details['count']} for {ceremony}")
            
            # Sleep to avoid rate limiting
            if i < details['count'] or ceremony != list(CEREMONIES.keys())[-1]:
                print("Waiting before generating next image...")
                time.sleep(2)
    
    print("\nAI template generation complete!")

if __name__ == "__main__":
    main()