import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, render_template, send_from_directory
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

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

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
    Create a simple visualization of what a face swap would look like.
    This is used when the face swap model cannot be downloaded.
    """
    # Create a simple face blend for demonstration
    result_img = target_img.copy()
    
    # Get the bounding boxes
    x1, y1, x2, y2 = [int(coord) for coord in target_face.bbox]
    
    # Draw a rectangle around the face to indicate where the swap would happen
    cv2.rectangle(result_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    
    # Add text indicating this is a demo
    cv2.putText(
        result_img, 
        "Demo Mode - Model unavailable", 
        (x1, y1-10), 
        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2
    )
    
    return result_img

def download_face_swap_model():
    """
    Download the face swap model from the provided Hugging Face repository.
    """
    try:
        model_path = os.path.join('models', 'inswapper_128.onnx')
        os.makedirs('models', exist_ok=True)
        
        # Clear any existing model file if it's invalid
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
        
        if not os.path.exists(model_path):
            logger.info("Attempting to download face swap model...")
            success = False
            
            # Get Hugging Face token from environment variables
            hf_token = os.environ.get("HUGGINGFACE_TOKEN")
            if not hf_token:
                logger.warning("HUGGINGFACE_TOKEN environment variable not set")
            
            # Use the provided Hugging Face repository
            url = "https://huggingface.co/Olek03282255/faceswap_inswapper128_MVP/resolve/main/inswapper_128.onnx"
            
            # Set up headers
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            # Add authorization if token is available
            if hf_token:
                headers['Authorization'] = f'Bearer {hf_token}'
            
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
                else:
                    logger.warning(f"Failed to download from provided repository, status code: {response.status_code}")
                    logger.warning(f"Response: {response.text}")
            except Exception as e:
                logger.warning(f"Error downloading from provided repository: {str(e)}")
            
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
        
        return jsonify({
            'success': True,
            'result_image': output_filename,
            'demo_mode': demo_mode
        })
        
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        logger.error(traceback.format_exc())
        # Clean up uploaded files in case of error
        if 'source_path' in locals() and os.path.exists(source_path):
            os.remove(source_path)
        if 'target_path' in locals() and os.path.exists(target_path):
            os.remove(target_path)
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
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