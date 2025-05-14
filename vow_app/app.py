import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, render_template, redirect, url_for
from werkzeug.utils import secure_filename
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add parent directory to path so we can import from the main app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
main_app = sys.modules['app'] if 'app' in sys.modules else __import__('app')
faceapp = main_app.faceapp
swapper = main_app.swapper
allowed_file = main_app.allowed_file
resize_image_if_needed = main_app.resize_image_if_needed

# Import configuration
from config import *

app = Flask(__name__)
app.secret_key = SECRET_KEY

# Flask configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER

# Create folders if they don't exist
os.makedirs(os.path.join(app.root_path, app.config['UPLOAD_FOLDER']), exist_ok=True)
os.makedirs(os.path.join(app.root_path, app.config['RESULTS_FOLDER']), exist_ok=True)

logger.info(f"VOW-BRIDE standalone app initialized")

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/api/universal-face-swap', methods=['POST'])
def universal_face_swap():
    """
    Process a face swap across multiple template categories with a single API call.
    Designed for minimal UI requiring only two clicks: upload and swap.
    
    Accepts:
    - source: Uploaded source image file
    - category_type: Main category (bride, groom)
    - subcategory: Subcategory (bridal, outfits, etc.)
    - item_category: Specific style/item (haldi, mehendi, etc.)
    - enhance: Whether to enhance the result (optional)
    - enhance_method: Enhancement method (optional)
    
    Returns:
    - JSON with result paths or error
    """
    if not faceapp or not swapper:
        return jsonify({'success': False, 'message': 'Face models not loaded properly'}), 500
    
    if 'source' not in request.files:
        return jsonify({'success': False, 'message': 'No source file found'}), 400
    
    source_file = request.files['source']
    if source_file.filename == '':
        return jsonify({'success': False, 'message': 'Empty source filename'}), 400
    
    if not allowed_file(source_file.filename):
        return jsonify({'success': False, 'message': 'Invalid file type'}), 400
    
    # Parameters
    category_type = request.form.get('category_type')
    subcategory = request.form.get('subcategory')
    item_category = request.form.get('item_category')
    enhance = request.form.get('enhance', 'false').lower() == 'true'
    enhance_method = request.form.get('enhance_method', 'auto')
    
    if not category_type or not subcategory or not item_category:
        return jsonify({'success': False, 'message': 'Missing category parameters'}), 400
    
    # Save the source file
    source_filename = secure_filename(source_file.filename)
    source_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                               app.config['UPLOAD_FOLDER'], source_filename)
    source_file.save(source_path)
    
    # Load source image
    source_img = cv2.imread(source_path)
    if source_img is None:
        return jsonify({'success': False, 'message': 'Failed to load source image'}), 500
    
    # Resize if needed
    source_img = resize_image_if_needed(source_img)
    
    # Detect face in source image
    try:
        source_faces = faceapp.get(source_img)
        if len(source_faces) == 0:
            return jsonify({'success': False, 'message': 'No face detected in source image'}), 400
        source_face = source_faces[0]
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error detecting face: {str(e)}'}), 500
    
    # Get templates path based on category parameters
    template_path_base = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                      'uploads', 'templates', 'pinterest')
    
    if category_type == 'bride':
        if subcategory == 'bridal':
            template_dir = os.path.join(template_path_base, item_category)
        else:
            template_dir = os.path.join(template_path_base, subcategory, item_category)
    elif category_type == 'groom':
        template_dir = os.path.join(template_path_base, subcategory, item_category)
    else:
        return jsonify({'success': False, 'message': 'Invalid category parameters'}), 400
    
    # Check if templates directory exists
    if not os.path.isdir(template_dir):
        return jsonify({'success': False, 'message': f'Templates directory not found: {template_dir}'}), 404
    
    # Get all template files
    template_files = []
    for file in os.listdir(template_dir):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')) and os.path.isfile(os.path.join(template_dir, file)):
            template_files.append(os.path.join(template_dir, file))
    
    if not template_files:
        return jsonify({'success': False, 'message': 'No templates found for the specified category'}), 404
    
    results = []
    
    # Process each template
    for template_path in template_files:
        try:
            # Load template
            template_img = cv2.imread(template_path)
            if template_img is None:
                continue
            
            # Resize if needed
            template_img = resize_image_if_needed(template_img)
            
            # Detect face in template
            target_faces = faceapp.get(template_img)
            if len(target_faces) == 0:
                continue
            
            # Use first face
            target_face = target_faces[0]
            
            # Swap face
            result_img = swapper.get(template_img, target_face, source_face)
            
            # Generate result filename
            template_filename = os.path.basename(template_path)
            template_id = os.path.splitext(template_filename)[0]
            timestamp = int(os.path.getmtime(template_path))
            result_filename = f"result_{timestamp}_{template_id}.jpg"
            result_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                      app.config['RESULTS_FOLDER'], result_filename)
            
            # Save result
            cv2.imwrite(result_path, result_img)
            
            # Add to results
            results.append({
                'success': True,
                'result_path': f"/static/results/{result_filename}",
                'enhanced': enhance,
                'enhance_method': enhance_method if enhance else None,
                'template_path': template_path,
                'template_id': template_id
            })
        except Exception as e:
            # Log error but continue with other templates
            print(f"Error processing template {template_path}: {str(e)}")
            continue
    
    if not results:
        return jsonify({'success': False, 'message': 'Failed to process any templates'}), 500
    
    return jsonify({
        'success': True,
        'results': results,
        'source_path': source_path,
        'category': {
            'category_type': category_type,
            'subcategory': subcategory,
            'item_category': item_category
        }
    })

@app.route('/api/get-categories')
def get_categories():
    """
    Get available categories structure from the organized template folders.
    """
    categories = [
        {
            "id": "bride",
            "name": "Bride",
            "subcategories": [
                {
                    "id": "bridal",
                    "name": "Bridal Ceremonies",
                    "items": [
                        {"id": "haldi", "name": "Haldi"},
                        {"id": "mehendi", "name": "Mehendi"},
                        {"id": "sangeeth", "name": "Sangeeth"},
                        {"id": "wedding", "name": "Wedding"},
                        {"id": "reception", "name": "Reception"}
                    ]
                },
                {
                    "id": "outfits",
                    "name": "Bridal Outfits",
                    "items": [
                        {"id": "casual", "name": "Casual"},
                        {"id": "formal", "name": "Formal"},
                        {"id": "traditional", "name": "Traditional"},
                        {"id": "western", "name": "Western"}
                    ]
                },
                {
                    "id": "jewelry",
                    "name": "Jewelry",
                    "items": [
                        {"id": "necklaces", "name": "Necklaces"},
                        {"id": "earrings", "name": "Earrings"},
                        {"id": "bangles", "name": "Bangles"},
                        {"id": "rings", "name": "Rings"}
                    ]
                }
            ]
        },
        {
            "id": "groom",
            "name": "Groom",
            "subcategories": [
                {
                    "id": "traditional",
                    "name": "Traditional Wear",
                    "items": [
                        {"id": "sherwani", "name": "Sherwani"},
                        {"id": "kurta", "name": "Kurta Pyjama"},
                        {"id": "indo-western", "name": "Indo-Western"}
                    ]
                },
                {
                    "id": "suits",
                    "name": "Modern Suits",
                    "items": [
                        {"id": "formal", "name": "Formal"},
                        {"id": "casual", "name": "Casual"},
                        {"id": "tuxedo", "name": "Tuxedo"}
                    ]
                },
                {
                    "id": "accessories",
                    "name": "Accessories",
                    "items": [
                        {"id": "ties", "name": "Ties & Bowties"},
                        {"id": "watches", "name": "Watches"},
                        {"id": "footwear", "name": "Footwear"}
                    ]
                }
            ]
        }
    ]
    
    return jsonify(categories)

@app.route('/api/get-templates')
def get_templates():
    """
    Get templates for a specific category.
    """
    category_type = request.args.get('category_type')
    subcategory = request.args.get('subcategory')
    item_category = request.args.get('item_category')
    
    if not category_type or not subcategory or not item_category:
        return jsonify({'success': False, 'message': 'Missing category parameters'}), 400
    
    template_path_base = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                      'uploads', 'templates', 'pinterest')
    
    if category_type == 'bride':
        if subcategory == 'bridal':
            template_dir = os.path.join(template_path_base, item_category)
        else:
            template_dir = os.path.join(template_path_base, subcategory, item_category)
    elif category_type == 'groom':
        template_dir = os.path.join(template_path_base, subcategory, item_category)
    else:
        return jsonify({'success': False, 'message': 'Invalid category parameters'}), 400
    
    if not os.path.isdir(template_dir):
        return jsonify({'success': False, 'message': f'Templates directory not found: {template_dir}'}), 404
    
    templates = []
    for file in os.listdir(template_dir):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')) and os.path.isfile(os.path.join(template_dir, file)):
            template_id = os.path.splitext(file)[0]
            templates.append({
                'id': template_id,
                'name': template_id.replace('_', ' ').capitalize(),
                'path': os.path.join(template_dir, file),
                'url': f"/uploads/templates/pinterest/{category_type}/{subcategory}/{item_category}/{file}" 
                if category_type != 'bride' or subcategory != 'bridal' 
                else f"/uploads/templates/pinterest/{item_category}/{file}"
            })
    
    return jsonify({
        'success': True,
        'templates': templates,
        'category': {
            'category_type': category_type,
            'subcategory': subcategory,
            'item_category': item_category
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)