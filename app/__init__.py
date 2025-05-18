import os
from flask import Flask, send_from_directory, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import logging

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    from app.models import User
    return User.query.get(int(user_id))

def create_app():
    app = Flask(__name__, 
                static_folder='static',
                template_folder='templates')
    
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
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('static/results', exist_ok=True)
    os.makedirs('static/images/event_managers', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/dist', exist_ok=True)
    
    # Register blueprints
    try:
        from react_routes import react_bp, api_bp
        app.register_blueprint(react_bp)  # Register React blueprint
        app.register_blueprint(api_bp)  # Register API blueprint
    except ImportError as e:
        logging.warning(f"Could not import React routes: {e}")
    
    # Root route - redirect to React app
    @app.route('/')
    def index():
        return redirect('/react')
    
    # Serve static files
    @app.route('/static/<path:path>')
    def serve_static(path):
        return send_from_directory('static', path)
    
    # Serve React bundle
    @app.route('/dist/<path:path>')
    def serve_dist(path):
        return send_from_directory('static/dist', path)
    
    # Create database tables only if DATABASE_URL is set
    if app.config['SQLALCHEMY_DATABASE_URI']:
        with app.app_context():
            db.create_all()
    
    return app

# Create the app instance
app = create_app() 