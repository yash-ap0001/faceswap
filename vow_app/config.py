import os

# Flask configuration
PORT = 5001
DEBUG = True
SECRET_KEY = os.environ.get("SESSION_SECRET", "vow_bride_app_secret")

# File storage configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'static/results'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

# Template directories
TEMPLATES_BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                 'uploads', 'templates', 'pinterest')

# Model paths relative to main app
FACE_DETECTION_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                        'models', 'buffalo_l')
FACE_SWAP_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                   'models', 'inswapper_128.onnx')