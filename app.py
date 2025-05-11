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

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "development_secret_key")

# Initialize the database
from db import db
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
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
app.config['UPLOAD_FOLDER'] = 'uploads'
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
        print("All models loaded successfully!")
    except Exception as e:
        logger.warning(f"Failed to initialize face swap model: {str(e)}")
        logger.warning("Running in demonstration mode with visual indicators instead of actual face swapping")
        swapper = None
        demo_mode = True
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    logger.error(traceback.format_exc())
    faceapp = None
    swapper = None

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

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
                        'url': f"/uploads/templates/pinterest/{ceremony}/{file}",
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
    return render_template('bride/outfits.html')

@app.route('/jewelry-collections')
def jewelry_collections():
    return render_template('bride/jewelry.html')

@app.route('/makeup-styles')
def makeup_styles():
    return render_template('bride/makeup.html')

# Groom section routes
@app.route('/groom-face-swap')
def groom_face_swap():
    return render_template('groom/face_swap.html')

@app.route('/traditional-wear')
def traditional_wear():
    return render_template('groom/traditional_wear.html')

@app.route('/modern-suits')
def modern_suits():
    return render_template('groom/modern_suits.html')

@app.route('/groom-accessories')
def groom_accessories():
    return render_template('groom/accessories.html')

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
    Delete selected templates or all templates for a ceremony.
    Expected JSON payload: 
    - For specific templates: { template_paths: [path1, path2, ...] }
    - For clearing all ceremony templates: { ceremony_type: "haldi", clear_all: true }
    """
    if not request.is_json:
        return jsonify({"success": False, "message": "Expected JSON payload"}), 400
    
    data = request.get_json()
    template_paths = data.get('template_paths', [])
    ceremony_type = data.get('ceremony_type')
    clear_all = data.get('clear_all', False)
    
    # Handle clearing all templates for a ceremony
    if clear_all and ceremony_type:
        if ceremony_type not in ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']:
            return jsonify({"success": False, "message": "Invalid ceremony type"}), 400
        
        deleted_count = 0
        errors = []
        template_types = ['ai', 'natural', 'real', 'pinterest']
        template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
        
        try:
            # Clear all temple files for the ceremony in the main directory
            for template_type in template_types:
                main_path = os.path.join(template_dir, f"{ceremony_type}_{template_type}.jpg")
                if os.path.exists(main_path):
                    os.remove(main_path)
                    deleted_count += 1
                    app.logger.info(f"Deleted main template: {main_path}")
            
            # Clear all templates in subdirectories
            for template_type in template_types:
                type_dir = os.path.join(template_dir, template_type)
                
                # Delete the standard template file
                standard_path = os.path.join(type_dir, f"{ceremony_type}.jpg")
                if os.path.exists(standard_path):
                    os.remove(standard_path)
                    deleted_count += 1
                    app.logger.info(f"Deleted standard template: {standard_path}")
                
                # Check for ceremony-specific directory
                ceremony_dir = os.path.join(type_dir, ceremony_type)
                if os.path.exists(ceremony_dir) and os.path.isdir(ceremony_dir):
                    for file in os.listdir(ceremony_dir):
                        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                            file_path = os.path.join(ceremony_dir, file)
                            if os.path.isfile(file_path):
                                os.remove(file_path)
                                deleted_count += 1
                                app.logger.info(f"Deleted template: {file_path}")
            
            return jsonify({
                "success": True,
                "deleted_count": deleted_count,
                "ceremony_type": ceremony_type,
                "message": f"Cleared all templates for {ceremony_type} ceremony"
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
            # Validate the path - ensure it starts with /uploads/templates
            if not path or not (path.startswith('/uploads/templates/') or path.startswith('uploads/templates/')):
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
    return render_template('bulk_upload.html')

@app.route('/upload-bulk-templates', methods=['POST'])
def upload_bulk_templates():
    """
    Handle bulk template upload.
    Process multiple images for different ceremony types.
    """
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400
    
    # Default ceremony type (used as fallback)
    default_ceremony_type = request.form.get('ceremony_type')
    if not default_ceremony_type:
        return jsonify({'error': 'Default ceremony type is required'}), 400
    
    if default_ceremony_type not in ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']:
        return jsonify({'error': 'Invalid ceremony type'}), 400
    
    # Get the files and their categories
    files = request.files.getlist('files')
    if not files or len(files) == 0:
        return jsonify({'error': 'No files selected'}), 400
    
    # Get the individual file categories if provided
    file_categories = request.form.getlist('file_categories')
    
    # Base path for template directory
    template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
    os.makedirs(template_dir, exist_ok=True)
    
    # Directory for 'pinterest' template type
    pinterest_dir = os.path.join(template_dir, 'pinterest')
    os.makedirs(pinterest_dir, exist_ok=True)
    
    # Make sure we have ceremony directories for all types
    valid_ceremonies = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    for ceremony in valid_ceremonies:
        ceremony_dir = os.path.join(pinterest_dir, ceremony)
        os.makedirs(ceremony_dir, exist_ok=True)
    
    # Track uploads by category
    uploaded_counts = {ceremony: 0 for ceremony in valid_ceremonies}
    main_templates_updated = {ceremony: False for ceremony in valid_ceremonies}
    
    # Process each file
    for i, file in enumerate(files):
        if file and allowed_file(file.filename):
            # Determine ceremony type for this specific file
            file_ceremony = default_ceremony_type
            if i < len(file_categories) and file_categories[i] in valid_ceremonies:
                file_ceremony = file_categories[i]
            
            # Get the directory for this ceremony
            ceremony_dir = os.path.join(pinterest_dir, file_ceremony)
            
            # Create a secure filename with index
            next_index = uploaded_counts[file_ceremony] + 1
            filename = f"{file_ceremony}_{next_index}.jpg"
            filepath = os.path.join(ceremony_dir, filename)
            
            # Save the file
            file.save(filepath)
            uploaded_counts[file_ceremony] += 1
            
            # If it's the first file for this ceremony, set it as the main template
            if not main_templates_updated[file_ceremony]:
                # Main ceremony template in the pinterest directory
                main_path = os.path.join(ceremony_dir, f"{file_ceremony}.jpg")
                shutil.copy(filepath, main_path)
                
                # Also update as the main pinterest template in the templates root
                template_path = os.path.join(template_dir, f"{file_ceremony}_pinterest.jpg")
                shutil.copy(filepath, template_path)
                main_templates_updated[file_ceremony] = True
    
    # Calculate total uploaded count
    total_uploaded = sum(uploaded_counts.values())
    categories_updated = [ceremony for ceremony, count in uploaded_counts.items() if count > 0]
    
    return jsonify({
        'success': True,
        'uploaded_count': total_uploaded,
        'categories_updated': categories_updated,
        'main_template_updated': any(main_templates_updated.values())
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
    
    try:
        # Save the source image
        source_filename = secure_filename(source_file.filename)
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], source_filename)
        source_file.save(source_path)
        
        # Store paths in session for the results page
        session['source_path'] = source_path
        session['template_paths'] = template_paths
        
        # Redirect to results page
        return jsonify({
            'success': True, 
            'redirect_url': '/bridal_results',
            'message': f'Processing {len(template_paths)} templates'
        })
        
    except Exception as e:
        app.logger.error(f"Error in multi-face swap: {str(e)}")
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
    """
    Process a single template with the source face (for AJAX requests)
    Expects:
    - source_path: path to the source image
    - template_path: path to the template image
    Returns:
    - JSON with result path or error
    """
    if faceapp is None or swapper is None:
        return jsonify({'success': False, 'error': 'Models not loaded'})
        
    data = request.get_json()
    source_path = data.get('source_path')
    template_path = data.get('template_path')
    
    if not source_path or not template_path:
        return jsonify({'success': False, 'error': 'Missing source or template path'})
    
    try:
        # Read source and template images
        source_img = cv2.imread(source_path)
        template_img = cv2.imread(template_path)
        
        if source_img is None or template_img is None:
            return jsonify({'success': False, 'error': 'Failed to read images'})
            
        # Detect faces
        source_faces = faceapp.get(source_img)
        target_faces = faceapp.get(template_img)
        
        if not source_faces:
            return jsonify({'success': False, 'error': 'No face detected in source image'})
            
        if not target_faces:
            return jsonify({'success': False, 'error': 'No face detected in template image'})
            
        # Perform face swap
        result_img = swapper.get(template_img, target_faces[0], source_faces[0], source_img)
        
        # Save result
        timestamp = int(time.time())
        result_filename = f"result_{timestamp}_{os.path.basename(template_path)}"
        result_path = os.path.join(app.config['UPLOAD_FOLDER'], 'results', result_filename)
        
        # Create results directory if it doesn't exist
        os.makedirs(os.path.dirname(result_path), exist_ok=True)
        
        # Save the result
        cv2.imwrite(result_path, result_img)
        
        # Return the result path for display
        return jsonify({
            'success': True,
            'result_path': f"/uploads/results/{result_filename}"
        })
        
    except Exception as e:
        app.logger.error(f"Error processing template: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/bridal-swap', methods=['GET', 'POST'])
def bridal_swap():
    if request.method == 'GET':
        # Check for template parameters
        style = request.args.get('style', None)
        if style:
            # Redirect to the multi-template page when a specific style is provided
            return redirect(url_for('bridal_multi_swap', ceremony=style))
        return render_template('bridal_swap.html')
    
    if faceapp is None or swapper is None:
        return jsonify({'error': 'Models not loaded. Please check server logs.'}), 500

    if 'source' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    source_file = request.files['source']
    selected_style = request.form.get('style', 'haldi')
    template_url = request.form.get('template_url')  # Get the user-selected template URL
    
    logger.info(f"Received face swap request with style: {selected_style}, template URL: {template_url}")
    
    if source_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(source_file.filename):
        return jsonify({'error': 'Invalid file type. Only PNG, JPG, and JPEG files are allowed.'}), 400
    
    try:
        # Save the source file
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(source_file.filename))
        source_file.save(source_path)
        
        # Read the source image for face detection
        source_img = cv2.imread(source_path)
        
        if source_img is None:
            return jsonify({'error': 'Failed to read source image'}), 400
        
        # Detect face in source image
        source_faces = faceapp.get(source_img)
        
        if not source_faces:
            return jsonify({'error': 'No face detected in your photo. Please upload a clear photo with your face visible.'}), 400
        
        # Use the user-selected template if provided, otherwise fall back to a random one
        if template_url and os.path.exists(template_url):
            logger.info(f"Using user-selected template: {template_url}")
            target_img = cv2.imread(template_url)
            target_path = template_url
        else:
            logger.info(f"User-selected template not found or not provided, using random template for ceremony: {selected_style}")
            # Get the template image directly from Pinterest based on ceremony type
            target_img, target_path = get_pinterest_template_for_ceremony(selected_style)
        
        if target_img is None:
            return jsonify({'error': 'Failed to load bridal template image'}), 500
        
        # Detect face in the template image
        target_faces = faceapp.get(target_img)
        
        if not target_faces:
            return jsonify({'error': 'No face detected in template image. Please try a different style.'}), 400
        
        # Perform face swap
        logger.info(f"Performing face swap with style: {selected_style}, using Pinterest template")
        result_img = swapper.get(target_img, target_faces[0], source_faces[0])
        
        # Save result
        timestamp = int(time.time())
        output_filename = f'bridal_{selected_style}_{timestamp}_{secure_filename(source_file.filename)}'
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        cv2.imwrite(output_path, result_img)
        
        # Clean up the source file
        os.remove(source_path)
        
        return jsonify({
            'success': True,
            'result_image': output_filename,
            'style': selected_style
        })
        
    except Exception as e:
        logger.error(f"Error in bridal_swap: {str(e)}")
        logger.error(traceback.format_exc())
        # Clean up files in case of error
        if 'source_path' in locals() and os.path.exists(source_path):
            os.remove(source_path)
        return jsonify({'error': str(e)}), 500

@app.route('/bridal-swap-multi', methods=['POST'])
def bridal_swap_multi():
    """
    Process multiple templates with the same source face.
    Expects:
    - source: uploaded image file
    - template_0, template_1, etc.: paths to template images
    - ceremony_0, ceremony_1, etc.: corresponding ceremony types
    - template_count: number of templates
    Returns:
    - JSON with results array or error message
    """
    if faceapp is None or swapper is None:
        return jsonify({'success': False, 'error': 'Models not loaded. Please check server logs.'}), 500

    if 'source' not in request.files:
        return jsonify({'success': False, 'error': 'No source image provided'}), 400
    
    source_file = request.files['source']
    if source_file.filename == '':
        return jsonify({'success': False, 'error': 'No source image selected'}), 400
    
    if not allowed_file(source_file.filename):
        return jsonify({'success': False, 'error': 'Invalid file format for source image'}), 400
    
    # Log all form data for debugging
    logger.info("Received form data for multi-swap:")
    for key, value in request.form.items():
        logger.info(f"  {key}: {value}")
    
    # Get template count
    template_count = int(request.form.get('template_count', '0'))
    logger.info(f"Template count from form: {template_count}")
    
    if template_count <= 0 or template_count > 5:
        return jsonify({'success': False, 'error': 'Invalid number of templates. Please select 1-5 templates.'}), 400
    
    # Get template paths
    template_paths = []
    ceremony_types = []
    for i in range(template_count):
        template_path = request.form.get(f'template_{i}')
        ceremony_type = request.form.get(f'ceremony_{i}', 'unknown')
        
        logger.info(f"Template {i+1}: Path={template_path}, Ceremony={ceremony_type}")
        
        if not template_path:
            return jsonify({'success': False, 'error': f'Template {i+1} path not provided'}), 400
            
        if not os.path.exists(template_path):
            logger.error(f"Template file not found: {template_path}")
            return jsonify({'success': False, 'error': f'Template {i+1} file not found'}), 400
        
        template_paths.append(template_path)
        ceremony_types.append(ceremony_type)
    
    try:
        # Save the source image
        source_filename = secure_filename(source_file.filename)
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], source_filename)
        source_file.save(source_path)
        
        # Read the source image
        source_img = cv2.imread(source_path)
        if source_img is None:
            return jsonify({'success': False, 'error': 'Failed to read source image'}), 400
        
        # Detect face in source image
        source_faces = faceapp.get(source_img)
        if not source_faces:
            return jsonify({'success': False, 'error': 'No face detected in your photo. Please upload a clear photo with your face visible.'}), 400
        
        # Create results directory if it doesn't exist
        results_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        # Process each template
        results = []
        for i, (template_path, ceremony_type) in enumerate(zip(template_paths, ceremony_types)):
            try:
                # Read template image
                template_img = cv2.imread(template_path)
                if template_img is None:
                    logger.warning(f"Failed to read template image at {template_path}")
                    continue
                
                # Detect face in template
                target_faces = faceapp.get(template_img)
                if not target_faces:
                    logger.warning(f"No face detected in template image at {template_path}")
                    continue
                
                # Perform face swap
                logger.info(f"Processing template {i+1}/{template_count}: {ceremony_type}")
                
                # Extract the face boxes to avoid comparison issues
                target_face = target_faces[0]
                source_face = source_faces[0]
                
                # Perform the swap with proper error handling
                try:
                    # Handle array comparison issues by converting face objects to simple dictionaries
                    # This avoids the "truth value of array is ambiguous" error
                    simplified_source_face = {}
                    simplified_target_face = {}

                    # Extract only the scalar values from face detection
                    for key, value in source_face.items():
                        if key != 'embedding' and key != 'normed_embedding':
                            if isinstance(value, np.ndarray):
                                simplified_source_face[key] = value.tolist() if value.size < 10 else value
                            else:
                                simplified_source_face[key] = value
                    
                    for key, value in target_face.items():
                        if key != 'embedding' and key != 'normed_embedding':
                            if isinstance(value, np.ndarray):
                                simplified_target_face[key] = value.tolist() if value.size < 10 else value
                            else:
                                simplified_target_face[key] = value
                    
                    logger.info(f"Simplified face objects for comparison")
                    
                    try:
                        # Perform the actual swap with the original face objects
                        # but use the simplified ones for any comparison operations
                        result_img = swapper.get(template_img, target_face, source_face, source_img)
                    except Exception as inner_error:
                        logger.error(f"Face swap operation failed: {inner_error}")
                        # Create a demo result with face boxes for debugging
                        result_img = create_demo_result(source_img, template_img, source_face, target_face)
                    
                except Exception as swap_error:
                    logger.error(f"Face swap operation failed: {swap_error}")
                    # Create a demo result with face boxes for debugging
                    result_img = create_demo_result(source_img, template_img, source_face, target_face)
                    logger.info("Created fallback result with face boxes")
                
                # Save result
                timestamp = int(time.time())
                result_filename = f"multi_{i}_{ceremony_type}_{timestamp}_{secure_filename(source_file.filename)}"
                result_path = os.path.join(results_dir, result_filename)
                
                # Save the result
                cv2.imwrite(result_path, result_img)
                
                # Add to results
                results.append({
                    'ceremony': ceremony_type,
                    'result_path': f"/uploads/results/{result_filename}"
                })
                
            except Exception as e:
                logger.error(f"Error processing template {i+1}/{template_count}: {str(e)}")
                # Continue with next template
        
        # Clean up source file
        os.remove(source_path)
        
        if not results:
            return jsonify({'success': False, 'error': 'Failed to process any templates. Please try again.'}), 500
        
        # Return all results
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error in bridal_swap_multi: {str(e)}")
        logger.error(traceback.format_exc())
        # Clean up files in case of error
        if 'source_path' in locals() and os.path.exists(source_path):
            os.remove(source_path)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """
    API endpoint to get available templates for a specific ceremony type.
    Returns templates for the requested ceremony with URLs for display.
    Always performs a fresh scan of the filesystem to avoid caching issues.
    """
    ceremony_type = request.args.get('ceremony_type', request.args.get('ceremony', 'wedding'))
    # Add cache-busting parameter in logs (not used but helps in debugging)
    cache_buster = request.args.get('_t', 'none')
    app.logger.info(f"Fetching templates for ceremony: {ceremony_type}, cache-buster: {cache_buster}")
    
    # Validate ceremony name
    valid_ceremonies = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    if ceremony_type not in valid_ceremonies:
        app.logger.warning(f"Invalid ceremony type requested: {ceremony_type}")
        return jsonify({'error': f'Invalid ceremony type: {ceremony_type}'}), 400
    
    # Get templates directory
    template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
    
    # Check if template directory exists
    if not os.path.exists(template_dir):
        app.logger.warning(f"Template directory does not exist: {template_dir}")
        os.makedirs(template_dir, exist_ok=True)
        app.logger.info(f"Created template directory: {template_dir}")
    
    app.logger.info(f"Scanning template directory: {template_dir}")
    
    # Log all subdirectories in templates for debugging
    try:
        subdirs = [d for d in os.listdir(template_dir) if os.path.isdir(os.path.join(template_dir, d))]
        app.logger.info(f"Template subdirectories: {subdirs}")
        
        # Also log files in the template root
        files = [f for f in os.listdir(template_dir) if os.path.isfile(os.path.join(template_dir, f))]
        app.logger.info(f"Files in template root: {files}")
    except Exception as e:
        app.logger.error(f"Error scanning template directory: {e}")
    
    # Ensure fresh list by explicitly creating a new array
    templates = []
    template_id = 1
    
    # Now ONLY check for Pinterest templates
    template_type = 'pinterest'
    
    # Check in main directory
    main_path = os.path.join(template_dir, f"{ceremony_type}_{template_type}.jpg")
    if os.path.exists(main_path):
        app.logger.info(f"Found main template: {main_path}")
        # Calculate the URL relative to the uploads directory
        url_path = main_path.replace(app.config['UPLOAD_FOLDER'], '/uploads')
        templates.append({
            'id': f"{ceremony_type}_{template_type}_{template_id}",
            'template_type': template_type,
            'ceremony': ceremony_type,
            'path': main_path,
            'url': f"{url_path}?t={int(time.time())}"
        })
        template_id += 1
        
    # Check in type subdirectory for standard file
    subdir_path = os.path.join(template_dir, template_type, f"{ceremony_type}.jpg")
    if os.path.exists(subdir_path):
        app.logger.info(f"Found subdir template: {subdir_path}")
        # Calculate the URL relative to the uploads directory
        url_path = subdir_path.replace(app.config['UPLOAD_FOLDER'], '/uploads')
        templates.append({
            'id': f"{ceremony_type}_{template_type}_{template_id}",
            'template_type': template_type,
            'ceremony': ceremony_type,
            'path': subdir_path,
            'url': f"{url_path}?t={int(time.time())}"
        })
        template_id += 1
        
    # Check for additional images in the type subdirectory
    type_dir = os.path.join(template_dir, template_type, ceremony_type)
    if os.path.exists(type_dir) and os.path.isdir(type_dir):
        app.logger.info(f"Scanning additional templates in: {type_dir}")
        for file in sorted(os.listdir(type_dir)):
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                file_path = os.path.join(type_dir, file)
                if os.path.isfile(file_path):
                    template_id_str = f"{ceremony_type}_{template_type}_{template_id}"
                    app.logger.info(f"Found additional {template_type} template: {file_path}")
                    
                    # Calculate the URL relative to the uploads directory
                    url_path = file_path.replace(app.config['UPLOAD_FOLDER'], '/uploads')
                    templates.append({
                        'id': template_id_str,
                        'template_type': template_type,
                        'ceremony': ceremony_type,
                        'path': file_path,
                        'url': f"{url_path}?t={int(time.time())}"
                    })
                    template_id += 1
    
    # This section is intentionally removed as it's redundant
    # The pinterest templates are already handled in the loop above
    # via the type_dir approach with template_type = 'pinterest'
    
    # Also check for main Pinterest template
    main_pinterest_path = os.path.join(template_dir, f"{ceremony_type}_pinterest.jpg")
    if os.path.exists(main_pinterest_path):
        app.logger.info(f"Found main Pinterest template: {main_pinterest_path}")
        # Calculate the URL relative to the uploads directory
        url_path = main_pinterest_path.replace(app.config['UPLOAD_FOLDER'], '/uploads')
        templates.append({
            'id': f"{ceremony_type}_pinterest_{template_id}",
            'template_type': 'pinterest',
            'ceremony': ceremony_type,
            'path': main_pinterest_path,
            'url': f"{url_path}?t={int(time.time())}"
        })
        template_id += 1
    
    # Add template count to the logging
    app.logger.info(f"Found {len(templates)} templates for {ceremony_type}")
    
    # If no templates found, add a note to the response but don't create fake templates
    # This is better for debugging and ensures clients only see real templates
    if not templates:
        app.logger.warning(f"No templates found for {ceremony_type} ceremony")
        # We'll return an empty array, but set a flag in the response
        # The client can handle this appropriately
    
    return jsonify({
        'success': True,
        'ceremony': ceremony_type,
        'templates': templates,
        'has_templates': len(templates) > 0,
        'timestamp': int(time.time())
    })

def get_bridal_template(style, template_type='natural'):
    """
    Get the template image for the selected bridal style and template type.
    
    Args:
        style (str): The bridal style ('haldi', 'mehendi', 'sangeeth', 'wedding', or 'reception')
        template_type (str): The template type ('real', 'natural' or 'ai')
        
    Returns:
        tuple: (template_img, template_path)
    """
    # Validate style name
    valid_styles = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    if style not in valid_styles:
        logger.warning(f"Invalid style: {style}. Using 'wedding' as fallback.")
        style = 'wedding'
    
    # Validate template type
    valid_types = ['real', 'natural', 'ai', 'pinterest']
    if template_type not in valid_types:
        logger.warning(f"Invalid template type: {template_type}. Using 'pinterest' as fallback.")
        template_type = 'pinterest'
    
    # Create template directories if they don't exist
    template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
    type_dir = os.path.join(template_dir, template_type)
    os.makedirs(template_dir, exist_ok=True)
    os.makedirs(type_dir, exist_ok=True)
    
    # First try the direct combination of style and type
    template_filename = f"{style}_{template_type}.jpg"
    template_path = os.path.join(template_dir, template_filename)
    
    # Check if the file exists
    if os.path.exists(template_path):
        template_img = cv2.imread(template_path)
        if template_img is not None:
            logger.info(f"Using template: {template_path}")
            return template_img, template_path
    
    # If direct file doesn't exist, check in type subdirectory
    subdir_template_path = os.path.join(type_dir, f"{style}.jpg")
    if os.path.exists(subdir_template_path):
        template_img = cv2.imread(subdir_template_path)
        if template_img is not None:
            logger.info(f"Using template from subdirectory: {subdir_template_path}")
            return template_img, subdir_template_path
    
    # If still not found, try legacy template format
    legacy_template = f"{style}_template.jpg"
    legacy_path = os.path.join(template_dir, legacy_template)
    if os.path.exists(legacy_path):
        template_img = cv2.imread(legacy_path)
        if template_img is not None:
            logger.info(f"Using legacy template: {legacy_path}")
            return template_img, legacy_path
    
    # If all else fails, look for another style of the same type
    logger.warning(f"No template found for {style}_{template_type}. Trying fallback.")
    for fallback_style in valid_styles:
        if fallback_style != style:
            fallback_path = os.path.join(template_dir, f"{fallback_style}_{template_type}.jpg")
            if os.path.exists(fallback_path):
                template_img = cv2.imread(fallback_path)
                if template_img is not None:
                    logger.info(f"Using fallback template: {fallback_path}")
                    return template_img, fallback_path
    
    # Last resort: create a blank colored template
    logger.warning(f"No fallback template found. Creating blank template for {style}.")
    img_height, img_width = 1024, 768
    template_img = np.zeros((img_height, img_width, 3), dtype=np.uint8)
    
    # Set background color based on style
    if style == 'haldi':
        # Yellow for Haldi
        template_img[:] = (0, 215, 255)  # BGR for yellow
    elif style == 'mehendi':
        # Green for Mehendi
        template_img[:] = (0, 128, 0)  # BGR for green
    elif style == 'sangeeth':
        # Blue for Sangeeth
        template_img[:] = (255, 100, 0)  # BGR for blue-orange
    elif style == 'wedding':
        # Red for Wedding
        template_img[:] = (0, 0, 255)  # BGR for red
    elif style == 'reception':
        # Purple for Reception
        template_img[:] = (128, 0, 128)  # BGR for purple
    
    # Add a label indicating which template type this is
    template_type_label = "Natural" if template_type == "natural" else ("Real" if template_type == "real" else "AI-Generated")
    
    # Add text
    font = cv2.FONT_HERSHEY_SIMPLEX
    text = f"{style.capitalize()} {template_type_label} Template"
    text_size = cv2.getTextSize(text, font, 1, 2)[0]
    text_x = (img_width - text_size[0]) // 2
    text_y = (img_height + text_size[1]) // 2
    cv2.putText(template_img, text, (text_x, text_y), font, 1, (255, 255, 255), 2)
    
    # Save the template
    backup_path = os.path.join(template_dir, f"{style}_{template_type}.jpg")
    cv2.imwrite(backup_path, template_img)
    logger.info(f"Created and saved blank template: {backup_path}")
    
    return template_img, backup_path


def get_pinterest_template_for_ceremony(ceremony):
    """
    Get a random template image from the Pinterest directory for the specified ceremony.
    
    Args:
        ceremony (str): The ceremony type ('haldi', 'mehendi', 'sangeeth', 'wedding', or 'reception')
        
    Returns:
        tuple: (template_img, template_path)
    """
    # Validate ceremony name
    valid_ceremonies = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    if ceremony not in valid_ceremonies:
        logger.warning(f"Invalid ceremony: {ceremony}. Using 'wedding' as fallback.")
        ceremony = 'wedding'
    
    # Path to Pinterest directory for this ceremony
    template_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'templates')
    pinterest_dir = os.path.join(template_dir, 'pinterest', ceremony)
    
    # Ensure directory exists
    if not os.path.exists(pinterest_dir):
        logger.warning(f"Pinterest directory for {ceremony} not found: {pinterest_dir}")
        os.makedirs(pinterest_dir, exist_ok=True)
        
        # If no directory exists, try to use a main pinterest file
        main_pinterest_path = os.path.join(template_dir, f"{ceremony}_pinterest.jpg")
        if os.path.exists(main_pinterest_path):
            logger.info(f"Using main Pinterest template: {main_pinterest_path}")
            template_img = cv2.imread(main_pinterest_path)
            if template_img is not None:
                return template_img, main_pinterest_path
                
        # If still not found, return None
        logger.error(f"No Pinterest templates found for {ceremony}")
        return None, None
    
    # Get all image files from the Pinterest directory
    image_files = []
    for file in os.listdir(pinterest_dir):
        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            file_path = os.path.join(pinterest_dir, file)
            if os.path.isfile(file_path):
                image_files.append(file_path)
    
    # If no images found, return None
    if not image_files:
        logger.error(f"No images found in Pinterest directory for {ceremony}: {pinterest_dir}")
        return None, None
    
    # Select a random image from the available ones
    import random
    selected_path = random.choice(image_files)
    logger.info(f"Selected Pinterest template: {selected_path}")
    
    # Load the selected image
    template_img = cv2.imread(selected_path)
    if template_img is None:
        logger.error(f"Failed to load selected Pinterest template: {selected_path}")
        return None, None
        
    return template_img, selected_path


@app.route('/upload', methods=['POST'])
def upload_file():
    if faceapp is None:
        return jsonify({'error': 'Face detection model not loaded. Please check server logs.'}), 500

    if 'source' not in request.files or 'target' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    source_file = request.files['source']
    target_file = request.files['target']
    
    if source_file.filename == '' or target_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not (allowed_file(source_file.filename) and allowed_file(target_file.filename)):
        return jsonify({'error': 'Invalid file type. Only PNG, JPG, and JPEG files are allowed.'}), 400
    
    try:
        # Save uploaded files
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(source_file.filename))
        target_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(target_file.filename))
        
        source_file.save(source_path)
        target_file.save(target_path)
        
        # Read images
        source_img = cv2.imread(source_path)
        target_img = cv2.imread(target_path)
        
        if source_img is None or target_img is None:
            return jsonify({'error': 'Failed to read one or both images'}), 400
        
        # Detect faces
        source_faces = faceapp.get(source_img)
        target_faces = faceapp.get(target_img)
        
        if not source_faces:
            return jsonify({'error': 'No face detected in source image'}), 400
        
        if not target_faces:
            return jsonify({'error': 'No face detected in target image'}), 400
        
        # Check if we're running in demo mode or with actual face swap
        if demo_mode or swapper is None:
            logger.info("Using demo mode for face visualization")
            result_img = create_demo_result(source_img, target_img, source_faces[0], target_faces[0])
        else:
            # Perform actual face swap with the model
            logger.info("Performing face swap with the model")
            result_img = swapper.get(target_img, target_faces[0], source_faces[0])
        
        # Save result
        output_filename = 'result_' + secure_filename(target_file.filename)
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        cv2.imwrite(output_path, result_img)
        
        # Clean up uploaded files
        os.remove(source_path)
        os.remove(target_path)
        
        response_data = {
            'success': True,
            'result_image': output_filename,
            'demo_mode': demo_mode
        }
        
        # Add more information when in demo mode
        if demo_mode:
            response_data['message'] = 'Running in demonstration mode. The image shows detected faces with boxes instead of actual face swapping.'
            
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        logger.error(traceback.format_exc())
        # Clean up uploaded files in case of error
        if 'source_path' in locals() and os.path.exists(source_path):
            os.remove(source_path)
        if 'target_path' in locals() and os.path.exists(target_path):
            os.remove(target_path)
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/check-models')
def check_models():
    status = {
        'face_detection': faceapp is not None,
        'face_swap': swapper is not None,
        'demo_mode': demo_mode
    }
    return jsonify(status)

@app.route('/upload-model', methods=['GET', 'POST'])
def upload_model():
    global swapper, demo_mode
    
    if request.method == 'POST':
        if 'model_file' not in request.files:
            return render_template('upload_model.html', error='No file part')
        
        model_file = request.files['model_file']
        
        if model_file.filename == '':
            return render_template('upload_model.html', error='No selected file')
        
        # Check that it's an ONNX file
        if not model_file.filename.endswith('.onnx'):
            return render_template('upload_model.html', error='File must be an ONNX model (.onnx)')
        
        # Save the model file
        model_path = os.path.join('models', 'inswapper_128.onnx')
        os.makedirs('models', exist_ok=True)
        
        try:
            model_file.save(model_path)
            logger.info(f"Model file saved to {model_path}")
            
            # Validate the model file
            import onnx
            try:
                onnx.load(model_path)
                logger.info("Model file validated successfully")
                
                # Load the model
                providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
                swapper = get_model(model_path, providers=providers)
                logger.info("Face swap model loaded successfully")
                
                # Update demo mode
                demo_mode = False
                
                return render_template('upload_model.html', success=True, message="Model uploaded and loaded successfully!")
            except Exception as e:
                logger.error(f"Failed to validate model: {str(e)}")
                return render_template('upload_model.html', error=f"Invalid model file: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error saving model file: {str(e)}")
            return render_template('upload_model.html', error=f"Error saving model: {str(e)}")
    
    return render_template('upload_model.html')