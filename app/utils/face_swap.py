import cv2
import insightface
from insightface.model_zoo import get_model
import logging

logger = logging.getLogger(__name__)

# Initialize face swap model
swapper = None

def initialize_face_swap():
    global swapper
    if swapper is None:
        try:
            swapper = get_model('inswapper_128.onnx')
            logger.info("Face swap model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing face swap model: {str(e)}")
            raise

def perform_face_swap(source_img, target_img, source_face, target_face):
    """
    Perform face swap between source and target images.
    
    Args:
        source_img: Source image (numpy array)
        target_img: Target image (numpy array)
        source_face: Source face detection result
        target_face: Target face detection result
        
    Returns:
        Result image with swapped face
    """
    if swapper is None:
        initialize_face_swap()
    
    try:
        result = swapper.get(source_img, target_img, source_face, target_face)
        return result
    except Exception as e:
        logger.error(f"Error performing face swap: {str(e)}")
        raise 