import os
import io
import cv2
import zipfile
import requests
import logging
import traceback
import insightface
import numpy as np
from datetime import datetime
from insightface.app import FaceAnalysis
from insightface.app.common import Face
from insightface.utils import face_align
from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.orm import DeclarativeBase
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your_default_secret_key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize database
db.init_app(app)

# Configure uploads directory
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
TEMPLATES_FOLDER = os.path.join(UPLOAD_FOLDER, 'templates')
RESULTS_FOLDER = os.path.join(UPLOAD_FOLDER, 'results')

# Create required directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMPLATES_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)
os.makedirs(os.path.join(TEMPLATES_FOLDER, 'real'), exist_ok=True)
os.makedirs(os.path.join(TEMPLATES_FOLDER, 'natural'), exist_ok=True)
os.makedirs(os.path.join(TEMPLATES_FOLDER, 'ai'), exist_ok=True)

# Configure login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize face detection and swap models
faceapp = None
swapper = None
demo_mode = False

# Function to get the face swap model
def get_model(model_file, providers):
    from insightface.model_zoo.inswapper import INSwapper
    model = INSwapper(model_file, providers=providers)
    return model

# Download face detection model
def download_face_detection_model():
    try:
        model_path = os.path.expanduser('~/.insightface/models/buffalo_l')
        if not os.path.exists(model_path):
            os.makedirs(model_path, exist_ok=True)
            
            # Download the face detection model
            url = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip"
            response = requests.get(url)
            
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

# Create a demo result when face swap model is unavailable
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
    
    # Create a side-by-side visualization
    h1, w1 = source_copy.shape[:2]
    h2, w2 = target_copy.shape[:2]
    h = max(h1, h2)
    combined_img = np.zeros((h, w1 + w2, 3), dtype=np.uint8)
    combined_img[:h1, :w1] = source_copy
    combined_img[:h2, w1:w1+w2] = target_copy

    # Add text at the top indicating it's a demo
    cv2.putText(combined_img, "DEMO MODE - Face Swap Not Available", (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    return combined_img

# Download face swap model (InsightFace inswapper)
def download_face_swap_model():
    """
    Download the face swap model from the provided Hugging Face repository.
    """
    try:
        models_dir = 'models'
        os.makedirs(models_dir, exist_ok=True)
        
        model_file = os.path.join(models_dir, 'inswapper_128.onnx')
        
        # Check if model already exists
        if os.path.exists(model_file):
            file_size = os.path.getsize(model_file)
            expected_size = 513047964  # Expected file size in bytes
            
            # Verify file size
            if abs(file_size - expected_size) < 1000:  # Allow small difference
                logger.info(f"Existing model file at {model_file} is valid.")
                return model_file
            else:
                logger.warning(f"Existing model file size mismatch: {file_size} vs {expected_size}")
        
        # Download the model
        huggingface_token = os.environ.get('HUGGINGFACE_TOKEN')
        if not huggingface_token:
            raise Exception("HUGGINGFACE_TOKEN environment variable is not set")
        
        url = "https://huggingface.co/deepinsight/inswapper/resolve/main/inswapper_128.onnx"
        logger.info(f"Downloading face swap model from: {url}")
        
        headers = {"Authorization": f"Bearer {huggingface_token}"}
        response = requests.get(url, headers=headers, stream=True)
        
        if response.status_code == 200:
            with open(model_file, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            logger.info(f"Face swap model downloaded successfully to {model_file}")
            return model_file
        else:
            raise Exception(f"Failed to download face swap model. Status code: {response.status_code}")
    
    except Exception as e:
        logger.error(f"Error in download_face_swap_model: {str(e)}")
        logger.error(traceback.format_exc())
        logger.warning("Continuing in demo mode without face swap capability")
        global demo_mode
        demo_mode = True
        return None

# Check if file has allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        from models import User
        
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False
        
        user = User.query.filter_by(email=email).first()
        
        # Check if user exists and password is correct
        if not user or not user.check_password(password):
            flash('Please check your login details and try again.')
            return redirect(url_for('login'))
        
        # Log in the user
        login_user(user, remember=remember)
        
        # Redirect to the page the user wanted to access
        next_page = request.args.get('next')
        if next_page:
            return redirect(next_page)
        return redirect(url_for('dashboard'))
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        from models import User
        
        # Get form data
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email address already exists')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )
        new_user.set_password(password)
        
        # Add user to database
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! You can now log in.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    from models import WeddingEvent, Task
    
    # Get user's events
    user_events = WeddingEvent.query.filter_by(user_id=current_user.id).all()
    
    # Get user's tasks
    user_tasks = Task.query.filter_by(assigned_to=current_user.id).all()
    
    return render_template(
        'dashboard.html', 
        events=user_events, 
        tasks=user_tasks
    )

@app.route('/bridal-gallery')
def bridal_gallery():
    return render_template('bridal_gallery_new.html')

@app.route('/bridal-swap', methods=['GET', 'POST'])
@login_required
def bridal_swap():
    if request.method == 'GET':
        return render_template('bridal_swap.html')
    
    if faceapp is None or swapper is None:
        return jsonify({'error': 'Models not loaded. Please check server logs.'}), 500

    if 'source' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    source_file = request.files['source']
    selected_style = request.form.get('style', 'haldi')
    template_type = request.form.get('template_type', 'natural')
    
    if source_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(source_file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Save source image
        source_filename = secure_filename(source_file.filename)
        source_path = os.path.join(UPLOAD_FOLDER, source_filename)
        source_file.save(source_path)
        
        # Get template image based on selected style
        target_img, target_path = get_bridal_template(selected_style, template_type)
        
        # Read the source image
        source_img = cv2.imread(source_path)
        
        # Analyze faces in source and target images
        source_faces = faceapp.get(source_img)
        target_faces = faceapp.get(target_img)
        
        if len(source_faces) == 0:
            return jsonify({'error': 'No face detected in source image'}), 400
        
        if len(target_faces) == 0:
            return jsonify({'error': 'No face detected in template image'}), 400
        
        source_face = source_faces[0]
        target_face = target_faces[0]
        
        # Perform face swap or create demo result if in demo mode
        if demo_mode:
            result_img = create_demo_result(source_img, target_img, source_face, target_face)
        else:
            # Actual face swap
            result_img = target_img.copy()
            result_img = swapper.get(result_img, target_face, source_face, paste_back=True)
        
        # Save the result
        result_filename = f"{os.path.splitext(source_filename)[0]}_{selected_style}_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        result_path = os.path.join(RESULTS_FOLDER, result_filename)
        cv2.imwrite(result_path, result_img)
        
        # Store image in database
        from models import UserImage, TemplateImage, GeneratedImage
        
        # Check if source image exists in database
        source_db_image = UserImage.query.filter_by(
            filename=source_filename, 
            user_id=current_user.id
        ).first()
        
        if not source_db_image:
            # Create new source image record
            source_db_image = UserImage(
                filename=source_filename,
                original_filename=source_file.filename,
                file_path=source_path,
                file_size=os.path.getsize(source_path),
                file_type=source_file.content_type,
                user_id=current_user.id
            )
            db.session.add(source_db_image)
            db.session.flush()  # Get ID without committing
        
        # Get template image from database
        template_filename = os.path.basename(target_path)
        template_db_image = TemplateImage.query.filter_by(
            filename=template_filename, 
            category=selected_style,
            template_type=template_type
        ).first()
        
        if not template_db_image:
            # Create new template image record (for admins only, default to first admin)
            from models import User
            admin = User.query.filter_by(user_type='admin').first()
            admin_id = admin.id if admin else 1
            
            template_db_image = TemplateImage(
                filename=template_filename,
                file_path=target_path,
                file_size=os.path.getsize(target_path),
                category=selected_style,
                template_type=template_type,
                creator_id=admin_id
            )
            db.session.add(template_db_image)
            db.session.flush()  # Get ID without committing
        
        # Create generated image record
        generated_image = GeneratedImage(
            filename=result_filename,
            file_path=result_path,
            file_size=os.path.getsize(result_path),
            source_image_id=source_db_image.id,
            template_image_id=template_db_image.id,
            user_id=current_user.id,
            customization_data={
                'style': selected_style,
                'template_type': template_type,
                'demo_mode': demo_mode
            }
        )
        db.session.add(generated_image)
        db.session.commit()
        
        # Return the result
        return jsonify({
            'result': f"/uploads/results/{result_filename}",
            'source': source_path,
            'target': target_path
        })
    
    except Exception as e:
        logger.error(f"Error in bridal_swap: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def get_bridal_template(style, template_type='natural'):
    """
    Get the template image for the selected bridal style and template type.
    
    Args:
        style (str): The bridal style ('haldi', 'mehendi', 'wedding', or 'reception')
        template_type (str): The template type ('real', 'natural' or 'ai')
        
    Returns:
        tuple: (template_img, template_path)
    """
    template_dir = os.path.join(TEMPLATES_FOLDER, template_type)
    
    # Define fallback paths for each style
    fallback_paths = {
        'haldi': 'weeding saree.jpg',
        'mehendi': 'halfhand.jpg',
        'sangeeth': 'jewellary.jpg',
        'wedding': 'voni dress.jpg',
        'reception': 'full dress.jpg'
    }
    
    # Get available templates for the style
    style_templates = []
    if os.path.exists(template_dir):
        for filename in os.listdir(template_dir):
            if allowed_file(filename) and filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                style_templates.append(filename)
    
    # Select a template (for now, just use the fallback)
    selected_template = fallback_paths.get(style, fallback_paths['wedding'])
    template_path = os.path.join(template_dir, selected_template)
    
    # If the template doesn't exist, use a fallback from 'real' folder
    if not os.path.exists(template_path):
        template_path = os.path.join(TEMPLATES_FOLDER, 'real', selected_template)
    
    # Read the template image
    template_img = cv2.imread(template_path)
    
    return template_img, template_path

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/api/check-models')
def check_models():
    """
    Check if the face detection and face swap models are loaded.
    Returns the status of each model.
    """
    global faceapp, swapper, demo_mode
    
    return jsonify({
        'face_detection': faceapp is not None,
        'face_swap': swapper is not None,
        'demo_mode': demo_mode
    })

@app.route('/api/upload-model', methods=['POST'])
def upload_model():
    """
    Allow uploading a custom face swap model.
    """
    if 'model' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    model_file = request.files['model']
    
    if model_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not model_file.filename.endswith('.onnx'):
        return jsonify({'error': 'Only ONNX models are supported'}), 400
    
    try:
        # Save the model
        models_dir = 'models'
        os.makedirs(models_dir, exist_ok=True)
        
        model_path = os.path.join(models_dir, 'custom_inswapper.onnx')
        model_file.save(model_path)
        
        # Reload the model
        global swapper, demo_mode
        providers = ['CPUExecutionProvider']
        swapper = get_model(model_path, providers=providers)
        demo_mode = False
        
        return jsonify({
            'success': True,
            'message': 'Model uploaded and loaded successfully'
        })
    
    except Exception as e:
        logger.error(f"Error uploading model: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': str(e)
        }), 500

# Event management routes
@app.route('/events', methods=['GET'])
@login_required
def list_events():
    from models import WeddingEvent
    
    user_events = WeddingEvent.query.filter_by(user_id=current_user.id).all()
    return render_template('events/index.html', events=user_events)

@app.route('/events/create', methods=['GET', 'POST'])
@login_required
def create_event():
    from models import WeddingEvent
    
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        event_date_str = request.form.get('event_date')
        venue = request.form.get('venue')
        ceremony_type = request.form.get('ceremony_type')
        
        # Parse date string
        event_date = datetime.strptime(event_date_str, '%Y-%m-%d')
        
        # Create new event
        new_event = WeddingEvent(
            title=title,
            description=description,
            event_date=event_date,
            venue=venue,
            ceremony_type=ceremony_type,
            user_id=current_user.id
        )
        
        db.session.add(new_event)
        db.session.commit()
        
        flash('Event created successfully!')
        return redirect(url_for('list_events'))
    
    return render_template('events/create.html')

@app.route('/events/<int:event_id>', methods=['GET'])
@login_required
def view_event(event_id):
    from models import WeddingEvent, Guest, Task, BudgetItem
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to view this event.')
        return redirect(url_for('list_events'))
    
    # Get related data
    guests = Guest.query.filter_by(event_id=event_id).all()
    tasks = Task.query.filter_by(event_id=event_id).all()
    budget_items = BudgetItem.query.filter_by(event_id=event_id).all()
    
    return render_template(
        'events/view.html',
        event=event,
        guests=guests,
        tasks=tasks,
        budget_items=budget_items
    )

@app.route('/events/<int:event_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_event(event_id):
    from models import WeddingEvent
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to edit this event.')
        return redirect(url_for('list_events'))
    
    if request.method == 'POST':
        event.title = request.form.get('title')
        event.description = request.form.get('description')
        event.event_date = datetime.strptime(request.form.get('event_date'), '%Y-%m-%d')
        event.venue = request.form.get('venue')
        event.ceremony_type = request.form.get('ceremony_type')
        
        db.session.commit()
        
        flash('Event updated successfully!')
        return redirect(url_for('view_event', event_id=event_id))
    
    return render_template('events/edit.html', event=event)

@app.route('/events/<int:event_id>/delete', methods=['POST'])
@login_required
def delete_event(event_id):
    from models import WeddingEvent
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to delete this event.')
        return redirect(url_for('list_events'))
    
    db.session.delete(event)
    db.session.commit()
    
    flash('Event deleted successfully!')
    return redirect(url_for('list_events'))

# Guest management routes
@app.route('/events/<int:event_id>/guests', methods=['GET'])
@login_required
def list_guests(event_id):
    from models import WeddingEvent, Guest
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to view this event.')
        return redirect(url_for('list_events'))
    
    guests = Guest.query.filter_by(event_id=event_id).all()
    
    return render_template('guests/index.html', event=event, guests=guests)

@app.route('/events/<int:event_id>/guests/create', methods=['GET', 'POST'])
@login_required
def add_guest(event_id):
    from models import WeddingEvent, Guest
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to modify this event.')
        return redirect(url_for('list_events'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        rsvp_status = request.form.get('rsvp_status', 'pending')
        plus_ones = int(request.form.get('plus_ones', 0))
        notes = request.form.get('notes')
        
        # Create new guest
        new_guest = Guest(
            name=name,
            email=email,
            phone=phone,
            rsvp_status=rsvp_status,
            plus_ones=plus_ones,
            notes=notes,
            event_id=event_id
        )
        
        db.session.add(new_guest)
        db.session.commit()
        
        flash('Guest added successfully!')
        return redirect(url_for('list_guests', event_id=event_id))
    
    return render_template('guests/create.html', event=event)

# Image gallery routes
@app.route('/gallery', methods=['GET'])
@login_required
def user_gallery():
    from models import UserImage, GeneratedImage, TemplateImage
    
    # Get user's uploaded images
    user_images = UserImage.query.filter_by(user_id=current_user.id).all()
    
    # Get user's generated images
    generated_images = GeneratedImage.query.filter_by(user_id=current_user.id).all()
    
    # Get available template images
    template_images = TemplateImage.query.all()
    
    return render_template(
        'gallery/index.html',
        user_images=user_images,
        generated_images=generated_images,
        template_images=template_images
    )

@app.route('/gallery/upload', methods=['GET', 'POST'])
@login_required
def upload_image():
    if request.method == 'POST':
        if 'image' not in request.files:
            flash('No file part')
            return redirect(request.url)
        
        file = request.files['image']
        
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            from models import UserImage
            
            # Save the file
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Get image dimensions
            img = cv2.imread(file_path)
            height, width = img.shape[:2]
            
            # Create database record
            new_image = UserImage(
                filename=filename,
                original_filename=file.filename,
                file_path=file_path,
                file_size=os.path.getsize(file_path),
                file_type=file.content_type,
                width=width,
                height=height,
                user_id=current_user.id,
                is_profile=False
            )
            
            db.session.add(new_image)
            db.session.commit()
            
            flash('Image uploaded successfully!')
            return redirect(url_for('user_gallery'))
    
    return render_template('gallery/upload.html')

# Budget planner routes
@app.route('/events/<int:event_id>/budget', methods=['GET'])
@login_required
def budget_planner(event_id):
    from models import WeddingEvent, BudgetItem, Vendor, EventBudget, CategoryBudget
    from datetime import datetime
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to view this event.')
        return redirect(url_for('list_events'))
    
    # Get budget items
    budget_items = BudgetItem.query.filter_by(event_id=event_id).all()
    
    # Get vendors
    vendors = Vendor.query.all()
    
    # Get event budget
    event_budget = EventBudget.query.filter_by(event_id=event_id).first()
    total_budget = event_budget.total_amount if event_budget else 0
    
    # Calculate totals
    total_spent = sum(item.actual_cost if item.actual_cost else item.estimated_cost for item in budget_items)
    total_paid = sum(item.actual_cost if item.actual_cost and item.payment_status == 'paid' else 0 for item in budget_items)
    total_unpaid = total_spent - total_paid
    remaining = total_budget - total_spent
    
    # Get expense categories
    categories = ['venue', 'catering', 'decor', 'attire', 'photography', 'entertainment', 'transportation', 'gifts', 'beauty', 'accommodation', 'stationery', 'other']
    
    # Calculate category totals
    category_totals = {category: 0 for category in categories}
    
    for item in budget_items:
        if item.category in category_totals:
            category_totals[item.category] += item.actual_cost if item.actual_cost else item.estimated_cost
    
    # Get category budgets
    category_budgets = {category: 0 for category in categories}
    category_budget_objs = CategoryBudget.query.filter_by(event_id=event_id).all()
    
    for cat_budget in category_budget_objs:
        if cat_budget.category in category_budgets:
            category_budgets[cat_budget.category] = cat_budget.allocated_amount
    
    # Category colors for charts
    category_colors = {
        'venue': '126, 87, 194',
        'catering': '40, 167, 69',
        'decor': '220, 53, 69',
        'attire': '255, 193, 7',
        'photography': '23, 162, 184',
        'entertainment': '111, 66, 193',
        'transportation': '13, 110, 253',
        'gifts': '253, 126, 20',
        'beauty': '241, 66, 132',
        'accommodation': '108, 117, 125',
        'stationery': '32, 201, 151',
        'other': '173, 181, 189'
    }
    
    return render_template(
        'budgets/index.html',
        event=event,
        budget_items=budget_items,
        vendors=vendors,
        total_budget=total_budget,
        total_spent=total_spent,
        total_paid=total_paid,
        total_unpaid=total_unpaid,
        remaining=remaining,
        categories=categories,
        category_totals=category_totals,
        category_budgets=category_budgets,
        category_colors=category_colors,
        now=datetime.now()
    )

@app.route('/events/<int:event_id>/budget/set', methods=['POST'])
@login_required
def set_budget(event_id):
    from models import WeddingEvent, EventBudget, CategoryBudget
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to modify this event.')
        return redirect(url_for('list_events'))
    
    total_budget = float(request.form.get('total_budget', 0))
    
    # Get or create the event budget
    event_budget = EventBudget.query.filter_by(event_id=event_id).first()
    if not event_budget:
        event_budget = EventBudget(event_id=event_id, total_amount=total_budget)
        db.session.add(event_budget)
    else:
        event_budget.total_amount = total_budget
    
    # Update category budgets
    for key, value in request.form.items():
        if key.startswith('budget_') and value:
            category = key.replace('budget_', '')
            amount = float(value)
            
            # Get or create the category budget
            category_budget = CategoryBudget.query.filter_by(
                event_id=event_id, 
                category=category
            ).first()
            
            if not category_budget:
                category_budget = CategoryBudget(
                    event_id=event_id,
                    category=category,
                    allocated_amount=amount
                )
                db.session.add(category_budget)
            else:
                category_budget.allocated_amount = amount
    
    db.session.commit()
    
    flash('Budget updated successfully!')
    return redirect(url_for('budget_planner', event_id=event_id))

@app.route('/events/<int:event_id>/budget/add', methods=['POST'])
@login_required
def add_budget_item(event_id):
    from models import WeddingEvent, BudgetItem
    from datetime import datetime
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to modify this event.')
        return redirect(url_for('list_events'))
    
    category = request.form.get('category')
    description = request.form.get('description')
    estimated_cost = float(request.form.get('estimated_cost', 0))
    actual_cost = float(request.form.get('actual_cost', 0)) if request.form.get('actual_cost') else None
    payment_status = request.form.get('payment_status', 'unpaid')
    payment_date = datetime.strptime(request.form.get('payment_date'), '%Y-%m-%d') if request.form.get('payment_date') else None
    vendor_id = int(request.form.get('vendor_id')) if request.form.get('vendor_id') else None
    
    # Create new budget item
    budget_item = BudgetItem(
        category=category,
        description=description,
        estimated_cost=estimated_cost,
        actual_cost=actual_cost,
        payment_status=payment_status,
        payment_date=payment_date,
        event_id=event_id,
        vendor_id=vendor_id
    )
    
    db.session.add(budget_item)
    db.session.commit()
    
    flash('Expense added successfully!')
    return redirect(url_for('budget_planner', event_id=event_id))

@app.route('/events/<int:event_id>/budget/<int:item_id>/edit', methods=['POST'])
@login_required
def edit_budget_item(event_id, item_id):
    from models import WeddingEvent, BudgetItem
    from datetime import datetime
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to modify this event.')
        return redirect(url_for('list_events'))
    
    # Get the budget item
    budget_item = BudgetItem.query.get_or_404(item_id)
    
    # Ensure item belongs to the event
    if budget_item.event_id != event_id:
        flash('This expense does not belong to the selected event.')
        return redirect(url_for('budget_planner', event_id=event_id))
    
    # Update item fields
    budget_item.category = request.form.get('category')
    budget_item.description = request.form.get('description')
    budget_item.estimated_cost = float(request.form.get('estimated_cost', 0))
    budget_item.actual_cost = float(request.form.get('actual_cost', 0)) if request.form.get('actual_cost') else None
    budget_item.payment_status = request.form.get('payment_status', 'unpaid')
    budget_item.payment_date = datetime.strptime(request.form.get('payment_date'), '%Y-%m-%d') if request.form.get('payment_date') else None
    budget_item.vendor_id = int(request.form.get('vendor_id')) if request.form.get('vendor_id') else None
    
    db.session.commit()
    
    flash('Expense updated successfully!')
    return redirect(url_for('budget_planner', event_id=event_id))

@app.route('/events/<int:event_id>/budget/<int:item_id>/delete', methods=['POST'])
@login_required
def delete_budget_item(event_id, item_id):
    from models import WeddingEvent, BudgetItem
    
    event = WeddingEvent.query.get_or_404(event_id)
    
    # Ensure user owns this event
    if event.user_id != current_user.id:
        flash('You do not have permission to modify this event.')
        return redirect(url_for('list_events'))
    
    # Get the budget item
    budget_item = BudgetItem.query.get_or_404(item_id)
    
    # Ensure item belongs to the event
    if budget_item.event_id != event_id:
        flash('This expense does not belong to the selected event.')
        return redirect(url_for('budget_planner', event_id=event_id))
    
    # Delete the item
    db.session.delete(budget_item)
    db.session.commit()
    
    flash('Expense deleted successfully!')
    return redirect(url_for('budget_planner', event_id=event_id))

# Initialize models
with app.app_context():
    # Create all database tables
    db.create_all()
    
    # Initialize face detection model
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
        except Exception as e:
            logger.error(f"Error initializing face swap model: {str(e)}")
            logger.error(traceback.format_exc())
            logger.warning("Continuing in demo mode without face swap capability")
            demo_mode = True
    except Exception as e:
        logger.error(f"Error initializing face detection model: {str(e)}")
        logger.error(traceback.format_exc())
        faceapp = None
        swapper = None
        demo_mode = True
    
    # Print initialization status
    if faceapp and swapper:
        print("All models loaded successfully!")
    else:
        print("Some models failed to load. Check logs for details.")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)