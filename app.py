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