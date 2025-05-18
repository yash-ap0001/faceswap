#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install gunicorn explicitly
pip install gunicorn==20.1.0

# Create necessary directories
mkdir -p static/templates
mkdir -p static/results
mkdir -p templates/uploads/sources

# Set permissions
chmod -R 755 static
chmod -R 755 templates 