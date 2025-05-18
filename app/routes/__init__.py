from flask import Blueprint, request, render_template, redirect, url_for, flash, current_app
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User

# Import blueprints
from app.routes.auth import bp as auth_bp
from app.routes.bridal import bp as bridal_bp
from app.routes.salon import bp as salon_bp
from app.routes.celebrity import bp as celebrity_bp
from app.routes.venue import bp as venue_bp
from app.routes.event_managers import bp as event_managers_bp
from app.routes.react_routes import bp as react_bp

# Create a blueprint for React routes
react_bp = Blueprint('react', __name__)

@react_bp.route('/')
@react_bp.route('/react')
@react_bp.route('/react/<path:path>')
def react_direct(path=None):
    """Serve the React frontend."""
    return render_template('index.html')

# Register blueprints
def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(bridal_bp)
    app.register_blueprint(salon_bp)
    app.register_blueprint(celebrity_bp)
    app.register_blueprint(venue_bp)
    app.register_blueprint(event_managers_bp)
    app.register_blueprint(react_bp)

__all__ = ['auth', 'bridal', 'salon', 'celebrity', 'venue', 'event_managers', 'react_bp'] 