#!/bin/bash
# exit on error
set -o errexit

echo "Starting build process..."

# Create necessary directories
echo "Creating directories..."
mkdir -p models
mkdir -p templates/uploads
mkdir -p static/images/event_managers

# Download face detection model
echo "Downloading face detection model..."
curl -L "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip" -o buffalo_l.zip
if [ ! -f "buffalo_l.zip" ]; then
    echo "Error: Failed to download buffalo_l.zip"
    exit 1
fi

echo "Extracting face detection model..."
unzip -o buffalo_l.zip -d models/
if [ ! -d "models/buffalo_l" ]; then
    echo "Error: Failed to extract buffalo_l.zip"
    exit 1
fi
rm buffalo_l.zip

# Download face swap model if not exists
if [ ! -f "models/inswapper_128.onnx" ]; then
    echo "Downloading face swap model..."
    curl -L "https://github.com/deepinsight/insightface/releases/download/v0.7/inswapper_128.onnx" -o models/inswapper_128.onnx
    if [ ! -f "models/inswapper_128.onnx" ]; then
        echo "Error: Failed to download inswapper_128.onnx"
        exit 1
    fi
fi

# Verify model files
echo "Verifying model files..."
if [ ! -f "models/inswapper_128.onnx" ] || [ ! -d "models/buffalo_l" ]; then
    echo "Error: Required model files are missing"
    ls -la models/
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Install Node.js dependencies and build frontend
echo "Installing Node.js dependencies..."
npm install
echo "Building frontend..."
npx webpack --mode production

echo "Build completed successfully!"
echo "Model files present:"
ls -la models/ 