import os
import logging
import sys
from logging.handlers import RotatingFileHandler

# Configure logging first
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add file handler with rotation
file_handler = RotatingFileHandler('app.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
logger.addHandler(file_handler)

# Also log to console
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(console_handler)

try:
    logger.info("Starting application initialization...")
    from app import app
    
    # Log all registered routes
    logger.info("Registered routes:")
    for rule in app.url_map.iter_rules():
        logger.info(f"{rule.endpoint}: {rule.rule}")
    
    if __name__ == "__main__":
        # Get port from environment variable (Render provides this)
        port = int(os.environ.get('PORT', 5000))
        logger.info(f"Starting application on port {port}")
        # Use 0.0.0.0 to bind to all available network interfaces
        app.run(host='0.0.0.0', port=port)
except Exception as e:
    logger.error(f"Failed to start application: {str(e)}", exc_info=True)
    raise 