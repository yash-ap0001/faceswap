import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add parent directory to path so we can import from the main app
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# First, import from main app
from app import faceapp, swapper, allowed_file, resize_image_if_needed

# Now we can import our app
from vow_app.app import app

if __name__ == '__main__':
    # Create folders
    os.makedirs(os.path.join(os.path.dirname(__file__), 'uploads'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), 'static', 'results'), exist_ok=True)
    
    # Start the app
    logger.info("Starting VOW-BRIDE standalone app on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)