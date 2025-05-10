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

def download_face_swap_model():
    try:
        model_path = os.path.join('models', 'inswapper_128.onnx')
        os.makedirs('models', exist_ok=True)
        
        if not os.path.exists(model_path):
            logger.info("Downloading face swap model...")
            url = "https://huggingface.co/inswapper/inswapper_128.onnx/resolve/main/inswapper_128.onnx"
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(model_path, 'wb') as f:
                    response.raw.decode_content = True
                    shutil.copyfileobj(response.raw, f)
                logger.info("Face swap model downloaded successfully")
            else:
                raise Exception(f"Failed to download face swap model. Status code: {response.status_code}")
        
        return model_path
    except Exception as e:
        logger.error(f"Error in download_face_swap_model: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize models
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
    
    # Then download and initialize face swap model
    swap_model_path = download_face_swap_model()
    logger.info(f"Face swap model path: {swap_model_path}")
    
    swapper = get_model(swap_model_path, providers=providers)
    logger.info("Face swap model initialized successfully")
    print("All models loaded successfully!")
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
    if faceapp is None or swapper is None:
        return jsonify({'error': 'Models not loaded. Please check server logs.'}), 500

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
        
        # Perform face swap
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
            'result_image': output_filename
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
        'face_swap': swapper is not None
    }
    return jsonify(status)