import os
import cv2
import numpy as np
import time
from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for, session
import insightface
from insightface.app import FaceAnalysis
from insightface.model_zoo import get_model
from werkzeug.utils import secure_filename
import requests
import shutil
import zipfile
import io
import traceback
import logging
from flask_login import LoginManager
import base64

# Import face enhancer
from face_enhancer import FaceEnhancer

# Initialize global face enhancer variable
face_enhancer = None

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "development_secret_key")

# Initialize the database
from db import db
app.config["SQLALCHEMY_DATABASE_URI"] = 'postgresql://postgres:postgres@localhost/faceswap'
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Import user model for login functionality
from models import User, EventManager

# Create all tables and add sample managers if needed
with app.app_context():
    db.create_all()
    
    # Create directories for event manager images if they don't exist
    os.makedirs('static/images/event_managers', exist_ok=True)
    
    # Create directories for template uploads
    os.makedirs('uploads/templates', exist_ok=True)
    ceremony_types = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    template_types = ['real', 'natural', 'ai', 'pinterest']
    
    for template_type in template_types:
        os.makedirs(f'uploads/templates/{template_type}', exist_ok=True)
        for ceremony in ceremony_types:
            os.makedirs(f'uploads/templates/{template_type}/{ceremony}', exist_ok=True)
    
    # Check if we have event managers already
    if EventManager.query.count() == 0:
        print("Creating sample event managers...")
        # Create sample event managers
        managers = [
            {
                'name': 'Priya Sharma',
                'profile_photo': '/static/images/event_managers/priya_sharma.jpg',
                'email': 'priya@weddingplanners.com',
                'phone': '+91 98765-43210',
                'website': 'www.priyasharmaevents.com',
                'bio': 'With over 10 years of experience in planning luxury Indian weddings, Priya specializes in creating unforgettable ceremonies that blend tradition with modern elegance.',
                'rating': 4.8,
                'price_range': '₹75,000 - ₹2,50,000',
                'service_categories': 'Full Planning,Day-of Coordination,Destination Weddings',
                'location': 'Mumbai, Delhi',
                'experience_years': 10,
                'specialization': 'Luxury Weddings',
                'languages': 'Hindi, English, Punjabi'
            },
            {
                'name': 'Raj Kumar',
                'profile_photo': '/static/images/event_managers/raj_kumar.jpg',
                'email': 'raj@weddingdreams.com',
                'phone': '+91 87654-32109',
                'website': 'www.rajkumarevents.com',
                'bio': 'Raj brings creativity and precision to every wedding, focusing on personalized experiences that tell your unique love story.',
                'rating': 4.5,
                'price_range': '₹50,000 - ₹1,50,000',
                'service_categories': 'Wedding Design,Cultural Ceremonies,Theme Weddings',
                'location': 'Bangalore, Chennai',
                'experience_years': 8,
                'specialization': 'Themed Weddings',
                'languages': 'Tamil, English, Hindi'
            },
            {
                'name': 'Anjali Desai',
                'profile_photo': '/static/images/event_managers/anjali_desai.jpg',
                'email': 'anjali@intimateweddings.com',
                'phone': '+91 76543-21098',
                'website': 'www.anjalidesaiweddings.com',
                'bio': 'Anjali focuses on creating intimate, personalized wedding experiences that tell each couple\'s unique story.',
                'rating': 4.3,
                'price_range': '₹30,000 - ₹80,000',
                'service_categories': 'Intimate Weddings,Budget Planning,DIY Coordination',
                'location': 'Pune, Ahmedabad',
                'experience_years': 5,
                'specialization': 'Intimate Ceremonies',
                'languages': 'Gujarati, Hindi, English'
            }
        ]
        
        # Add the event managers to the database
        for manager_data in managers:
            # Create placeholder image if it doesn't exist
            photo_path = manager_data['profile_photo'].lstrip('/')
            if not os.path.exists(photo_path):
                # Create a placeholder image with manager's initials
                img = np.zeros((400, 400, 3), dtype=np.uint8)
                
                # Generate a color based on the name (for consistent colors)
                name_hash = sum(ord(c) for c in manager_data['name'])
                color = (name_hash % 180 + 50, 150, 250)  # Ensure good hue, saturation, value
                
                # Fill the background
                img[:] = color
                
                # Get initials
                name_parts = manager_data['name'].split()
                initials = ''.join([name[0] for name in name_parts])
                
                # Add text
                font = cv2.FONT_HERSHEY_SIMPLEX
                text_size = cv2.getTextSize(initials, font, 2, 3)[0]
                text_x = (img.shape[1] - text_size[0]) // 2
                text_y = (img.shape[0] + text_size[1]) // 2
                
                # White text
                cv2.putText(img, initials, (text_x, text_y), font, 2, (255, 255, 255), 3)
                
                # Save the image
                os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                cv2.imwrite(photo_path, img)
            
            manager = EventManager(**manager_data)
            db.session.add(manager)
        
        db.session.commit()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
app.config['UPLOAD_FOLDER'] = 'templates/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize models
def download_face_detection_model():
    try:
        model_path = os.path.join('models', 'buffalo_l')
        os.makedirs(model_path, exist_ok=True)
        
        # Download detection model
        det_model_path = os.path.join(model_path, 'det_10g.onnx')
        if not os.path.exists(det_model_path):
            logger.info("Downloading face detection model...")
            url = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip"
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
                    zip_ref.extractall(model_path)
                logger.info("Face detection model downloaded and extracted successfully")
            else:
                raise Exception(f"Failed to download face detection model. Status code: {response.status_code}")
        
        return model_path
    except Exception as e:
        logger.error(f"Error in download_face_detection_model: {str(e)}")
        logger.error(traceback.format_exc())
        raise

def create_demo_result(source_img, target_img, source_face, target_face):
    """
    Create a side-by-side visualization showing both the source and target images
    with face detection boxes. This is used when the face swap model is unavailable.
    """
    # Create copies of both images to draw on
    source_copy = source_img.copy()
    target_copy = target_img.copy()
    
    # Get the bounding boxes
    sx1, sy1, sx2, sy2 = [int(coord) for coord in source_face.bbox]
    tx1, ty1, tx2, ty2 = [int(coord) for coord in target_face.bbox]
    
    # Draw rectangles around the faces
    cv2.rectangle(source_copy, (sx1, sy1), (sx2, sy2), (0, 255, 0), 2)  # Green for source
    cv2.rectangle(target_copy, (tx1, ty1), (tx2, ty2), (0, 0, 255), 2)  # Red for target
    
    # Add labels
    cv2.putText(source_copy, "Source Face", (sx1, sy1-10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.putText(target_copy, "Target Face", (tx1, ty1-10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    
    # Create a side-by-side image
    # Resize images to the same height
    height = max(source_copy.shape[0], target_copy.shape[0])
    width_source = int(source_copy.shape[1] * height / source_copy.shape[0])
    width_target = int(target_copy.shape[1] * height / target_copy.shape[0])
    
    source_resized = cv2.resize(source_copy, (width_source, height))
    target_resized = cv2.resize(target_copy, (width_target, height))
    
    # Create the combined image
    total_width = width_source + width_target
    combined_img = np.zeros((height, total_width, 3), dtype=np.uint8)
    
    # Add both images to the combined one
    combined_img[:, :width_source] = source_resized
    combined_img[:, width_source:] = target_resized
    
    # Add a vertical line to separate the images
    cv2.line(combined_img, (width_source, 0), (width_source, height), (255, 255, 255), 2)
    
    # Add a title banner at the top
    banner_height = 60
    combined_with_banner = np.zeros((height + banner_height, total_width, 3), dtype=np.uint8)
    combined_with_banner[banner_height:, :] = combined_img
    
    # Add banner text
    cv2.putText(
        combined_with_banner, 
        "DEMONSTRATION MODE - Face Swap Model Not Available", 
        (20, 40), 
        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2
    )
    
    # Add arrow pointing from source face to target face
    arrow_start_x = width_source - 50
    arrow_end_x = width_source + 50
    arrow_y = height // 2
    cv2.arrowedLine(
        combined_with_banner, 
        (arrow_start_x, arrow_y), 
        (arrow_end_x, arrow_y), 
        (0, 255, 255), 2, tipLength=0.3
    )
    
    return combined_with_banner

def download_face_swap_model():
    """
    Download the face swap model from the provided Hugging Face repository.
    """
    try:
        model_path = os.path.join('models', 'inswapper_128.onnx')
        os.makedirs('models', exist_ok=True)
        
        # Check if we already have a valid model
        if os.path.exists(model_path):
            try:
                # Test if the file is a valid ONNX model
                import onnx
                onnx.load(model_path)
                logger.info(f"Existing model file at {model_path} is valid.")
                return model_path
            except Exception:
                logger.warning(f"Existing model file at {model_path} is invalid. Removing it.")
                os.remove(model_path)
        
        # At this point we need to download the model
        logger.info("Attempting to download face swap model...")
        success = False
        
        # Get Hugging Face token from environment variables
        hf_token = os.environ.get("HUGGINGFACE_TOKEN")
        if not hf_token:
            logger.warning("HUGGINGFACE_TOKEN environment variable not set")
        
        # Set up headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Add authorization if token is available
        if hf_token:
            headers['Authorization'] = f'Bearer {hf_token}'
            
            # Try to query the repository info to see its structure
            repo_info_url = "https://huggingface.co/api/models/foduucom/Headshot_Generator-FaceSwap"
            logger.info(f"Checking repository info: {repo_info_url}")
            try:
                repo_info_response = requests.get(repo_info_url, headers=headers)
                if repo_info_response.status_code == 200:
                    logger.info("Successfully accessed repository info")
                    # Parse repository info 
                    repo_info = repo_info_response.json()
                    logger.info(f"Repository info: {repo_info}")
                else:
                    logger.warning(f"Failed to access repository info: {repo_info_response.status_code}")
                    logger.warning(f"Response: {repo_info_response.text}")
            except Exception as e:
                logger.warning(f"Error accessing repository info: {str(e)}")
        
        # Try different possible paths and filenames for the Hugging Face model
        possible_urls = [
            # New repository
            "https://huggingface.co/foduucom/Headshot_Generator-FaceSwap/resolve/main/inswapper_128.onnx",
            "https://huggingface.co/foduucom/Headshot_Generator-FaceSwap/blob/main/inswapper_128.onnx",
            "https://huggingface.co/foduucom/Headshot_Generator-FaceSwap/resolve/main/models/inswapper_128.onnx",
            "https://huggingface.co/foduucom/Headshot_Generator-FaceSwap/resolve/main/assets/inswapper_128.onnx",
            "https://huggingface.co/foduucom/Headshot_Generator-FaceSwap/resolve/main/onnx/inswapper_128.onnx",
            # Original repository
            "https://huggingface.co/Olek03282255/faceswap_inswapper128_MVP/resolve/main/inswapper_128.onnx",
            "https://huggingface.co/Olek03282255/faceswap_inswapper128_MVP/resolve/main/insightface/inswapper_128.onnx",
            "https://huggingface.co/Olek03282255/faceswap_inswapper128_MVP/resolve/main/models/inswapper_128.onnx"
        ]
        
        # Try each possible URL
        for url in possible_urls:
            logger.info(f"Trying to download model from {url}")
            try:
                response = requests.get(url, headers=headers, stream=True)
                
                if response.status_code == 200:
                    logger.info("Model download successful, saving file...")
                    with open(model_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                    logger.info("Face swap model downloaded and saved successfully")
                    success = True
                    break
                else:
                    logger.warning(f"Failed to download from {url}, status code: {response.status_code}")
                    if response.text:
                        logger.warning(f"Response: {response.text}")
            except Exception as e:
                logger.warning(f"Error downloading from {url}: {str(e)}")
        
        if not success:
            logger.warning("Failed to download from any of the Hugging Face URLs")
        
        # If Hugging Face download failed, try fallback URLs
        if not success:
            fallback_urls = [
                "https://github.com/facefusion/facefusion-assets/releases/download/models/inswapper_128.onnx",
                "https://github.com/deepinsight/insightface/releases/download/v0.7/inswapper_128.onnx"
            ]
            
            for url in fallback_urls:
                try:
                    logger.info(f"Trying fallback URL: {url}")
                    response = requests.get(url, headers=headers, stream=True)
                    
                    if response.status_code == 200:
                        logger.info("Model download successful, saving file...")
                        with open(model_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                if chunk:
                                    f.write(chunk)
                        logger.info("Face swap model downloaded and saved successfully")
                        success = True
                        break
                    else:
                        logger.warning(f"Failed to download from {url}, status code: {response.status_code}")
                except Exception as e:
                    logger.warning(f"Error downloading from {url}: {str(e)}")
        
        if not success:
            logger.error("Failed to download model from all sources")
            raise Exception("Failed to download face swap model from all available sources")
        
        return model_path
    except Exception as e:
        logger.error(f"Error in download_face_swap_model: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize models
demo_mode = False
try:
    # First download and initialize face detection model
    logger.info("Starting model initialization...")
    det_model_path = download_face_detection_model()
    logger.info(f"Face detection model path: {det_model_path}")
    
    # Initialize face detection model with GPU support if available
    providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
    faceapp = FaceAnalysis(name='buffalo_l', providers=providers)
    faceapp.prepare(ctx_id=0, det_size=(640, 640))
    logger.info("Face detection model initialized successfully")
    
    try:
        # Then download and initialize face swap model
        swap_model_path = download_face_swap_model()
        logger.info(f"Face swap model path: {swap_model_path}")
        
        swapper = get_model(swap_model_path, providers=providers)
        logger.info("Face swap model initialized successfully")
        
        # Initialize face enhancer
        face_enhancer = FaceEnhancer()
        logger.info("Face enhancer initialized")
        
        print("All models loaded successfully!")
    except Exception as e:
        logger.warning(f"Failed to initialize face swap model: {str(e)}")
        logger.warning("Running in demonstration mode with visual indicators instead of actual face swapping")
        swapper = None
        face_enhancer = None
        demo_mode = True
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    logger.error(traceback.format_exc())
    faceapp = None
    swapper = None
    face_enhancer = None

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    # Render the React application directly
    return render_template('layout.html')

# Add route for direct React access without requiring the /react prefix
@app.route('/react')
@app.route('/react/<path:path>')
def react_direct(path=None):
    """Direct renderer for react routes"""
    return render_template('layout.html')
    
@app.route('/get_templates')
def get_templates_route():
    """
    API endpoint to get available templates for a specific category.
    This is a simplified version that directly serves templates from the Pinterest folder.
    
    Query parameters:
    - ceremony_type: For bridal ceremonies
    - category_type: 'bride' or 'groom'
    - subcategory: e.g., 'bridal', 'outfits', 'jewelry' 
    - item_category: Specific item category, e.g., 'haldi', 'casual', etc.
    """
    # Get query parameters
    ceremony_type = request.args.get('ceremony_type')
    category_type = request.args.get('category_type', 'bride')
    subcategory = request.args.get('subcategory', 'bridal')
    item_category = request.args.get('item_category', ceremony_type)
    
    # For compatibility with older code
    if ceremony_type and not item_category:
        item_category = ceremony_type
    
    if not item_category:
        return jsonify({'success': False, 'message': 'Missing required category parameter'}), 400
    
    # Create path to template directory
    if category_type == 'bride' and subcategory == 'bridal':
        template_dir = os.path.join('static', 'templates', 'bride', item_category)
    else:
        template_dir = os.path.join('static', 'templates', category_type, subcategory, item_category)
    
    # Check if directory exists
    if not os.path.exists(template_dir):
        # Try fallback directory
        fallback_dir = os.path.join('templates', 'uploads', 'pinterest', item_category)
        if os.path.exists(fallback_dir):
            template_dir = fallback_dir
        else:
            return jsonify({
                'success': False, 
                'message': f'No templates found for {item_category}',
                'templates': []
            }), 404
    
    # Get all image files in the directory
    template_files = [f for f in os.listdir(template_dir) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png')) and 
                     os.path.isfile(os.path.join(template_dir, f))]
    
    # Sort files to ensure consistent order
    template_files.sort()
    
    # Limit to 30 files for consistency
    template_files = template_files[:30]
    
    # Create template objects
    templates = []
    for i, filename in enumerate(template_files):
        template_path = os.path.join(template_dir, filename)
        template_url = f"/{template_path}"
        
        templates.append({
            "id": f"{item_category}_{i+1}",
            "path": template_path,
            "url": template_url,
            "category_type": category_type,
            "subcategory": subcategory,
            "item_category": item_category,
            "template_type": "pinterest"
        })
    
    # Return results
    return jsonify({
        'success': True,
        'templates': templates,
        'count': len(templates),
        'has_templates': len(templates) > 0,
        'category_type': category_type,
        'subcategory': subcategory,
        'item_category': item_category
    })

@app.route('/api/categories')
def api_categories():
    """
    API endpoint to get the categories structure for the Universal Face Swap page.
    Returns a JSON with hierarchical category data.
    """
    # Define the categories structure
    categories = [
        {
            "id": "bride",
            "key": "bride",
            "name": "Bride",
            "subcategories": [
                {
                    "id": "bridal",
                    "key": "bridal",
                    "name": "Bridal Ceremonies",
                    "items": [
                        {"id": "haldi", "key": "haldi", "name": "Haldi Ceremony"},
                        {"id": "mehendi", "key": "mehendi", "name": "Mehendi Ceremony"},
                        {"id": "sangeeth", "key": "sangeeth", "name": "Sangeeth Ceremony"},
                        {"id": "wedding", "key": "wedding", "name": "Wedding Ceremony"},
                        {"id": "reception", "key": "reception", "name": "Reception Ceremony"}
                    ]
                },
                {
                    "id": "outfits",
                    "key": "outfits",
                    "name": "Outfit Styles",
                    "items": [
                        {"id": "traditional", "key": "traditional", "name": "Traditional"},
                        {"id": "modern", "key": "modern", "name": "Modern"},
                        {"id": "fusion", "key": "fusion", "name": "Fusion"},
                        {"id": "casual", "key": "casual", "name": "Casual"}
                    ]
                },
                {
                    "id": "jewelry",
                    "key": "jewelry",
                    "name": "Jewelry Types",
                    "items": [
                        {"id": "necklace", "key": "necklace", "name": "Necklace Sets"},
                        {"id": "earrings", "key": "earrings", "name": "Earrings"},
                        {"id": "bangles", "key": "bangles", "name": "Bangles & Bracelets"},
                        {"id": "mang_tikka", "key": "mang_tikka", "name": "Mang Tikka"}
                    ]
                }
            ]
        },
        {
            "id": "groom",
            "key": "groom",
            "name": "Groom",
            "subcategories": [
                {
                    "id": "traditional",
                    "key": "traditional",
                    "name": "Traditional Wear",
                    "items": [
                        {"id": "sherwani", "key": "sherwani", "name": "Sherwani"},
                        {"id": "kurta", "key": "kurta", "name": "Kurta Pajama"},
                        {"id": "jodhpuri", "key": "jodhpuri", "name": "Jodhpuri Suit"},
                        {"id": "bandhgala", "key": "bandhgala", "name": "Bandhgala"}
                    ]
                },
                {
                    "id": "modern",
                    "key": "modern",
                    "name": "Modern Wear",
                    "items": [
                        {"id": "tuxedo", "key": "tuxedo", "name": "Tuxedo"},
                        {"id": "suit", "key": "suit", "name": "Formal Suit"},
                        {"id": "blazer", "key": "blazer", "name": "Blazer"},
                        {"id": "casual", "key": "casual", "name": "Casual Wear"}
                    ]
                }
            ]
        },
        {
            "id": "salon",
            "key": "salon",
            "name": "Salon",
            "subcategories": [
                {
                    "id": "men",
                    "key": "men",
                    "name": "Men",
                    "items": [
                        {"id": "haircut", "key": "haircut", "name": "Haircut Styles"},
                        {"id": "beard", "key": "beard", "name": "Beard Styles"},
                        {"id": "facial", "key": "facial", "name": "Facial Styles"},
                        {"id": "grooming", "key": "grooming", "name": "Grooming Styles"}
                    ]
                },
                {
                    "id": "women",
                    "key": "women",
                    "name": "Women",
                    "items": [
                        {"id": "haircut", "key": "haircut", "name": "Haircut Styles"},
                        {"id": "coloring", "key": "coloring", "name": "Hair Coloring"},
                        {"id": "styling", "key": "styling", "name": "Hair Styling"},
                        {"id": "facial", "key": "facial", "name": "Facial Styles"}
                    ]
                }
            ]
        },
        {
            "id": "celebrity",
            "key": "celebrity",
            "name": "Celebrity",
            "subcategories": [
                {
                    "id": "men",
                    "key": "men",
                    "name": "Men",
                    "items": [
                        {"id": "actors", "key": "actors", "name": "Actors"},
                        {"id": "singers", "key": "singers", "name": "Singers"},
                        {"id": "sports", "key": "sports", "name": "Sports Stars"},
                        {"id": "models", "key": "models", "name": "Models"}
                    ]
                },
                {
                    "id": "women",
                    "key": "women",
                    "name": "Women",
                    "items": [
                        {"id": "actresses", "key": "actresses", "name": "Actresses"},
                        {"id": "singers", "key": "singers", "name": "Singers"},
                        {"id": "models", "key": "models", "name": "Models"},
                        {"id": "sports", "key": "sports", "name": "Sports Stars"}
                    ]
                },
                {
                    "id": "tollywood",
                    "key": "tollywood",
                    "name": "Tollywood",
                    "items": [
                        {"id": "actors", "key": "actors", "name": "Actors"},
                        {"id": "actresses", "key": "actresses", "name": "Actresses"},
                        {"id": "classic", "key": "classic", "name": "Classic Stars"},
                        {"id": "new-gen", "key": "new-gen", "name": "New Generation"}
                    ]
                },
                {
                    "id": "bollywood",
                    "key": "bollywood",
                    "name": "Bollywood",
                    "items": [
                        {"id": "actors", "key": "actors", "name": "Actors"},
                        {"id": "actresses", "key": "actresses", "name": "Actresses"},
                        {"id": "classic", "key": "classic", "name": "Classic Stars"},
                        {"id": "new-gen", "key": "new-gen", "name": "New Generation"}
                    ]
                }
            ]
        }
    ]
    
    return jsonify({"success": True, "categories": categories})

@app.route('/api/menu')
def api_menu():
    """
    API endpoint to get the menu structure for the React sidebar.
    Returns a JSON object with the menu structure.
    """
    menu = [
        {
            "id": "bride",
            "title": "Bride",
            "icon": "fa-female",
            "subItems": [
                {"id": "bridal_gallery", "label": "Bridal Gallery", "link": "/bridal-gallery"},
                {"id": "bridal_swap", "label": "Create Bride Look", "link": "/bridal-swap"},
                {"id": "bridal_outfits", "label": "Bridal Outfits", "link": "/bridal-outfits"},
                {"id": "jewelry_collections", "label": "Jewelry Collections", "link": "/jewelry-collections"},
                {"id": "makeup_styles", "label": "Makeup Styles", "link": "/makeup-styles"}
            ]
        },
        {
            "id": "groom",
            "title": "Groom",
            "icon": "fa-male",
            "subItems": [
                {"id": "groom_face_swap", "label": "Create Groom Look", "link": "/groom-face-swap"},
                {"id": "traditional_wear", "label": "Traditional Wear", "link": "/traditional-wear"},
                {"id": "modern_suits", "label": "Modern Suits", "link": "/modern-suits"},
                {"id": "groom_accessories", "label": "Accessories", "link": "/groom-accessories"}
            ]
        },
        {
            "id": "celebrity",
            "title": "Celebrity",
            "icon": "fa-star",
            "subItems": [
                {"id": "celebrity_men", "label": "Men", "link": "/celebrity-men"},
                {"id": "celebrity_women", "label": "Women", "link": "/celebrity-women"},
                {"id": "celebrity_tollywood", "label": "Tollywood", "link": "/celebrity-tollywood"},
                {"id": "celebrity_bollywood", "label": "Bollywood", "link": "/celebrity-bollywood"},
                {"id": "celebrity_item", "label": "Item", "link": "/celebrity-item"}
            ]
        },
        {
            "id": "services",
            "title": "Services",
            "icon": "fa-concierge-bell",
            "subItems": [
                {"id": "venue_search", "label": "Venue Search", "link": "/venue-search"},
                {"id": "hall_comparison", "label": "Hall Comparison", "link": "/hall-comparison"},
                {"id": "virtual_tours", "label": "Virtual Tours", "link": "/virtual-tours"},
                {"id": "booking_management", "label": "Booking Management", "link": "/booking-management"},
                {"id": "saloons", "label": "Saloons", "link": "/saloons"},
                {"id": "event_managers", "label": "Event Managers", "link": "/event-managers"}
            ]
        }
    ]
    
    return jsonify(menu)

@app.route('/api/content/<path:page_id>')
def api_content(page_id):
    """
    API endpoint to get the content for a specific page.
    This allows the React app to fetch page content without full page reloads.
    
    Args:
        page_id: The ID of the page to fetch
        
    Returns:
        JSON object with the page content
    """
    # For now, just return a simple message
    # Later, we can implement actual content fetching based on page_id
    return jsonify({
        "title": page_id.replace('_', ' ').title(),
        "content": f"Content for {page_id} will be loaded here."
    })

@app.route('/bridal-gallery')
def bridal_gallery():
    # Get all template images organized by ceremony type
    template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
    
    # Define ceremony types
    ceremony_types = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    
    # Structure to store all templates
    all_templates = {}
    
    for ceremony in ceremony_types:
        # Set up structure for this ceremony
        all_templates[ceremony] = []
        
        # Get all Pinterest templates for this ceremony
        pinterest_dir = os.path.join(template_dir, 'pinterest', ceremony)
        if os.path.exists(pinterest_dir):
            for file in os.listdir(pinterest_dir):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    all_templates[ceremony].append({
                        'url': f"/templates/uploads/pinterest/{ceremony}/{file}",
                        'title': f"{ceremony.title()} Style",
                        'description': "Traditional ceremony template"
                    })
    
    return render_template(
        'bridal_gallery.html',
        all_templates=all_templates,
        ceremony_types=ceremony_types
    )

# Bride section routes
@app.route('/bridal-outfits')
def bridal_outfits():
    """Browse modern outfits for girls across different styles."""
    # Get available templates organized by category
    outfits_categories = {
        "casual": {"name": "Casual Wear", "templates": []},
        "formal": {"name": "Formal Attire", "templates": []},
        "party": {"name": "Party Dresses", "templates": []},
        "ethnic": {"name": "Ethnic Wear", "templates": []},
        "western": {"name": "Western Outfits", "templates": []}
    }
    
    outfits_dir = os.path.join(app.static_folder, 'templates', 'outfits')
    os.makedirs(outfits_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in outfits_categories:
        category_dir = os.path.join(outfits_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'outfits', category, file)
                    outfits_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('modern_outfits.html', categories=outfits_categories)

@app.route('/jewelry-collections')
def jewelry_collections():
    """Browse jewelry collections for different ceremonies and styles."""
    # Get available templates organized by category
    jewelry_categories = {
        "necklace": {"name": "Necklaces & Sets", "templates": []},
        "earrings": {"name": "Earrings", "templates": []},
        "maang_tikka": {"name": "Maang Tikka & Headpieces", "templates": []},
        "bangles": {"name": "Bangles & Bracelets", "templates": []},
        "rings": {"name": "Rings & Hand Accessories", "templates": []}
    }
    
    jewelry_dir = os.path.join(app.static_folder, 'templates', 'jewelry')
    os.makedirs(jewelry_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in jewelry_categories:
        category_dir = os.path.join(jewelry_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'jewelry', category, file)
                    jewelry_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('jewelry_collections.html', categories=jewelry_categories)

@app.route('/makeup-styles')
def makeup_styles():
    """Browse makeup styles for different ceremonies and looks."""
    # Get available templates organized by category
    makeup_categories = {
        "traditional": {"name": "Traditional Bridal", "templates": []},
        "modern": {"name": "Modern Glam", "templates": []},
        "natural": {"name": "Natural & Subtle", "templates": []},
        "bold": {"name": "Bold & Dramatic", "templates": []},
        "reception": {"name": "Reception Looks", "templates": []}
    }
    
    makeup_dir = os.path.join(app.static_folder, 'templates', 'makeup')
    os.makedirs(makeup_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in makeup_categories:
        category_dir = os.path.join(makeup_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'makeup', category, file)
                    makeup_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('makeup_styles.html', categories=makeup_categories)

# Groom section routes
@app.route('/groom-face-swap')
def groom_face_swap():
    return render_template('groom/face_swap.html')

@app.route('/traditional-wear')
def traditional_wear():
    """Browse traditional wear for grooms across different styles."""
    # Get available templates organized by category
    traditional_categories = {
        "sherwani": {"name": "Sherwanis", "templates": []},
        "kurta": {"name": "Kurta Pajamas", "templates": []},
        "indo_western": {"name": "Indo-Western", "templates": []},
        "dhoti": {"name": "Dhoti Sets", "templates": []},
        "jodhpuri": {"name": "Jodhpuri Suits", "templates": []}
    }
    
    traditional_dir = os.path.join(app.static_folder, 'templates', 'groom', 'traditional')
    os.makedirs(traditional_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in traditional_categories:
        category_dir = os.path.join(traditional_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'groom', 'traditional', category, file)
                    traditional_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('groom/traditional_wear.html', categories=traditional_categories)

@app.route('/modern-suits')
def modern_suits():
    """Browse modern suits and formal wear for grooms."""
    # Get available templates organized by category
    suits_categories = {
        "tuxedos": {"name": "Tuxedos", "templates": []},
        "three_piece": {"name": "Three Piece Suits", "templates": []},
        "two_piece": {"name": "Two Piece Suits", "templates": []},
        "blazers": {"name": "Blazers & Separates", "templates": []},
        "casual": {"name": "Casual & Smart Casual", "templates": []}
    }
    
    suits_dir = os.path.join(app.static_folder, 'templates', 'groom', 'suits')
    os.makedirs(suits_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in suits_categories:
        category_dir = os.path.join(suits_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'groom', 'suits', category, file)
                    suits_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('groom/modern_suits.html', categories=suits_categories)

@app.route('/groom-accessories')
def groom_accessories():
    """Browse accessories for grooms."""
    # Get available templates organized by category
    accessories_categories = {
        "watches": {"name": "Watches", "templates": []},
        "cufflinks": {"name": "Cufflinks", "templates": []},
        "ties": {"name": "Ties & Bow Ties", "templates": []},
        "pocket_squares": {"name": "Pocket Squares", "templates": []},
        "shoes": {"name": "Formal Shoes", "templates": []}
    }
    
    accessories_dir = os.path.join(app.static_folder, 'templates', 'groom', 'accessories')
    os.makedirs(accessories_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in accessories_categories:
        category_dir = os.path.join(accessories_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'groom', 'accessories', category, file)
                    accessories_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('groom/accessories.html', categories=accessories_categories)

# Celebrity section routes
@app.route('/celebrity-men')
def celebrity_men():
    """Browse men celebrity templates."""
    # Get available templates organized by category
    men_categories = {
        "actors": {"name": "Actors", "templates": []},
        "singers": {"name": "Singers", "templates": []},
        "sports": {"name": "Sports Stars", "templates": []},
        "models": {"name": "Models", "templates": []}
    }
    
    men_dir = os.path.join(app.static_folder, 'templates', 'celebrity', 'men')
    os.makedirs(men_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in men_categories:
        category_dir = os.path.join(men_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'celebrity', 'men', category, file)
                    men_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('celebrity/men.html', categories=men_categories)

@app.route('/celebrity-women')
def celebrity_women():
    """Browse women celebrity templates."""
    # Get available templates organized by category
    women_categories = {
        "actresses": {"name": "Actresses", "templates": []},
        "singers": {"name": "Singers", "templates": []},
        "models": {"name": "Models", "templates": []},
        "sports": {"name": "Sports Stars", "templates": []}
    }
    
    women_dir = os.path.join(app.static_folder, 'templates', 'celebrity', 'women')
    os.makedirs(women_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in women_categories:
        category_dir = os.path.join(women_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'celebrity', 'women', category, file)
                    women_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('celebrity/women.html', categories=women_categories)

@app.route('/celebrity-tollywood')
def celebrity_tollywood():
    """Browse Tollywood celebrity templates."""
    # Get available templates organized by category
    tollywood_categories = {
        "actors": {"name": "Actors", "templates": []},
        "actresses": {"name": "Actresses", "templates": []},
        "classic": {"name": "Classic Stars", "templates": []},
        "new-gen": {"name": "New Generation", "templates": []}
    }
    
    tollywood_dir = os.path.join(app.static_folder, 'templates', 'celebrity', 'tollywood')
    os.makedirs(tollywood_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in tollywood_categories:
        category_dir = os.path.join(tollywood_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'celebrity', 'tollywood', category, file)
                    tollywood_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('celebrity/tollywood.html', categories=tollywood_categories)

@app.route('/celebrity-bollywood')
def celebrity_bollywood():
    """Browse Bollywood celebrity templates."""
    # Get available templates organized by category
    bollywood_categories = {
        "actors": {"name": "Actors", "templates": []},
        "actresses": {"name": "Actresses", "templates": []},
        "classic": {"name": "Classic Stars", "templates": []},
        "new-gen": {"name": "New Generation", "templates": []}
    }
    
    bollywood_dir = os.path.join(app.static_folder, 'templates', 'celebrity', 'bollywood')
    os.makedirs(bollywood_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in bollywood_categories:
        category_dir = os.path.join(bollywood_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'celebrity', 'bollywood', category, file)
                    bollywood_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('celebrity/bollywood.html', categories=bollywood_categories)

@app.route('/celebrity-item')
def celebrity_item():
    """Browse item celebrity templates."""
    # Get available templates organized by category
    item_categories = {
        "international": {"name": "International", "templates": []},
        "influencers": {"name": "Influencers", "templates": []},
        "trending": {"name": "Trending", "templates": []},
        "historical": {"name": "Historical", "templates": []}
    }
    
    item_dir = os.path.join(app.static_folder, 'templates', 'celebrity', 'item')
    os.makedirs(item_dir, exist_ok=True)
    
    # Scan for template images in each category directory
    for category in item_categories:
        category_dir = os.path.join(item_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        if os.path.exists(category_dir):
            for file in os.listdir(category_dir):
                if allowed_file(file):
                    template_path = os.path.join('templates', 'celebrity', 'item', category, file)
                    item_categories[category]["templates"].append({
                        "path": template_path,
                        "url": url_for('static', filename=template_path)
                    })
    
    return render_template('celebrity/item.html', categories=item_categories)

# Convention halls section routes
@app.route('/venue-search')
def venue_search():
    return render_template('venues/search.html')

@app.route('/hall-comparison')
def hall_comparison():
    return render_template('venues/comparison.html')

@app.route('/virtual-tours')
def virtual_tours():
    return render_template('venues/tours.html')

@app.route('/booking-management')
def booking_management():
    return render_template('venues/booking.html')

@app.route('/saloons')
def saloons():
    """Browse saloons and makeup artists for wedding preparation."""
    return render_template('saloons.html')

# Event Manager section routes
@app.route('/event-managers')
def event_managers():
    # Import the EventManager model
    from models import EventManager
    
    # Get filter parameters from query string
    location = request.args.get('location', '')
    price_range = request.args.get('price_range', '')
    specialization = request.args.get('specialization', '')
    rating = request.args.get('rating', '')
    service_category = request.args.get('service_category', '')
    
    # Start with all event managers
    query = EventManager.query
    
    # Apply filters if provided
    if location:
        query = query.filter(EventManager.location.ilike(f'%{location}%'))
    if price_range:
        query = query.filter(EventManager.price_range == price_range)
    if specialization:
        query = query.filter(EventManager.specialization.ilike(f'%{specialization}%'))
    if rating:
        # Convert rating to float and filter for managers with that rating or higher
        try:
            min_rating = float(rating)
            query = query.filter(EventManager.rating >= min_rating)
        except ValueError:
            pass
    if service_category:
        # Filter by service category (comma-separated list in database)
        query = query.filter(EventManager.service_categories.ilike(f'%{service_category}%'))
    
    # Get all event managers after applying filters
    event_managers = query.all()
    
    # Get unique locations, specializations, and service categories for filter dropdowns
    all_managers = EventManager.query.all()
    locations = set()
    specializations = set()
    service_categories = set()
    price_ranges = set()
    
    for manager in all_managers:
        # Add locations
        if manager.location:
            for loc in manager.location.split(','):
                locations.add(loc.strip())
        
        # Add specialization
        if manager.specialization:
            specializations.add(manager.specialization)
        
        # Add service categories
        if manager.service_categories:
            for cat in manager.service_categories.split(','):
                service_categories.add(cat.strip())
        
        # Add price ranges
        if manager.price_range:
            price_ranges.add(manager.price_range)
    
    # Sort the sets for consistent display
    locations = sorted(list(locations))
    specializations = sorted(list(specializations))
    service_categories = sorted(list(service_categories))
    price_ranges = sorted(list(price_ranges))
    
    return render_template(
        'event_manager/managers.html',
        event_managers=event_managers,
        locations=locations,
        specializations=specializations,
        service_categories=service_categories,
        price_ranges=price_ranges,
        selected_location=location,
        selected_price_range=price_range,
        selected_specialization=specialization,
        selected_rating=rating,
        selected_service_category=service_category
    )

@app.route('/delete-templates', methods=['POST'])
def delete_templates():
    """
    Delete selected templates or all templates for a specific category.
    Expected JSON payload: 
    - For specific templates: { template_paths: [path1, path2, ...] }
    - For clearing all bridal ceremony templates: { category_type: "bride", subcategory: "bridal", item_category: "haldi", clear_all: true }
    - For clearing all other category templates: { category_type: "bride", subcategory: "outfits", item_category: "casual", clear_all: true }
    """
    if not request.is_json:
        return jsonify({"success": False, "message": "Expected JSON payload"}), 400
    
    data = request.get_json()
    template_paths = data.get('template_paths', [])
    category_type = data.get('category_type')
    subcategory = data.get('subcategory')
    item_category = data.get('item_category')
    clear_all = data.get('clear_all', False)
    
    # Backward compatibility for old ceremony_type format
    ceremony_type = data.get('ceremony_type')
    if ceremony_type and clear_all:
        category_type = 'bride'
        subcategory = 'bridal'
        item_category = ceremony_type
    
    # Handle clearing all templates for a category
    if clear_all and category_type and subcategory and item_category:
        # Define valid categories
        valid_categories = {
            'bride': {
                'bridal': ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'],
                'outfits': ['casual', 'formal', 'party', 'ethnic', 'western'],
                'jewelry': ['necklaces', 'earrings', 'maang_tikka', 'bangles', 'rings'],
                'makeup': ['traditional', 'modern', 'natural', 'bold', 'reception']
            },
            'groom': {
                'traditional': ['sherwani', 'kurta', 'indo_western', 'dhoti', 'jodhpuri'],
                'suits': ['tuxedos', 'three_piece', 'two_piece', 'blazers', 'casual'],
                'accessories': ['watches', 'cufflinks', 'ties', 'pocket_squares', 'shoes']
            },
            'celebrity': {
                'men': ['actors', 'singers', 'sports', 'models'],
                'women': ['actresses', 'singers', 'models', 'sports'],
                'tollywood': ['actors', 'actresses', 'classic', 'new-gen'],
                'bollywood': ['actors', 'actresses', 'classic', 'new-gen'],
                'item': ['international', 'influencers', 'trending', 'historical']
            }
        }
        
        # Validate category information
        if (category_type not in valid_categories or 
            subcategory not in valid_categories[category_type] or 
            item_category not in valid_categories[category_type][subcategory]):
            return jsonify({"success": False, "message": "Invalid category combination"}), 400
        
        deleted_count = 0
        errors = []
        
        try:
            # Handle bridal ceremony templates specially since they're in uploads/templates
            if category_type == 'bride' and subcategory == 'bridal':
                template_types = ['ai', 'natural', 'real', 'pinterest']
                template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
                
                # Clear all template files for the ceremony in the main directory
                for template_type in template_types:
                    main_path = os.path.join(template_dir, f"{item_category}_{template_type}.jpg")
                    if os.path.exists(main_path):
                        os.remove(main_path)
                        deleted_count += 1
                        app.logger.info(f"Deleted main template: {main_path}")
                
                # Clear all templates in subdirectories
                for template_type in template_types:
                    type_dir = os.path.join(template_dir, template_type)
                    
                    # Delete the standard template file
                    standard_path = os.path.join(type_dir, f"{item_category}.jpg")
                    if os.path.exists(standard_path):
                        os.remove(standard_path)
                        deleted_count += 1
                        app.logger.info(f"Deleted standard template: {standard_path}")
                    
                    # Check for ceremony-specific directory
                    ceremony_dir = os.path.join(type_dir, item_category)
                    if os.path.exists(ceremony_dir) and os.path.isdir(ceremony_dir):
                        for file in os.listdir(ceremony_dir):
                            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                                file_path = os.path.join(ceremony_dir, file)
                                if os.path.isfile(file_path):
                                    os.remove(file_path)
                                    deleted_count += 1
                                    app.logger.info(f"Deleted template: {file_path}")
            else:
                # Handle other category types in static/templates
                if category_type == 'bride':
                    target_dir = os.path.join(app.static_folder, 'templates', subcategory, item_category)
                else:  # groom categories
                    target_dir = os.path.join(app.static_folder, 'templates', 'groom', subcategory, item_category)
                
                if os.path.exists(target_dir) and os.path.isdir(target_dir):
                    for file in os.listdir(target_dir):
                        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                            file_path = os.path.join(target_dir, file)
                            if os.path.isfile(file_path):
                                os.remove(file_path)
                                deleted_count += 1
                                app.logger.info(f"Deleted template: {file_path}")
            
            return jsonify({
                "success": True,
                "deleted_count": deleted_count,
                "category": f"{category_type}/{subcategory}/{item_category}",
                "message": f"Cleared all templates for {category_type}/{subcategory}/{item_category}"
            })
            
        except Exception as e:
            app.logger.error(f"Error clearing templates: {str(e)}")
            return jsonify({
                "success": False,
                "message": f"Error clearing templates: {str(e)}"
            }), 500
    
    # Handle deleting specific template paths
    if not template_paths:
        return jsonify({"success": False, "message": "No template paths provided"}), 400
    
    deleted_count = 0
    errors = []
    
    for path in template_paths:
        try:
            # Validate the path - ensure it has a valid prefix
            valid_prefixes = [
                '/templates/uploads/', 'templates/uploads/',
                '/uploads/templates/', 'uploads/templates/',
                '/static/templates/', 'static/templates/'
            ]
            
            is_valid_path = any(path.startswith(prefix) for prefix in valid_prefixes)
            if not path or not is_valid_path:
                errors.append(f"Invalid path: {path}")
                continue
                
            # Convert relative URLs to filesystem paths
            if path.startswith('/'):
                # Remove leading slash for filesystem path
                fs_path = path[1:]
            else:
                fs_path = path
                
            app.logger.info(f"Attempting to delete template: {fs_path}")
                
            # Ensure the path exists
            if not os.path.exists(fs_path):
                errors.append(f"File not found: {fs_path}")
                continue
                
            # Delete the file
            os.remove(fs_path)
            deleted_count += 1
            app.logger.info(f"Deleted template: {fs_path}")
            
        except Exception as e:
            errors.append(f"Error deleting {path}: {str(e)}")
            app.logger.error(f"Exception during delete: {str(e)}")
    
    return jsonify({
        "success": True,
        "deleted_count": deleted_count,
        "errors": errors
    })

@app.route('/bulk-upload')
def bulk_upload_page():
    """Display the bulk template upload page."""
    # Define all available categories
    categories = {
        'bride': {
            'bridal': ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'],
            'outfits': ['casual', 'formal', 'party', 'ethnic', 'western'],
            'jewelry': ['necklaces', 'earrings', 'maang_tikka', 'bangles', 'rings'],
            'makeup': ['traditional', 'modern', 'natural', 'bold', 'reception']
        },
        'groom': {
            'traditional': ['sherwani', 'kurta', 'indo_western', 'dhoti', 'jodhpuri'],
            'suits': ['tuxedos', 'three_piece', 'two_piece', 'blazers', 'casual'],
            'accessories': ['watches', 'cufflinks', 'ties', 'pocket_squares', 'shoes']
        },
        'celebrity': {
            'men': ['actors', 'singers', 'sports', 'models'],
            'women': ['actresses', 'singers', 'models', 'sports'],
            'tollywood': ['actors', 'actresses', 'classic', 'new-gen'],
            'bollywood': ['actors', 'actresses', 'classic', 'new-gen'],
            'item': ['international', 'influencers', 'trending', 'historical']
        }
    }
    
    return render_template('bulk_upload.html', categories=categories)

@app.route('/upload-bulk-templates', methods=['POST'])
def upload_bulk_templates():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    category_type = request.form.get('category_type')
    subcategory = request.form.get('subcategory')
    item_category = request.form.get('item_category')

    # Define the categories structure (same as /api/categories)
    categories = {
        'bride': {
            'bridal': ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'],
            'outfits': ['traditional', 'modern', 'fusion', 'casual'],
            'jewelry': ['necklace', 'earrings', 'bangles', 'mang_tikka']
        },
        'groom': {
            'traditional': ['sherwani', 'kurta', 'jodhpuri', 'bandhgala'],
            'modern': ['tuxedo', 'suit', 'blazer', 'casual']
        },
        'salon': {
            'men': ['haircut', 'beard', 'facial', 'grooming'],
            'women': ['haircut', 'coloring', 'styling', 'facial']
        },
        'celebrity': {
            'men': ['actors', 'singers', 'sports', 'models'],
            'women': ['actresses', 'singers', 'models', 'sports'],
            'tollywood': ['actors', 'actresses', 'classic', 'new-gen'],
            'bollywood': ['actors', 'actresses', 'classic', 'new-gen']
        }
    }

    # Validate category parameters
    if (category_type not in categories or 
        subcategory not in categories[category_type] or 
        item_category not in categories[category_type][subcategory]):
        return jsonify({'error': 'Invalid category combination'}), 400

    files = request.files.getlist('files')
    if not files or len(files) == 0:
        return jsonify({'error': 'No files selected'}), 400

    # Build the target directory path
    target_dir = os.path.join('static', 'templates', category_type, subcategory, item_category)
    os.makedirs(target_dir, exist_ok=True)

    uploaded_files = []
    timestamp = int(time.time())
    for idx, file in enumerate(files):
        if file and allowed_file(file.filename):
            ext = os.path.splitext(secure_filename(file.filename))[1] or '.jpg'
            filename = f"{category_type}_{subcategory}_{item_category}_{timestamp}_{idx+1}{ext}"
            filepath = os.path.join(target_dir, filename)
            file.save(filepath)
            uploaded_files.append(filepath)

    if not uploaded_files:
        return jsonify({'error': 'No valid files were uploaded'}), 400

    return jsonify({
        'success': True,
        'uploaded_count': len(uploaded_files),
        'uploaded_files': uploaded_files
    })

@app.route('/bridal-multi-swap', methods=['GET'])
def bridal_multi_swap():
    """Show the multi-template swap page."""
    ceremony = request.args.get('ceremony', 'wedding')
    return render_template('bridal_multi_swap.html', selected_ceremony=ceremony)

@app.route('/multi_face_swap', methods=['POST'])
def multi_face_swap():
    """
    Process multiple templates with the same source face.
    Expects:
    - source: uploaded image file
    - templates[]: array of template paths
    Returns:
    - JSON with results or error message
    """
    if faceapp is None or swapper is None:
        return jsonify({'success': False, 'error': 'Models not loaded. Please check server logs.'}), 500
        
    if 'source' not in request.files:
        return jsonify({'success': False, 'error': 'No source image provided'})
    
    source_file = request.files['source']
    if source_file.filename == '':
        return jsonify({'success': False, 'error': 'No source image selected'})
    
    if not allowed_file(source_file.filename):
        return jsonify({'success': False, 'error': 'Invalid file format'})
    
    # Get template paths from the form
    template_paths = request.form.getlist('templates[]')
    if not template_paths:
        return jsonify({'success': False, 'error': 'No templates selected'})
    
    # Get enhancement options
    enhance = request.form.get('enhance', 'false').lower() == 'true'
    enhance_method = request.form.get('enhance_method', 'auto')
    
    try:
        # Save the source image to a temporary location
        source_filename = secure_filename(source_file.filename)
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], 'sources', source_filename)
        os.makedirs(os.path.dirname(source_path), exist_ok=True)
        source_file.save(source_path)
        
        # Load the source image and detect faces
        source_img = cv2.imread(source_path)
        if source_img is None:
            return jsonify({'success': False, 'error': 'Could not load source image'})
            
        source_faces = faceapp.get(source_img)
        if not source_faces:
            return jsonify({'success': False, 'error': 'No face detected in source image'})
            
        # Process each template
        results = []
        
        for template_path in template_paths:
            try:
                # Load the template image and detect faces
                template_img = cv2.imread(template_path)
                if template_img is None:
                    continue
                    
                target_faces = faceapp.get(template_img)
                if not target_faces:
                    continue
                    
                # Perform face swap
                result_img = swapper.get(template_img, target_faces[0], source_faces[0], paste_back=True)
                
                # Apply face enhancement if requested
                enhanced = False
                if enhance:
                    try:
                        app.logger.info(f"Applying face enhancement with method: {enhance_method}")
                        # Initialize face_enhancer if not already initialized
                        global face_enhancer
                        if face_enhancer is None:
                            from face_enhancer import FaceEnhancer
                            face_enhancer = FaceEnhancer()
                            app.logger.info("Face enhancer initialized")
                        
                        if hasattr(face_enhancer, 'enhance_face'):
                            result_img, enhanced = face_enhancer.enhance_face(result_img, method=enhance_method)
                            if enhanced:
                                app.logger.info("Face enhancement applied successfully")
                        else:
                            app.logger.warning("Face enhancer doesn't have enhance_face method")
                    except Exception as e:
                        app.logger.error(f"Face enhancement failed: {str(e)}")
                        import traceback
                        app.logger.error(traceback.format_exc())
                        # Continue with the unenhanced result
                
                # Save result
                timestamp = int(time.time())
                result_filename = f"result_{timestamp}_{os.path.basename(template_path)}"
                
                # Save to static folder for direct web access
                result_path = os.path.join('static/results', result_filename)
                
                # Create results directory if it doesn't exist
                os.makedirs(os.path.dirname(result_path), exist_ok=True)
                
                # Debug logging
                app.logger.info(f"Saving multi-swap result to: {result_path}")
                
                # Save the result
                cv2.imwrite(result_path, result_img)
                
                # Add to results
                results.append({
                    'template_path': template_path,
                    'result_path': result_path,
                    'url': f"/static/results/{result_filename}",
                    'enhanced': enhanced,
                    'enhance_method': enhance_method if enhanced else None
                })
            except Exception as template_error:
                app.logger.error(f"Error processing template {template_path}: {str(template_error)}")
                # Continue with next template
        
        app.logger.info(f"Multi-swap completed with {len(results)} successful results")
        
        # Return all results
        return jsonify({
            'success': True,
            'results': results,
            'message': f'Processed {len(results)} templates successfully'
        })
        
    except Exception as e:
        app.logger.error(f"Error in multi-face swap: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/bridal_results')
def bridal_results():
    """Show results from multi-template processing"""
    source_path = session.get('source_path')
    template_paths = session.get('template_paths', [])
    
    if not source_path or not template_paths:
        return redirect(url_for('bridal_gallery'))
    
    # Process will happen on this page with JavaScript
    return render_template('bridal_results.html', 
                          source_path=source_path,
                          template_paths=template_paths)

@app.route('/process_template', methods=['POST'])
def process_template():
    try:
        # Get the template path from the request
        template_path = request.form.get('template_path')
        if not template_path:
            return jsonify({'success': False, 'error': 'No template path provided'}), 400

        # Get enhancement options
        enhance = request.form.get('enhance') == 'true'
        enhance_method = request.form.get('enhance_method', 'gfpgan')

        # Read the template image
        template_img = cv2.imread(template_path)
        if template_img is None:
            return jsonify({'success': False, 'error': 'Failed to read template image'}), 400

        # Detect face in template
        target_faces = faceapp.get(template_img)
        if not target_faces:
            return jsonify({'success': False, 'error': 'No face detected in template'}), 400

        # Get the source image from the request
        if 'source' not in request.files:
            return jsonify({'success': False, 'error': 'No source file provided'}), 400

        source_file = request.files['source']
        if source_file.filename == '':
            return jsonify({'success': False, 'error': 'No selected file'}), 400

        # Save the source file temporarily
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(source_file.filename))
        source_file.save(source_path)

        # Read the source image
        source_img = cv2.imread(source_path)
        if source_img is None:
            return jsonify({'success': False, 'error': 'Failed to read source image'}), 400

        # Detect face in source image
        source_faces = faceapp.get(source_img)
        if not source_faces:
            return jsonify({'success': False, 'error': 'No face detected in source image'}), 400

        # Get face detection results
        source_face = source_faces[0]
        target_face = target_faces[0]

        # Perform the swap
        result_img = swapper.get(template_img, target_face, source_face, paste_back=True)

        # Apply face enhancement if requested
        enhanced = False
        if enhance:
            try:
                # Initialize the face enhancer if not already initialized
                global face_enhancer
                if face_enhancer is None:
                    from face_enhancer import FaceEnhancer
                    face_enhancer = FaceEnhancer()
                app.logger.info(f"Applying face enhancement with method: {enhance_method}")
                
                # Apply face enhancement
                result_img = face_enhancer.enhance(result_img, method=enhance_method, strength=0.8)
                app.logger.info("Face enhancement applied successfully")
                enhanced = True
            except Exception as e:
                app.logger.error(f"Face enhancement failed: {str(e)}")
                # Continue with the unenhanced result
        
        # Save result
        timestamp = int(time.time())
        result_filename = f"result_{timestamp}_{os.path.basename(template_path)}"
        
        # Save to static folder for direct web access
        result_path = os.path.join('static/results', result_filename)
        
        # Create results directory if it doesn't exist
        os.makedirs(os.path.dirname(result_path), exist_ok=True)
        
        # Debug logging
        app.logger.info(f"Saving result to: {result_path}")
        
        # Save the result
        cv2.imwrite(result_path, result_img)
        
        # Return the result path for display
        # Make the path directly usable by the browser
        result_url = f"/static/results/{os.path.basename(result_filename)}"
        
        # Get template information from path for display purposes
        template_id = os.path.basename(template_path).split('.')[0]
        
        response_data = {
            'success': True,
            'result_path': result_url,
            'enhanced': enhanced,
            'enhance_method': enhance_method if enhanced else None,
            'template_path': template_path,
            'template_id': template_id
        }
        
        app.logger.info(f"Returning response: {response_data}")
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"Error processing template: {str(e)}")
        import traceback
        app.logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)})

@app.route('/bridal-swap', methods=['GET', 'POST'])
def bridal_swap():
    if request.method == 'GET':
        return render_template('bridal_swap.html')

    if 'source' not in request.files:
        return jsonify({'error': 'No source file provided'}), 400
    
    source_file = request.files['source']
    if source_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Get template paths from form data
    template_paths = []
    ceremonies = []
    
    # Check if this is a multi-template request
    is_multi_request = request.form.get('multi') == 'true'
    
    if is_multi_request:
        # Get templates from the array and remove any duplicates
        templates = list(set(request.form.getlist('templates[]')))
        if not templates:
            return jsonify({'error': 'No templates provided'}), 400
        template_paths = templates
    else:
        # Single template request
        template_path = request.form.get('template_path')
        if not template_path:
            return jsonify({'error': 'No template path provided'}), 400
        template_paths = [template_path]
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join('templates', 'uploads', 'sources')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the source file temporarily with a unique name
        timestamp = int(time.time())
        source_filename = f"source_{timestamp}_{secure_filename(source_file.filename)}"
        source_path = os.path.join(upload_dir, source_filename)
        source_file.save(source_path)
        
        # Read the source image for face detection
        source_img = cv2.imread(source_path)
        
        if source_img is None:
            return jsonify({'error': 'Failed to read source image'}), 400
        
        # Detect face in source image
        source_faces = faceapp.get(source_img)
        
        if not source_faces:
            return jsonify({'error': 'No face detected in your photo. Please upload a clear photo with your face visible.'}), 400
        
        # Process templates
        results = []
        processed_paths = set()  # Keep track of processed paths to avoid duplicates
        
        for i, template_path in enumerate(template_paths):
            # Skip if we've already processed this template
            if template_path in processed_paths:
                continue
                
            try:
                # Extract ceremony type from template path
                ceremony = os.path.basename(template_path).split('_')[0]
                ceremonies.append(ceremony)
                
                # Read template image
                template_img = cv2.imread(template_path)
                if template_img is None:
                    logger.error(f"Failed to read template image: {template_path}")
                    continue
                
                # Detect face in template
                target_faces = faceapp.get(template_img)
                if not target_faces:
                    logger.error(f"No face detected in template: {template_path}")
                    continue
                
                # Get face detection results
                source_face = source_faces[0]
                target_face = target_faces[0]
                
                # Perform the swap
                result_img = swapper.get(template_img, target_face, source_face, paste_back=True)
                
                # Apply face enhancement if requested
                if request.form.get('enhance') == 'true':
                    try:
                        # Initialize the face enhancer if not already initialized
                        global face_enhancer
                        if face_enhancer is None:
                            from face_enhancer import FaceEnhancer
                            face_enhancer = FaceEnhancer()
                        
                        # Apply face enhancement
                        enhance_method = request.form.get('enhance_method', 'gfpgan')
                        result_img = face_enhancer.enhance(result_img, method=enhance_method, strength=0.8)
                    except Exception as e:
                        logger.error(f"Face enhancement failed: {str(e)}")
                        # Continue with the unenhanced result
                
                # Create results directory if it doesn't exist
                results_dir = os.path.join('static', 'results')
                os.makedirs(results_dir, exist_ok=True)
                
                # Save result with unique filename per template
                result_filename = f"{ceremony}_{timestamp}_{i}_{os.path.basename(template_path)}"
                result_path = os.path.join(results_dir, result_filename)
                
                # Save the result
                cv2.imwrite(result_path, result_img)
                
                # Add to results
                results.append({
                    'result_image': f'/static/results/{result_filename}',
                    'template_path': template_path,
                    'ceremony': ceremony,
                    'index': i
                })
                
                # Mark this template as processed
                processed_paths.add(template_path)
                
            except Exception as e:
                logger.error(f"Error processing template {i+1}/{len(template_paths)}: {str(e)}")
                # Continue with next template
        
        # Clean up source file
        try:
            os.remove(source_path)
        except Exception as e:
            logger.error(f"Error cleaning up source file: {str(e)}")
        
        if not results:
            return jsonify({'success': False, 'error': 'Failed to process any templates. Please try again.'}), 500
        
        # Return all results
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error in bridal_swap: {str(e)}")
        logger.error(traceback.format_exc())
        # Clean up files in case of error
        if 'source_path' in locals() and os.path.exists(source_path):
            try:
                os.remove(source_path)
            except Exception as cleanup_error:
                logger.error(f"Error cleaning up source file: {str(cleanup_error)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """
    API endpoint to get available templates for a specific category.
    Returns templates for the requested category with URLs for display.
    
    Query parameters:
    - category_type: Main category (bride, groom, salon, celebrity)
    - subcategory: Subcategory within the main category
    - item_category: Specific item within the subcategory
    """
    # Get category parameters
    category_type = request.args.get('category_type')
    subcategory = request.args.get('subcategory')
    item_category = request.args.get('item_category')
    
    if not all([category_type, subcategory, item_category]):
        return jsonify({'error': 'Missing required category parameters'}), 400
    
    # Define valid categories based on the new structure
    valid_categories = {
        'bride': {
            'bridal': ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'],
            'outfits': ['traditional', 'modern', 'fusion', 'casual'],
            'jewelry': ['necklace', 'earrings', 'bangles', 'mang_tikka']
        },
        'groom': {
            'traditional': ['sherwani', 'kurta', 'jodhpuri', 'bandhgala'],
            'modern': ['tuxedo', 'suit', 'blazer', 'casual']
        },
        'salon': {
            'men': ['haircut', 'beard', 'facial', 'grooming'],
            'women': ['haircut', 'coloring', 'styling', 'facial']
        },
        'celebrity': {
            'men': ['actors', 'singers', 'sports', 'models'],
            'women': ['actresses', 'singers', 'models', 'sports'],
            'tollywood': ['actors', 'actresses', 'classic', 'new-gen'],
            'bollywood': ['actors', 'actresses', 'classic', 'new-gen']
        }
    }
    
    # Validate category parameters
    if (category_type not in valid_categories or 
        subcategory not in valid_categories[category_type] or 
        item_category not in valid_categories[category_type][subcategory]):
        return jsonify({'error': 'Invalid category combination'}), 400
    
    # Determine the target directory based on category type
    if category_type == 'bride':
        if subcategory == 'bridal':
            target_dir = os.path.join(app.static_folder, 'templates', category_type, item_category)
        else:
            target_dir = os.path.join(app.static_folder, 'templates', category_type, subcategory, item_category)
    elif category_type == 'groom':
        target_dir = os.path.join(app.static_folder, 'templates', category_type, subcategory, item_category)
    elif category_type == 'salon':
        target_dir = os.path.join(app.static_folder, 'templates', category_type, subcategory, item_category)
    elif category_type == 'celebrity':
        target_dir = os.path.join(app.static_folder, 'templates', category_type, subcategory, item_category)
    
    # Create directory if it doesn't exist
    os.makedirs(target_dir, exist_ok=True)
    
    # Get all template files
    templates = []
    template_id = 1
    
    if os.path.exists(target_dir):
        for file in sorted(os.listdir(target_dir)):
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                file_path = os.path.join(target_dir, file)
                if os.path.isfile(file_path):
                    template_id_str = f"{category_type}_{subcategory}_{item_category}_{template_id}"
                    
                    # Calculate URL based on category type
                    url_path = file_path.replace(app.static_folder, '/static')
                    
                    templates.append({
                        'id': template_id_str,
                        'category_type': category_type,
                        'subcategory': subcategory,
                        'item_category': item_category,
                        'path': file_path,
                        'url': f"{url_path}?t={int(time.time())}"
                    })
                    template_id += 1
    
    return jsonify({
        'templates': templates,
        'count': len(templates),
        'category_type': category_type,
        'subcategory': subcategory,
        'item_category': item_category,
        'success': True,
        'has_templates': len(templates) > 0,
        'timestamp': int(time.time())
    })

@app.route('/move-template', methods=['POST'])
def move_template():
    data = request.get_json()
    template_paths = data.get('template_paths', [])
    new_category = data.get('category_type')
    new_subcategory = data.get('subcategory')
    new_item = data.get('item_category')

    if not template_paths or not new_category or not new_subcategory or not new_item:
        return jsonify({'success': False, 'message': 'Missing parameters'}), 400

    target_dir = os.path.join('static', 'templates', new_category, new_subcategory, new_item)
    os.makedirs(target_dir, exist_ok=True)
    moved = []
    errors = []

    for path in template_paths:
        try:
            filename = os.path.basename(path)
            # If path is relative, make it absolute
            if not os.path.isabs(path):
                abs_path = os.path.join(os.getcwd(), path)
            else:
                abs_path = path
            new_path = os.path.join(target_dir, filename)
            os.rename(abs_path, new_path)
            moved.append(new_path)
        except Exception as e:
            errors.append(f"{path}: {str(e)}")

    return jsonify({'success': True, 'moved': moved, 'errors': errors})

if __name__ == '__main__':
    app.run(debug=True)
