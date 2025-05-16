import cv2
import insightface
from insightface.app import FaceAnalysis
import logging

logger = logging.getLogger(__name__)

# Initialize face detection model
faceapp = None

def initialize_face_detection():
    global faceapp
    if faceapp is None:
        try:
            faceapp = FaceAnalysis(name='buffalo_l')
            faceapp.prepare(ctx_id=0, det_size=(640, 640))
            logger.info("Face detection model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing face detection model: {str(e)}")
            raise

def detect_faces(img):
    """
    Detect faces in an image using InsightFace.
    
    Args:
        img: OpenCV image (numpy array)
        
    Returns:
        List of detected faces or empty list if no faces found
    """
    if faceapp is None:
        initialize_face_detection()
    
    try:
        faces = faceapp.get(img)
        return faces
    except Exception as e:
        logger.error(f"Error detecting faces: {str(e)}")
        return [] 