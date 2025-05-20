#!/bin/bash

# Create required directories
mkdir -p static/results
mkdir -p static/templates
mkdir -p templates/uploads
mkdir -p templates/uploads/sources
mkdir -p static/images/event_managers

# Set permissions (755 for directories)
chmod -R 755 static
chmod -R 755 templates

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "FLASK_APP=app.py" > .env
    echo "FLASK_ENV=production" >> .env
    echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
fi

echo "Directory setup completed!" 