import os
from flask import Flask, send_from_directory, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    from app.models import User
    return User.query.get(int(user_id))

def create_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    template_dir = os.path.abspath(os.path.join(base_dir, '..', 'templates'))
    static_dir = os.path.abspath(os.path.join(base_dir, '..', 'static'))
    app = Flask(__name__, 
                static_folder=static_dir,
                template_folder=template_dir)
    
    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get("SESSION_SECRET", "development_secret_key")
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config['UPLOAD_FOLDER'] = 'templates/uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize extensions with app
    if app.config['SQLALCHEMY_DATABASE_URI']:
        db.init_app(app)
    login_manager.init_app(app)
    
    # Configure logging
    logging.basicConfig(level=logging.DEBUG)
    
    # Create necessary directories
    try:
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        os.makedirs('static/results', exist_ok=True)
        os.makedirs('static/images/event_managers', exist_ok=True)
        os.makedirs('static/js', exist_ok=True)
        os.makedirs('static/css', exist_ok=True)
        os.makedirs('static/dist', exist_ok=True)
        logger.debug("Created necessary directories")
    except Exception as e:
        logger.error(f"Error creating directories: {str(e)}")
    
    # Register blueprints
    try:
        from react_routes import react_bp, api_bp
        app.register_blueprint(react_bp)  # Register React blueprint
        app.register_blueprint(api_bp)  # Register API blueprint
        logger.debug("Registered React and API blueprints")
    except ImportError as e:
        logger.error(f"Could not import React routes: {str(e)}")
    
    # Root route - redirect to React app
    @app.route('/')
    def index():
        try:
            return redirect('/react')
        except Exception as e:
            logger.error(f"Error in root route: {str(e)}")
            return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    
    # Serve static files
    @app.route('/static/<path:path>')
    def serve_static(path):
        try:
            static_folder = app.static_folder
            if not os.path.exists(os.path.join(static_folder, path)):
                logger.error(f"Static file not found: {path} in {static_folder}")
                return jsonify({
                    "error": "File Not Found",
                    "message": f"Static file {path} not found in {static_folder}"
                }), 404
            return send_from_directory(static_folder, path)
        except Exception as e:
            logger.error(f"Error serving static file {path}: {str(e)}")
            return jsonify({"error": "File Not Found", "message": str(e)}), 404
    
    # Serve React bundle
    @app.route('/dist/<path:path>')
    def serve_dist(path):
        try:
            dist_folder = os.path.join(app.static_folder, 'dist')
            if not os.path.exists(os.path.join(dist_folder, path)):
                logger.error(f"Dist file not found: {path} in {dist_folder}")
                return jsonify({
                    "error": "File Not Found",
                    "message": f"Dist file {path} not found in {dist_folder}"
                }), 404
            return send_from_directory(dist_folder, path)
        except Exception as e:
            logger.error(f"Error serving dist file {path}: {str(e)}")
            return jsonify({"error": "File Not Found", "message": str(e)}), 404
    
    # Create database tables only if DATABASE_URL is set
    if app.config['SQLALCHEMY_DATABASE_URI']:
        try:
            with app.app_context():
                db.create_all()
                logger.debug("Created database tables")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
    
    return app

# Create the app instance
app = create_app() 