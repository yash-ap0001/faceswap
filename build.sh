#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install gunicorn explicitly
pip install gunicorn==20.1.0

# Create necessary directories
mkdir -p static/templates
mkdir -p static/results
mkdir -p templates/uploads/sources
mkdir -p static/images/event_managers

# Set permissions
chmod -R 755 static
chmod -R 755 templates

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "FLASK_APP=app.py" > .env
    echo "FLASK_ENV=production" >> .env
    echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
fi

# Initialize database if needed
python -c "
from app import app, db
with app.app_context():
    db.create_all()
" 