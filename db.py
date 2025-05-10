import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Create the SQLAlchemy extension
db = SQLAlchemy(model_class=Base)

def init_db_app(app):
    """Initialize the database with the Flask app."""
    # configure the database
    app.config["SQLALCHEMY_DATABASE_URI"] = app.config.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    # initialize the app with the extension
    db.init_app(app)
    
    # Create all tables if they don't exist
    with app.app_context():
        import models  # Import models here to avoid circular imports
        db.create_all()