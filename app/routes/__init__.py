from flask import Blueprint, request, render_template, redirect, url_for, flash, current_app
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User
from app.routes import auth, bridal, salon, celebrity, venue, event_managers

# Create a blueprint for React routes
react_bp = Blueprint('react', __name__)

@react_bp.route('/')
@react_bp.route('/react')
@react_bp.route('/react/<path:path>')
def react_direct(path=None):
    """Serve the React frontend."""
    return render_template('index.html')

__all__ = ['auth', 'bridal', 'salon', 'celebrity', 'venue', 'event_managers', 'react_bp'] 